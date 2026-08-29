"""Downscale and re-encode every texture inside a GLB.

gltf-transform's `--texture-size` / `--texture-compress` both go through sharp,
and sharp's libvips in this environment fails with "colourspace: parameter
space not set" on every image it is handed. Textures are the bulk of a scanned
car model, so without this the downloaded cars ship at 10-19 MB each.

Run this on the RAW glb, before any meshopt pass — compressed buffer views
relocate their payload through EXT_meshopt_compression, and rewriting the
buffer underneath that is a much harder problem than it needs to be.

    python tools/shrink_glb_textures.py in.glb out.glb [--max 1024] [--q 82]
"""

import argparse
import io
import json
import struct
import sys

from PIL import Image

JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942


def read_glb(path):
    d = open(path, "rb").read()
    magic, version, _total = struct.unpack("<III", d[:12])
    if magic != 0x46546C67:
        raise ValueError(f"{path} is not a GLB")
    off, js, bin_ = 12, None, b""
    while off < len(d):
        clen, ctype = struct.unpack("<II", d[off:off + 8])
        chunk = d[off + 8:off + 8 + clen]
        if ctype == JSON_CHUNK:
            js = json.loads(chunk)
        elif ctype == BIN_CHUNK:
            bin_ = chunk
        off += 8 + clen + (-clen % 4)
    return js, bin_


def pad4(b, fill=b"\x00"):
    return b + fill * (-len(b) % 4)


def shrink(img_bytes, max_px, quality):
    im = Image.open(io.BytesIO(img_bytes))
    fmt = (im.format or "PNG").upper()
    has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info

    w, h = im.size
    scale = min(1.0, max_px / max(w, h))
    if scale < 1.0:
        im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))),
                       Image.LANCZOS)

    out = io.BytesIO()
    # Alpha has to survive, so anything carrying it stays PNG; everything else
    # becomes JPEG, which is where nearly all the saving comes from.
    if has_alpha:
        im.convert("RGBA").save(out, format="PNG", optimize=True)
        mime = "image/png"
    else:
        im.convert("RGB").save(out, format="JPEG", quality=quality,
                               optimize=True, progressive=True)
        mime = "image/jpeg"
    return out.getvalue(), mime, fmt, (w, h), im.size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--max", type=int, default=1024)
    ap.add_argument("--q", type=int, default=82)
    a = ap.parse_args()

    g, bin_ = read_glb(a.src)
    views = g.get("bufferViews", [])
    images = g.get("images", [])
    if not images:
        print("no embedded images; nothing to do")
        return

    # Which buffer views are image payloads (they must not be copied verbatim).
    img_view = {im["bufferView"]: i for i, im in enumerate(images)
                if "bufferView" in im}

    new_bin = bytearray()
    new_views = []
    replacement = {}

    saved_before = saved_after = 0

    for vi, v in enumerate(views):
        start = v.get("byteOffset", 0)
        data = bytes(bin_[start:start + v["byteLength"]])

        if vi in img_view:
            idx = img_view[vi]
            small, mime, fmt, was, now = shrink(data, a.max, a.q)
            saved_before += len(data)
            saved_after += len(small)
            print(f"  image {idx:>3}  {fmt:<4} {was[0]}x{was[1]} -> "
                  f"{now[0]}x{now[1]}  {len(data)/1024:8.0f} KB -> "
                  f"{len(small)/1024:7.0f} KB")
            data = small
            replacement[idx] = mime

        nv = dict(v)
        nv["byteOffset"] = len(new_bin)
        nv["byteLength"] = len(data)
        # byteStride only means anything for vertex data, and a re-encoded
        # image would carry a stride that no longer describes it.
        if vi in img_view:
            nv.pop("byteStride", None)
        new_views.append(nv)
        new_bin += pad4(data)

    for idx, mime in replacement.items():
        images[idx]["mimeType"] = mime

    g["bufferViews"] = new_views
    g["buffers"] = [{"byteLength": len(new_bin)}]

    js = pad4(json.dumps(g, separators=(",", ":")).encode("utf-8"), b" ")
    bn = pad4(bytes(new_bin))
    total = 12 + 8 + len(js) + 8 + len(bn)
    with open(a.out, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total))
        f.write(struct.pack("<II", len(js), JSON_CHUNK))
        f.write(js)
        f.write(struct.pack("<II", len(bn), BIN_CHUNK))
        f.write(bn)

    print(f"textures {saved_before/1048576:.1f} MB -> "
          f"{saved_after/1048576:.1f} MB")
    print(f"{a.src} -> {a.out}   "
          f"{len(open(a.src,'rb').read())/1048576:.1f} MB -> "
          f"{total/1048576:.1f} MB")


if __name__ == "__main__":
    sys.exit(main())
