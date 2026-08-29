"""Render orthographic preview images of a GLB with matplotlib (verification aid).

    python tools/preview_glb.py [model.glb] [out.png]
"""

import json
import os
import struct
import sys

import numpy as np

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.collections import PolyCollection  # noqa: E402

COMPONENT = {5121: np.uint8, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NUMCOMP = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}


def read_glb(path):
    data = open(path, "rb").read()
    magic, version, _ = struct.unpack_from("<III", data, 0)
    assert magic == 0x46546C67 and version == 2, "not a glTF 2.0 binary"
    off, js, bin_ = 12, None, None
    while off < len(data):
        clen, ctype = struct.unpack_from("<II", data, off)
        chunk = data[off + 8: off + 8 + clen]
        if ctype == 0x4E4F534A:
            js = json.loads(chunk.decode("utf-8"))
        elif ctype == 0x004E4942:
            bin_ = chunk
        off += 8 + clen
    return js, bin_


def accessor(g, bin_, i):
    acc = g["accessors"][i]
    bv = g["bufferViews"][acc["bufferView"]]
    dtype = COMPONENT[acc["componentType"]]
    n = NUMCOMP[acc["type"]]
    start = bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
    arr = np.frombuffer(bin_, dtype=dtype, count=acc["count"] * n, offset=start)
    return arr.reshape(acc["count"], n) if n > 1 else arr


def quad_normals(faces, nrm):
    """Per-triangle shading normal.

    Matplotlib can only flat-shade a polygon, so the two triangles of a quad
    would get slightly different averaged normals and the surface reads as
    scales. The writer emits quads as consecutive (a,b,c),(a,c,d) pairs, so
    detect those and give both halves the mean of all four vertex normals —
    much closer to what a GPU does when it interpolates per fragment.
    """
    out = nrm[faces].mean(axis=1)
    for i in range(0, len(faces) - 1, 2):
        a, b = faces[i], faces[i + 1]
        shared = np.intersect1d(a, b)
        if len(shared) == 2:
            quad = np.union1d(a, b)
            m = nrm[quad].mean(axis=0)
            out[i] = m
            out[i + 1] = m
    return out


def collect(path):
    g, bin_ = read_glb(path)
    tris, cols, nrms, names = [], [], [], []
    for mesh in g["meshes"]:
        for prim in mesh["primitives"]:
            pos = accessor(g, bin_, prim["attributes"]["POSITION"]).astype(np.float64)
            col = accessor(g, bin_, prim["attributes"]["COLOR_0"]).astype(np.float64)
            nrm = accessor(g, bin_, prim["attributes"]["NORMAL"]).astype(np.float64)
            if g["accessors"][prim["attributes"]["COLOR_0"]].get("normalized"):
                col = col / 255.0
            idx = accessor(g, bin_, prim["indices"]).astype(np.int64)
            f = idx.reshape(-1, 3)
            tris.append(pos[f])
            cols.append(col[f][:, 0, :3])
            nrms.append(quad_normals(f, nrm))
            names.append(mesh["name"])
    return (np.concatenate(tris), np.concatenate(cols),
            np.concatenate(nrms), g, names)


def render(ax, tris, cols, vnrm, eye, title):
    eye = np.array(eye, dtype=np.float64)
    fwd = -eye / np.linalg.norm(eye)
    up = np.array([0.0, 1.0, 0.0])
    right = np.cross(fwd, up)
    right /= np.linalg.norm(right)
    up = np.cross(right, fwd)

    ctr = tris.reshape(-1, 3).mean(axis=0)
    p = tris - ctr
    x = p @ right
    y = p @ up
    depth = (p @ fwd).mean(axis=1)

    ln = np.linalg.norm(vnrm, axis=1, keepdims=True)
    n = vnrm / np.where(ln == 0, 1, ln)
    key = np.array([0.45, 0.80, 0.42])
    key /= np.linalg.norm(key)
    fill = np.array([-0.55, 0.30, -0.60])
    fill /= np.linalg.norm(fill)
    lam = np.clip(n @ key, 0, 1)
    lam2 = np.clip(n @ fill, 0, 1)
    spec = np.clip(n @ key, 0, 1) ** 6
    rim = np.clip(1.0 - np.abs(n @ fwd), 0, 1) ** 4
    shade = (0.26 + 0.60 * lam + 0.16 * lam2)[:, None]
    rgb = np.clip(cols * shade + 0.18 * spec[:, None] + 0.10 * rim[:, None],
                  0, 1)

    order = np.argsort(depth)[::-1]
    polys = np.stack([x, y], axis=2)[order]
    pc = PolyCollection(polys, facecolors=rgb[order], edgecolors=rgb[order],
                        linewidths=0.10)
    ax.add_collection(pc)
    lim = max(np.abs(x).max(), np.abs(y).max()) * 1.06
    ax.set_xlim(-lim, lim)
    ax.set_ylim(-lim, lim)
    ax.set_aspect("equal")
    ax.set_facecolor("#26282b")
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title(title, color="#dddddd", fontsize=9)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "public/models/mclaren-mp4-4.glb"
    out = sys.argv[2] if len(sys.argv) > 2 else "preview.png"
    tris, cols, vnrm, g, names = collect(src)
    views = [
        ((5.0, 3.0, 6.5), "front 3/4"),
        ((-5.5, 3.2, -5.0), "rear 3/4"),
        ((9.0, 0.9, 0.6), "side"),
        ((0.4, 9.0, 0.5), "top"),
    ]
    only = sys.argv[3] if len(sys.argv) > 3 else None
    if only:
        views = [v for v in views if v[1] == only] or [((9.0, 0.9, 0.6), only)]
        fig, ax = plt.subplots(figsize=(10, 10), facecolor="#1b1c1e")
        render(ax, tris, cols, vnrm, views[0][0], views[0][1])
        fig.tight_layout()
        fig.savefig(out, dpi=130, facecolor="#1b1c1e")
        print("wrote", os.path.abspath(out))
        return
    fig, axes = plt.subplots(2, 2, figsize=(13, 9), facecolor="#1b1c1e")
    for ax, (eye, title) in zip(axes.ravel(), views):
        render(ax, tris, cols, vnrm, eye, title)
    fig.tight_layout()
    fig.savefig(out, dpi=110, facecolor="#1b1c1e")
    lo = tris.reshape(-1, 3).min(axis=0)
    hi = tris.reshape(-1, 3).max(axis=0)
    print(f"{len(tris)} triangles, {len(g['meshes'])} meshes")
    print(f"bounds  x[{lo[0]:.2f},{hi[0]:.2f}]  "
          f"y[{lo[1]:.2f},{hi[1]:.2f}]  z[{lo[2]:.2f},{hi[2]:.2f}]")
    print("wrote", os.path.abspath(out))


if __name__ == "__main__":
    main()
