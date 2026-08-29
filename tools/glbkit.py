"""Minimal glTF 2.0 / GLB writer plus mesh building helpers.

Geometry is authored with *smoothing groups*: faces that share a position and
a group get one averaged, area-weighted normal, so lofted bodies read as
smooth surfaces while plates and edges stay crisp. Vertex colours (COLOR_0,
unsigned byte) carry the livery, so a single material can be multi-coloured.

No dependencies beyond numpy.
"""

import json
import math
import struct
from collections import defaultdict

import numpy as np

Q = 100000.0  # position quantisation used to weld vertices


def v(*args):
    return np.array(args, dtype=np.float64)


def norm(a):
    n = math.sqrt(float(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]))
    return a / n if n > 1e-12 else np.array([0.0, 1.0, 0.0])


def lerp(a, b, t):
    return a + (b - a) * t


def catmull_rom(p0, p1, p2, p3, t):
    t2 = t * t
    t3 = t2 * t
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
                  + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)


def resample(stations, step):
    """Catmull-Rom resample a list of tuples whose first entry is z."""
    cols = len(stations[0])
    pts = [np.array(s, dtype=np.float64) for s in stations]
    ext = [pts[0] + (pts[0] - pts[1])] + pts + [pts[-1] + (pts[-1] - pts[-2])]
    out = []
    for i in range(len(pts) - 1):
        p0, p1, p2, p3 = ext[i], ext[i + 1], ext[i + 2], ext[i + 3]
        span = abs(p1[0] - p2[0])
        n = max(1, int(round(span / step)))
        for k in range(n):
            out.append(catmull_rom(p0, p1, p2, p3, k / n))
    out.append(pts[-1])
    res = []
    for p in out:
        row = [float(p[j]) for j in range(cols)]
        res.append(tuple(row))
    return res


class Part:
    """A named chunk of geometry bound to one material.

    Vertices carry a UV. Parts that are not texture-mapped point at a flat
    swatch in the atlas, so the same material and image serve both.
    """

    def __init__(self, name, material=0, uv=None):
        self.name = name
        self.material = material
        self.default_uv = uv or (0.0, 0.0)
        self._pos = []
        self._col = []
        self._uv = []
        self._nkey = []          # (quantised position, smoothing group)
        self._first = []         # fallback normal
        self._key = {}
        self._faces = []         # (i0, i1, i2, area-weighted normal)
        self._group = 0

    # -- groups ------------------------------------------------------------
    def group(self):
        """Start a new smoothing group; faces in it blend only with each other."""
        self._group += 1
        return self._group

    def flat(self):
        return self.group()

    # -- vertex pool -------------------------------------------------------
    def _vertex(self, p, color, group, fn, uv):
        qp = (int(round(p[0] * Q)), int(round(p[1] * Q)), int(round(p[2] * Q)))
        c = (max(0, min(255, int(round(color[0] * 255)))),
             max(0, min(255, int(round(color[1] * 255)))),
             max(0, min(255, int(round(color[2] * 255)))))
        quv = (int(round(uv[0] * 65536)), int(round(uv[1] * 65536)))
        key = (qp, c, group, quv)
        i = self._key.get(key)
        if i is None:
            i = len(self._pos)
            self._key[key] = i
            self._pos.append((float(p[0]), float(p[1]), float(p[2])))
            self._col.append(c)
            self._uv.append((float(uv[0]), float(uv[1])))
            self._nkey.append((qp, group))
            self._first.append(fn)
        return i

    # -- primitives --------------------------------------------------------
    def tri(self, a, b, c, color, ref=None, group=None, uvs=None):
        a, b, c = v(*a), v(*b), v(*c)
        n = np.cross(b - a, c - a)
        if float(np.dot(n, n)) < 1e-20:
            return
        uv = list(uvs) if uvs else [self.default_uv] * 3
        if ref is not None and np.dot(n, (a + b + c) / 3.0 - v(*ref)) < 0:
            b, c = c, b
            uv[1], uv[2] = uv[2], uv[1]
            n = -n
        g = self._group if group is None else group
        i0 = self._vertex(a, color, g, n, uv[0])
        i1 = self._vertex(b, color, g, n, uv[1])
        i2 = self._vertex(c, color, g, n, uv[2])
        self._faces.append((i0, i1, i2, n))

    def quad(self, a, b, c, d, color, ref=None, group=None, uvs=None):
        a, b, c, d = v(*a), v(*b), v(*c), v(*d)
        n = np.cross(c - a, d - b)
        if float(np.dot(n, n)) < 1e-20:
            return
        uv = list(uvs) if uvs else [self.default_uv] * 4
        if ref is not None and np.dot(n, (a + b + c + d) / 4.0 - v(*ref)) < 0:
            a, b, c, d = d, c, b, a
            uv = [uv[3], uv[2], uv[1], uv[0]]
            n = -n
        g = self._group if group is None else group
        ia = self._vertex(a, color, g, n, uv[0])
        ib = self._vertex(b, color, g, n, uv[1])
        ic = self._vertex(c, color, g, n, uv[2])
        idd = self._vertex(d, color, g, n, uv[3])
        self._faces.append((ia, ib, ic, n))
        self._faces.append((ia, ic, idd, n))

    def fan(self, ring, apex, color, ref=None, group=None):
        m = len(ring)
        for i in range(m):
            self.tri(apex, ring[i], ring[(i + 1) % m], color, ref, group)

    # -- compound shapes ---------------------------------------------------
    def hexa(self, pts, color, group=None):
        """Box-like solid from 8 corners: 0-3 bottom loop, 4-7 top loop."""
        pts = [v(*p) for p in pts]
        ctr = np.mean(np.array(pts), axis=0)
        g = self.flat() if group is None else group
        self.quad(pts[0], pts[1], pts[2], pts[3], color, ctr, self.flat())
        self.quad(pts[4], pts[5], pts[6], pts[7], color, ctr, self.flat())
        for i in range(4):
            j = (i + 1) % 4
            self.quad(pts[i], pts[j], pts[j + 4], pts[i + 4], color, ctr,
                      self.flat())

    def box(self, lo, hi, color):
        x0, y0, z0 = lo
        x1, y1, z1 = hi
        self.hexa([
            (x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1),
            (x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1),
        ], color)

    def loft(self, rings, color_fn, cap_front=True, cap_back=True,
             cap_color=None, group=None, uv_fn=None):
        """Skin a sequence of equal-length rings, front to back.

        `color_fn(centroid, u)` also receives the position around the section
        as u in [0,1). Colour splits expressed as a constant u (or a constant
        ring) land exactly on mesh edges, so the livery has no stair-steps.
        """
        g = self.group() if group is None else group
        for s in range(len(rings) - 1):
            ra, rb = rings[s], rings[s + 1]
            ca = np.mean(np.array([v(*p) for p in ra]), axis=0)
            cb = np.mean(np.array([v(*p) for p in rb]), axis=0)
            ref = (ca + cb) / 2.0
            m = len(ra)
            ns = len(rings)
            for i in range(m):
                j = (i + 1) % m
                a, b, c, d = ra[i], ra[j], rb[j], rb[i]
                ctr = (v(*a) + v(*b) + v(*c) + v(*d)) / 4.0
                uvs = None
                if uv_fn is not None:
                    # i + 1 is deliberately not wrapped: the seam column needs
                    # u = 1 rather than u = 0, which splits it into its own
                    # vertices and stops the texture smearing across the seam.
                    uvs = (uv_fn(i, m, s, ns), uv_fn(i + 1, m, s, ns),
                           uv_fn(i + 1, m, s + 1, ns), uv_fn(i, m, s + 1, ns))
                self.quad(a, b, c, d, color_fn(ctr, (i + 0.5) / m), ref, g, uvs)
        for do_cap, ring, nbr in ((cap_front, rings[0], rings[1]),
                                  (cap_back, rings[-1], rings[-2])):
            if not do_cap:
                continue
            ctr = np.mean(np.array([v(*p) for p in ring]), axis=0)
            inner = np.mean(np.array([v(*p) for p in nbr]), axis=0)
            self.fan(ring, ctr, cap_color or color_fn(ctr, 0.0), inner, g)

    def revolve(self, profile, color, axis_x=0.0, centre=(0.0, 0.0),
                segments=48, close_lo=False, close_hi=False, group=None):
        """Revolve a (x, radius) profile around the X axis.

        `centre` is the (y, z) of the axis; the profile runs from one side of
        the wheel to the other. Returns nothing."""
        g = self.group() if group is None else group
        cy, cz = centre
        rings = []
        for (px, pr) in profile:
            ring = []
            for i in range(segments):
                t = 2 * math.pi * i / segments
                ring.append((axis_x + px, cy + pr * math.sin(t),
                             cz + pr * math.cos(t)))
            rings.append(ring)
        for s in range(len(rings) - 1):
            xa = axis_x + profile[s][0]
            xb = axis_x + profile[s + 1][0]
            ref = ((xa + xb) / 2.0, cy, cz)
            for i in range(segments):
                j = (i + 1) % segments
                self.quad(rings[s][i], rings[s][j], rings[s + 1][j],
                          rings[s + 1][i], color, ref, g)
        if close_lo:
            apex = (axis_x + profile[0][0], cy, cz)
            self.fan(rings[0], apex, color,
                     (axis_x + profile[1][0], cy, cz), self.flat())
        if close_hi:
            apex = (axis_x + profile[-1][0], cy, cz)
            self.fan(rings[-1], apex, color,
                     (axis_x + profile[-2][0], cy, cz), self.flat())

    def extrude(self, poly, x0, x1, color, group=None, caps=True):
        """Extrude a closed (z, y) polygon between two X planes."""
        g = self.flat() if group is None else group
        ctr_z = sum(p[0] for p in poly) / len(poly)
        ctr_y = sum(p[1] for p in poly) / len(poly)
        ref = ((x0 + x1) / 2.0, ctr_y, ctr_z)
        m = len(poly)
        for i in range(m):
            j = (i + 1) % m
            a = (x0, poly[i][1], poly[i][0])
            b = (x0, poly[j][1], poly[j][0])
            c = (x1, poly[j][1], poly[j][0])
            d = (x1, poly[i][1], poly[i][0])
            self.quad(a, b, c, d, color, ref, g)
        if caps:
            for x in (x0, x1):
                ring = [(x, p[1], p[0]) for p in poly]
                self.fan(ring, (x, ctr_y, ctr_z), color, ref, self.flat())

    def tube(self, p0, p1, r0, r1, color, segments=10, caps=True, up=None):
        """A tapered cylinder between two points."""
        p0, p1 = v(*p0), v(*p1)
        axis = norm(p1 - p0)
        ref = v(0.0, 1.0, 0.0) if up is None else v(*up)
        if abs(float(np.dot(axis, ref))) > 0.95:
            ref = v(1.0, 0.0, 0.0)
        u = norm(np.cross(axis, ref))
        w = norm(np.cross(axis, u))
        g = self.group()
        ra, rb = [], []
        for i in range(segments):
            t = 2 * math.pi * i / segments
            off = u * math.cos(t) + w * math.sin(t)
            ra.append(p0 + off * r0)
            rb.append(p1 + off * r1)
        for i in range(segments):
            j = (i + 1) % segments
            mid = (ra[i] + ra[j] + rb[i] + rb[j]) / 4.0
            axpt = p0 + axis * float(np.dot(mid - p0, axis))
            self.quad(ra[i], ra[j], rb[j], rb[i], color, axpt, g)
        if caps:
            self.fan(ra, p0, color, p0 + axis * 0.01, self.flat())
            self.fan(rb, p1, color, p1 - axis * 0.01, self.flat())

    # -- export ------------------------------------------------------------
    def arrays(self):
        acc = defaultdict(lambda: np.zeros(3))
        for (i0, i1, i2, n) in self._faces:
            acc[self._nkey[i0]] += n
            acc[self._nkey[i1]] += n
            acc[self._nkey[i2]] += n
        normals = np.zeros((len(self._pos), 3), dtype=np.float32)
        for i, key in enumerate(self._nkey):
            a = acc[key]
            if float(np.dot(a, a)) < 1e-18:
                a = self._first[i]
            normals[i] = norm(a)
        pos = np.array(self._pos, dtype=np.float32)
        col = np.full((len(self._pos), 4), 255, dtype=np.uint8)
        col[:, 0:3] = np.array(self._col, dtype=np.uint8)
        uv = np.array(self._uv, dtype=np.float32)
        idx = np.array([[f[0], f[1], f[2]] for f in self._faces],
                       dtype=np.uint32).reshape(-1)
        return pos, normals, col, uv, idx

    def __len__(self):
        return len(self._faces)


def write_glb(parts, materials, path, generator="megh4tech f1 generator",
              extensions_used=(), texture_png=None):
    buf = bytearray()
    views, accessors, meshes, nodes = [], [], [], []

    def add_view(data, target):
        while len(buf) % 4:
            buf.append(0)
        offset = len(buf)
        buf.extend(data)
        view = {"buffer": 0, "byteOffset": offset, "byteLength": len(data)}
        if target is not None:
            view["target"] = target
        views.append(view)
        return len(views) - 1

    def add_accessor(view, ctype, count, atype, mn=None, mx=None,
                     normalized=False):
        acc = {"bufferView": view, "componentType": ctype,
               "count": int(count), "type": atype}
        if normalized:
            acc["normalized"] = True
        if mn is not None:
            acc["min"] = mn
            acc["max"] = mx
        accessors.append(acc)
        return len(accessors) - 1

    for part in parts:
        if len(part) == 0:
            continue
        pos, nrm, col, uv, idx = part.arrays()
        vp = add_view(pos.tobytes(), 34962)
        vn = add_view(nrm.tobytes(), 34962)
        vc = add_view(col.tobytes(), 34962)
        vt = add_view(uv.tobytes(), 34962)
        vi = add_view(idx.tobytes(), 34963)
        ap = add_accessor(vp, 5126, len(pos), "VEC3",
                          pos.min(axis=0).tolist(), pos.max(axis=0).tolist())
        an = add_accessor(vn, 5126, len(nrm), "VEC3")
        ac = add_accessor(vc, 5121, len(col), "VEC4", normalized=True)
        at = add_accessor(vt, 5126, len(uv), "VEC2")
        ai = add_accessor(vi, 5125, len(idx), "SCALAR")
        meshes.append({
            "name": part.name,
            "primitives": [{
                "attributes": {"POSITION": ap, "NORMAL": an, "COLOR_0": ac,
                               "TEXCOORD_0": at},
                "indices": ai, "material": part.material, "mode": 4,
            }],
        })
        nodes.append({"name": part.name, "mesh": len(meshes) - 1})

    images, samplers, textures = [], [], []
    if texture_png is not None:
        iv = add_view(texture_png, None)
        images.append({"bufferView": iv, "mimeType": "image/png",
                       "name": "atlas"})
        samplers.append({"magFilter": 9729, "minFilter": 9987,
                         "wrapS": 33071, "wrapT": 33071})
        textures.append({"sampler": 0, "source": 0})
        for m in materials:
            m.setdefault("pbrMetallicRoughness", {})["baseColorTexture"] = {
                "index": 0}

    gltf = {
        "asset": {"version": "2.0", "generator": generator},
        "scene": 0,
        "scenes": [{"name": "Scene", "nodes": list(range(len(nodes)))}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
        "accessors": accessors,
        "bufferViews": views,
        "buffers": [{"byteLength": len(buf)}],
    }
    if images:
        gltf["images"] = images
        gltf["samplers"] = samplers
        gltf["textures"] = textures
    if extensions_used:
        gltf["extensionsUsed"] = list(extensions_used)

    js = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    js += b" " * ((4 - len(js) % 4) % 4)
    bin_ = bytes(buf) + b"\0" * ((4 - len(buf) % 4) % 4)

    total = 12 + 8 + len(js) + 8 + len(bin_)
    with open(path, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total))
        f.write(struct.pack("<II", len(js), 0x4E4F534A))
        f.write(js)
        f.write(struct.pack("<II", len(bin_), 0x004E4942))
        f.write(bin_)
    return total
