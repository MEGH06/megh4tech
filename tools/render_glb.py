"""Render a GLB with a small software rasteriser (numpy + PIL).

Unlike preview_glb.py, this interpolates the vertex normals per pixel, so what
you see matches what a GPU viewer shows: smooth shading, specular highlights,
a clear-coat sheen and a soft contact shadow on the floor.

    python tools/render_glb.py [model.glb] [out.png] [view]

Views: hero, front, rear, side, top, sheet (all four, default).
"""

import math
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from preview_glb import accessor, read_glb  # noqa: E402

# material index -> (specular strength, shininess, sheen)
SURFACE = {
    0: (0.55, 90.0, 0.35),      # clear-coated paint
    1: (0.10, 14.0, 0.02),      # rubber
    2: (0.30, 45.0, 0.12),      # carbon
    3: (0.85, 130.0, 0.20),     # metal
}


def load(path):
    g, bin_ = read_glb(path)
    P, N, C, T, M = [], [], [], [], []
    for mesh in g["meshes"]:
        for prim in mesh["primitives"]:
            attrs = prim["attributes"]
            pos = accessor(g, bin_, attrs["POSITION"]).astype(np.float32)
            nrm = accessor(g, bin_, attrs["NORMAL"]).astype(np.float32)
            col = accessor(g, bin_, attrs["COLOR_0"]).astype(np.float32)
            if g["accessors"][attrs["COLOR_0"]].get("normalized"):
                col = col / 255.0
            f = accessor(g, bin_, prim["indices"]).astype(np.int64).reshape(-1, 3)
            if "TEXCOORD_0" in attrs:
                uv = accessor(g, bin_, attrs["TEXCOORD_0"]).astype(np.float32)
            else:
                uv = np.zeros((len(pos), 2), dtype=np.float32)
            P.append(pos[f])
            N.append(nrm[f])
            C.append(col[f][:, :, :3])
            T.append(uv[f])
            M.append(np.full(len(f), prim.get("material", 0), dtype=np.int32))

    tex = None
    if g.get("images"):
        import io
        bv = g["bufferViews"][g["images"][0]["bufferView"]]
        start = bv.get("byteOffset", 0)
        raw = bin_[start:start + bv["byteLength"]]
        # glTF stores baseColorTexture as sRGB. Shading happens in linear
        # light and tonemap() re-encodes at the end, so it has to be decoded
        # here — otherwise every albedo is gamma-boosted twice and the whole
        # car washes out (tomato reads as salmon).
        tex = np.asarray(Image.open(io.BytesIO(raw)).convert("RGB"),
                         dtype=np.float32) / 255.0
        tex = tex ** 2.2
    return (np.concatenate(P), np.concatenate(N), np.concatenate(C),
            np.concatenate(T), np.concatenate(M), tex)


def look_at(eye, target, up=(0.0, 1.0, 0.0)):
    eye = np.array(eye, dtype=np.float64)
    fwd = np.array(target, dtype=np.float64) - eye
    fwd /= np.linalg.norm(fwd)
    right = np.cross(fwd, np.array(up, dtype=np.float64))
    right /= np.linalg.norm(right)
    upv = np.cross(right, fwd)
    return eye, np.stack([right, upv, -fwd])      # rows of the view basis


def shadow_map(P, res=320, pad=0.35):
    """Top-down occupancy of the car, blurred, used as a contact shadow."""
    pts = P.reshape(-1, 3)
    lo = pts[:, [0, 2]].min(axis=0) - pad
    hi = pts[:, [0, 2]].max(axis=0) + pad
    grid = np.zeros((res, res), dtype=np.float32)
    # weight by height: bodywork close to the ground casts a darker patch
    w = np.clip(1.0 - pts[:, 1] / 0.9, 0.05, 1.0)
    gx = ((pts[:, 0] - lo[0]) / (hi[0] - lo[0]) * (res - 1)).astype(np.int32)
    gz = ((pts[:, 2] - lo[1]) / (hi[1] - lo[1]) * (res - 1)).astype(np.int32)
    np.add.at(grid, (gz, gx), w)
    grid = np.clip(grid, 0, 3.0) / 3.0
    for _ in range(4):                            # cheap separable box blur
        k = np.ones(9, dtype=np.float32) / 9.0
        grid = np.apply_along_axis(
            lambda m: np.convolve(m, k, mode="same"), 0, grid)
        grid = np.apply_along_axis(
            lambda m: np.convolve(m, k, mode="same"), 1, grid)
    grid /= max(grid.max(), 1e-6)
    return grid, lo, hi


def rasterise(P, N, C, T, M, eye, basis, fov, W, H):
    """Fill a G-buffer: world position, normal, albedo, material, coverage."""
    verts = P.reshape(-1, 3).astype(np.float64)
    view = (verts - eye) @ basis.T
    depth = -view[:, 2]
    f = 1.0 / math.tan(math.radians(fov) / 2.0)
    aspect = W / H
    with np.errstate(divide="ignore", invalid="ignore"):
        sx = (view[:, 0] / depth * (f / aspect) * 0.5 + 0.5) * W
        sy = (1.0 - (view[:, 1] / depth * f * 0.5 + 0.5)) * H
    sx = sx.reshape(-1, 3)
    sy = sy.reshape(-1, 3)
    dep = depth.reshape(-1, 3)

    gpos = np.zeros((H, W, 3), dtype=np.float32)
    gnrm = np.zeros((H, W, 3), dtype=np.float32)
    galb = np.zeros((H, W, 3), dtype=np.float32)
    guv = np.zeros((H, W, 2), dtype=np.float32)
    gmat = np.zeros((H, W), dtype=np.int32)
    zbuf = np.full((H, W), np.inf, dtype=np.float32)

    ok = (dep > 0.05).all(axis=1)
    x0 = np.floor(sx.min(axis=1)).astype(np.int64)
    x1 = np.ceil(sx.max(axis=1)).astype(np.int64)
    y0 = np.floor(sy.min(axis=1)).astype(np.int64)
    y1 = np.ceil(sy.max(axis=1)).astype(np.int64)
    ok &= (x1 >= 0) & (x0 < W) & (y1 >= 0) & (y0 < H)
    x0 = np.clip(x0, 0, W - 1)
    x1 = np.clip(x1, 0, W - 1)
    y0 = np.clip(y0, 0, H - 1)
    y1 = np.clip(y1, 0, H - 1)

    for t in np.nonzero(ok)[0]:
        ax, bx, cx = sx[t]
        ay, by, cy = sy[t]
        area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay)
        if abs(area) < 1e-9:
            continue
        xs = np.arange(x0[t], x1[t] + 1) + 0.5
        ys = np.arange(y0[t], y1[t] + 1) + 0.5
        if xs.size == 0 or ys.size == 0:
            continue
        px = xs[None, :]
        py = ys[:, None]
        w0 = ((bx - ax) * (py - ay) - (px - ax) * (by - ay)) / area
        w1 = ((px - ax) * (cy - ay) - (cx - ax) * (py - ay)) / area
        u = 1.0 - w0 - w1
        inside = (u >= 0) & (w0 >= 0) & (w1 >= 0)
        if not inside.any():
            continue
        iz = np.stack([u, w1, w0]) / dep[t][:, None, None]
        wsum = iz.sum(axis=0)
        bary = iz / wsum
        z = 1.0 / wsum
        yy, xx = np.nonzero(inside)
        zz = z[yy, xx]
        gy = yy + y0[t]
        gx = xx + x0[t]
        better = zz < zbuf[gy, gx]
        if not better.any():
            continue
        gy, gx = gy[better], gx[better]
        bb = bary[:, yy[better], xx[better]]
        zbuf[gy, gx] = zz[better]
        gpos[gy, gx] = (bb.T @ P[t]).astype(np.float32)
        gnrm[gy, gx] = (bb.T @ N[t]).astype(np.float32)
        galb[gy, gx] = (bb.T @ C[t]).astype(np.float32)
        guv[gy, gx] = (bb.T @ T[t]).astype(np.float32)
        gmat[gy, gx] = M[t]
    return gpos, gnrm, galb, guv, gmat, zbuf


def environment(d):
    """A cheap studio environment sampled along a direction.

    Sky gradient, warm floor bounce, and two soft boxes — enough for the
    clear coat to pick up something to reflect.
    """
    y = d[:, :, 1:2]
    up = np.clip(y, 0, 1)
    down = np.clip(-y, 0, 1)
    zenith = np.array([0.30, 0.36, 0.46])
    horizon = np.array([0.52, 0.54, 0.58])
    floor = np.array([0.10, 0.10, 0.11])
    env = horizon * (1 - up ** 0.55) + zenith * up ** 0.55
    env = env * (1 - down ** 0.5) + floor * down ** 0.5

    for direction, size, power in (((0.42, 0.80, 0.43), 0.28, 1.30),
                                   ((-0.60, 0.55, -0.45), 0.55, 0.40)):
        ld = np.array(direction)
        ld = ld / np.linalg.norm(ld)
        cone = np.clip(np.sum(d * ld, axis=2, keepdims=True), 0, 1)
        env = env + power * np.clip((cone - (1 - size)) / size, 0, 1) ** 2
    return env


def sample(tex, uv):
    """Bilinear texture lookup, clamped at the edges (the atlas has no wrap)."""
    th, tw = tex.shape[:2]
    x = np.clip(uv[:, :, 0] * tw - 0.5, 0, tw - 1)
    y = np.clip(uv[:, :, 1] * th - 0.5, 0, th - 1)
    x0 = np.floor(x).astype(np.int32)
    y0 = np.floor(y).astype(np.int32)
    x1 = np.minimum(x0 + 1, tw - 1)
    y1 = np.minimum(y0 + 1, th - 1)
    fx = (x - x0)[:, :, None]
    fy = (y - y0)[:, :, None]
    top = tex[y0, x0] * (1 - fx) + tex[y0, x1] * fx
    bot = tex[y1, x0] * (1 - fx) + tex[y1, x1] * fx
    return top * (1 - fy) + bot * fy


def shade(gpos, gnrm, galb, guv, gmat, zbuf, eye, basis, fov, shadow, tex,
          W, H):
    covered = np.isfinite(zbuf)
    n = gnrm.astype(np.float64)
    ln = np.linalg.norm(n, axis=2, keepdims=True)
    n = n / np.where(ln < 1e-9, 1.0, ln)
    vdir = eye[None, None, :] - gpos
    vdir /= np.maximum(np.linalg.norm(vdir, axis=2, keepdims=True), 1e-9)
    n = np.where((np.sum(n * vdir, axis=2, keepdims=True) < 0), -n, n)

    key = np.array([0.42, 0.80, 0.43])
    key /= np.linalg.norm(key)
    fill = np.array([-0.62, 0.35, -0.55])
    fill /= np.linalg.norm(fill)

    sky = np.array([0.46, 0.51, 0.60])
    ground = np.array([0.09, 0.09, 0.10])
    hemi = 0.5 + 0.5 * n[:, :, 1:2]
    ambient = sky * hemi + ground * (1 - hemi)

    base = galb if tex is None else galb * sample(tex, guv)
    diff = np.clip(n @ key, 0, 1)[:, :, None]
    diff2 = np.clip(n @ fill, 0, 1)[:, :, None]
    lit = base * (0.26 * ambient + 1.30 * diff ** 1.25 + 0.24 * diff2)

    spec_s = np.zeros((H, W, 1))
    shine = np.zeros((H, W, 1))
    sheen = np.zeros((H, W, 1))
    for m, (s, sh, sn) in SURFACE.items():
        sel = (gmat == m)[:, :, None]
        spec_s = np.where(sel, s, spec_s)
        shine = np.where(sel, sh, shine)
        sheen = np.where(sel, sn, sheen)

    half = key[None, None, :] + vdir
    half /= np.maximum(np.linalg.norm(half, axis=2, keepdims=True), 1e-9)
    spec = np.clip(np.sum(n * half, axis=2, keepdims=True), 0, 1) ** shine
    ndv = np.clip(np.sum(n * vdir, axis=2, keepdims=True), 0, 1)
    fres = (1.0 - ndv) ** 4

    # Environment reflection. Without it, clear-coated paint reads as matte
    # plastic — an image-based environment is most of what makes a viewer
    # like Sketchfab look "finished".
    refl = 2.0 * ndv * n - vdir
    env = environment(refl)
    schlick = 0.045 + 0.955 * (1.0 - ndv) ** 5
    col = (lit + spec_s * spec
           + env * spec_s * schlick
           + sheen * fres * np.array([0.85, 0.88, 0.95]))

    # ---- floor: ray-plane intersection for every uncovered pixel
    f = 1.0 / math.tan(math.radians(fov) / 2.0)
    aspect = W / H
    xs = (np.arange(W) + 0.5) / W * 2 - 1
    ys = 1 - (np.arange(H) + 0.5) / H * 2
    dx = xs[None, :] * aspect / f
    dy = ys[:, None] / f
    dirs = (np.stack([np.broadcast_to(dx, (H, W)),
                      np.broadcast_to(dy, (H, W)),
                      -np.ones((H, W))], axis=2)) @ basis
    dirs /= np.linalg.norm(dirs, axis=2, keepdims=True)
    with np.errstate(divide="ignore", invalid="ignore"):
        t = -eye[1] / dirs[:, :, 1]
    hit = (t > 0) & np.isfinite(t) & (~covered)
    fx = eye[0] + dirs[:, :, 0] * np.where(hit, t, 0)
    fz = eye[2] + dirs[:, :, 2] * np.where(hit, t, 0)
    dist = np.sqrt(fx ** 2 + fz ** 2)

    grid, lo, hi = shadow
    res = grid.shape[0]
    gx = np.clip(((fx - lo[0]) / (hi[0] - lo[0]) * (res - 1)), 0, res - 1)
    gz = np.clip(((fz - lo[1]) / (hi[1] - lo[1]) * (res - 1)), 0, res - 1)
    inbox = (fx > lo[0]) & (fx < hi[0]) & (fz > lo[1]) & (fz < hi[1])
    occ = grid[gz.astype(np.int32), gx.astype(np.int32)] * inbox
    floor_base = np.array([0.175, 0.180, 0.192])
    fade = np.clip(1.0 - (dist / 7.5) ** 2, 0.0, 1.0)[:, :, None]
    floor = floor_base * (0.30 + 0.70 * fade)
    floor = floor * (1.0 - 0.88 * occ[:, :, None])

    # ---- vignetted studio backdrop
    vy = np.clip((np.arange(H) / H)[:, None], 0, 1)
    back = (np.array([0.125, 0.132, 0.150]) * (1 - vy)
            + np.array([0.052, 0.055, 0.064]) * vy)
    back = np.broadcast_to(back[:, None, :], (H, W, 3)).copy()
    # blend the floor into the backdrop so the horizon is not a hard seam
    blend = np.clip((dist - 4.5) / 6.0, 0.0, 1.0)[:, :, None]
    floor = floor * (1 - blend) + back * blend

    out = np.where(covered[:, :, None], col,
                   np.where(hit[:, :, None], floor, back))
    return np.clip(out, 0, None)


def tonemap(img):
    img = img * 1.05
    img = img / (1.0 + img * 0.55)           # gentle filmic roll-off
    return np.clip(img, 0, 1) ** (1 / 2.2)


UP = (0.0, 1.0, 0.0)
VIEWS = {
    "hero": ((3.55, 1.42, 5.05), (0.0, 0.40, 0.15), 26.0, UP),
    "front": ((2.30, 1.05, 6.10), (0.0, 0.38, 0.35), 24.0, UP),
    "rear": ((-4.55, 1.70, -4.60), (0.0, 0.44, -0.40), 26.0, UP),
    "side": ((11.5, 0.72, 0.28), (0.0, 0.40, 0.12), 26.0, UP),
    "top": ((0.02, 9.20, 0.10), (0.0, 0.28, 0.06), 30.0, (0.0, 0.0, -1.0)),
}


def render_view(data, shadow, name, W, H, ss=2):
    P, N, C, T, M, tex = data
    eye, target, fov, up = VIEWS[name]
    eye, basis = look_at(eye, target, up)
    w, h = W * ss, H * ss
    g = rasterise(P, N, C, T, M, eye, basis, fov, w, h)
    img = shade(*g, eye, basis, fov, shadow, tex, w, h)
    img = tonemap(img)
    img = img.reshape(H, ss, W, ss, 3).mean(axis=(1, 3))
    return (img * 255).astype(np.uint8)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "public/models/mclaren-mp4-4.glb"
    out = sys.argv[2] if len(sys.argv) > 2 else "render.png"
    view = sys.argv[3] if len(sys.argv) > 3 else "sheet"
    data = load(src)
    shadow = shadow_map(data[0])
    print(f"{len(data[0])} triangles")
    if view == "sheet":
        tiles = [render_view(data, shadow, v, 620, 460)
                 for v in ("hero", "rear", "side", "top")]
        top = np.concatenate([tiles[0], tiles[1]], axis=1)
        bot = np.concatenate([tiles[2], tiles[3]], axis=1)
        img = np.concatenate([top, bot], axis=0)
    else:
        img = render_view(data, shadow, view, 1280, 860)
    Image.fromarray(img).save(out)
    print("wrote", os.path.abspath(out))


if __name__ == "__main__":
    main()
