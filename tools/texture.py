"""Procedural texture atlas for the F1 car.

One atlas holds the painted livery for the tub, the sidepods and the tyres,
plus a flat white swatch that every untextured part points at (base colour =
texture x COLOR_0, so those parts keep their vertex colour).

Painting in UV space rather than per-face is what buys the detail: livery
edges are resolution-independent, and panel lines, decals and tyre lettering
become possible at all.

Region shape matters more than region area. The tub is 3.92 m long but only
~1.2 m around, so a region that is wider than it is tall spends its pixels on
the wrong axis: the previous 2048x700 `body` gave 2804 px/m across the nose
deck and 171 px/m along it, a 16:1 stretch that turned every decal into a
smear. The regions below are oriented so v (the long axis) runs along the car,
which brings every surface inside 2:1.
"""

import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

SIZE = 2048

# Atlas regions in pixels: (x0, y0, x1, y1).
#
# The two sidepods are mirror images, so their UV frames have opposite
# handedness and a single shared region would show one side's decals
# backwards. Each pod therefore gets its own tile.
#
# Nothing starts at x=0 or y=0 any more: `build_atlas` bleeds each tile
# outwards by PAD, and PIL silently clips a negative paste origin, so a region
# flush against the edge lost its bleed guard on that side.
REGIONS = {
    "body": (8, 8, 988, 1748),
    "pod_r": (1000, 8, 1656, 874),
    "pod_l": (1000, 886, 1656, 1752),
    "tyre": (8, 1766, 2040, 2010),
    "swatch": (1680, 40, 1780, 140),
}
PAD = 6            # bleed guard so mipmaps do not mix neighbouring regions

# Free block reserved for a future rear-wing region: x 1662..2042, y 150..1760.

# Smallest cap height we will emit. Below this a wordmark stops being read and
# starts being noise, and it is better to fail loudly than to bake mush into
# the atlas.
MIN_CAP_PX = 18

_FONT_FILES = {
    "narrow": ("arialnb.ttf", "ArialNarrowBold.ttf"),
    "black": ("ariblk.ttf", "Arial-Black.ttf"),
    "bold": ("arialbd.ttf",),
}


def _check_regions(regions=None, size=None, pad=None):
    """Fail loudly on overlap. PIL clips rather than raising, so a bad box
    silently corrupts its neighbour and only shows up as a wrong decal."""
    regions = REGIONS if regions is None else regions
    size = SIZE if size is None else size
    pad = PAD if pad is None else pad
    boxes = []
    for name, (x0, y0, x1, y1) in regions.items():
        if not (0 <= x0 - pad and 0 <= y0 - pad
                and x1 + pad <= size and y1 + pad <= size):
            raise ValueError(f"region {name!r} + bleed falls outside the atlas")
        boxes.append((name, x0 - pad, y0 - pad, x1 + pad, y1 + pad))
    for i, (na, ax0, ay0, ax1, ay1) in enumerate(boxes):
        for nb, bx0, by0, bx1, by1 in boxes[i + 1:]:
            if ax0 < bx1 and bx0 < ax1 and ay0 < by1 and by0 < ay1:
                raise ValueError(f"regions {na!r} and {nb!r} overlap once "
                                 f"expanded by the {pad}px bleed guard")


_check_regions()


def set_size(n):
    """Rescale the atlas. Used to render from a 4096 master without shipping
    it — nothing about the UVs changes, so the same GLB geometry is valid."""
    global SIZE, PAD, REGIONS, SWATCH_UV
    k = n / 2048.0
    REGIONS = {name: tuple(int(round(v * k)) for v in box)
               for name, box in REGIONS.items()}
    PAD = max(2, int(round(PAD * k)))
    SIZE = n
    _check_regions()
    SWATCH_UV = uv_of("swatch", 0.5, 0.5)


def uv_of(region, u, v):
    """Map local (u, v) in [0,1] to atlas UV, inset by the bleed guard."""
    x0, y0, x1, y1 = REGIONS[region]
    x0, y0, x1, y1 = x0 + PAD, y0 + PAD, x1 - PAD, y1 - PAD
    return ((x0 + (x1 - x0) * u) / SIZE, (y0 + (y1 - y0) * v) / SIZE)


SWATCH_UV = uv_of("swatch", 0.5, 0.5)


def inset_size(region):
    """Pixel size of the drawable area, i.e. what uv_of actually addresses."""
    x0, y0, x1, y1 = REGIONS[region]
    return (x1 - x0) - 2 * PAD, (y1 - y0) - 2 * PAD


def _font(px, face="narrow"):
    for name in _FONT_FILES[face]:
        for path in (name,
                     os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                  "fonts", name),
                     os.path.join("C:/Windows/Fonts", name)):
            try:
                return ImageFont.truetype(path, px)
            except OSError:
                continue
    # The default face is a ~10px bitmap. Falling back to it at decal sizes
    # produces an unreadable smudge with no error, which is far worse than
    # stopping — on a machine without Arial every wordmark would be ruined.
    raise RuntimeError(
        f"no font found for face {face!r} (tried {_FONT_FILES[face]}). "
        "Install Arial or vendor a TTF into tools/fonts/.")


def _ink(rgb01, alpha=255):
    return tuple(int(round(c * 255)) for c in rgb01[:3]) + (alpha,)


def _decal(text, cap_m, px_across, px_along, fill, face="narrow",
           angle=0, mirror=False, track=0):
    """Render a wordmark at a true world size, correcting atlas anisotropy.

    `cap_m` is the cap height in metres. The two densities are the atlas
    resolution along each axis at this point on the car, which differ by up to
    2:1 — so the glyph is rendered square and then resized non-uniformly,
    otherwise the stretch reappears on every decal.

    `angle` is 0 to read across the car, +/-90 to read along it. Which of the
    two is correct depends on the surface's UV handedness; see the callers.
    """
    NOMINAL = 220
    font = _font(NOMINAL, face)
    if track:
        text = (" " * track).join(text)

    probe = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    box = probe.textbbox((0, 0), text, font=font)
    w0, h0 = box[2] - box[0], box[3] - box[1]
    if w0 <= 0 or h0 <= 0:
        raise ValueError(f"empty decal {text!r}")

    img = Image.new("RGBA", (w0, h0), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((-box[0], -box[1]), text, font=font, fill=fill)

    # Uppercase has no descender, so the ink box height is the cap height.
    advance_m = cap_m * (w0 / h0)

    if angle % 180 == 0:
        # cap lands on v (along the car), advance lands on u (across it)
        tw, th = advance_m * px_across, cap_m * px_along
    else:
        # rotating swaps the axes, so size pre-rotation and let rotate() do it
        tw, th = advance_m * px_along, cap_m * px_across

    tw, th = max(1, int(round(tw))), max(1, int(round(th)))
    if th < MIN_CAP_PX:
        raise ValueError(
            f"decal {text!r} cap resolves to {th}px, under the {MIN_CAP_PX}px "
            f"floor — raise cap_m (currently {cap_m}) or the atlas size")

    img = img.resize((tw, th), Image.LANCZOS)
    if mirror:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    if angle % 360:
        img = img.rotate(angle, expand=True, resample=Image.BICUBIC)
    return img


def _paste_centre(out, block, u, y):
    """Paste centred on (u, y). The old code pasted at the top-left, which is
    why the existing layout drifts as soon as a decal changes size."""
    x = int(round(u * out.width - block.width / 2.0))
    out.paste(block, (x, int(round(y - block.height / 2.0))), block)


def _smoothstep(a, b, t):
    t = np.clip((t - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def _noise(shape, scale, seed):
    rng = np.random.default_rng(seed)
    small = rng.random((max(2, shape[0] // scale), max(2, shape[1] // scale)))
    img = Image.fromarray((small * 255).astype(np.uint8)).resize(
        (shape[1], shape[0]), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


# --------------------------------------------------------------- decal plans

# u = 0.257, not 0.25: the section taper shortens the lower arc, so the true
# centre of the visible top deck sits slightly off the nominal crown.
DECK_U = 0.257

# Whether a wordmark has to be pre-mirrored depends on the handedness of the
# surface's UV frame, which differs between the tub and the two pods. These
# were settled by rendering the car from directly above and reading the
# result, not derived — the tub deck needs no flip, the left pod does.
BODY_MIRROR = False

# Text drawn unrotated in the atlas has its glyph tops toward low v, and v
# increases toward the tail — so an unrotated wordmark ends up reading with
# its tops pointing at the nose, i.e. upside down to anyone looking at the car
# from above. Half a turn puts it the right way up.
BODY_ACROSS = 180

# The outer quarter of the deck curves away and foreshortens to nothing when
# seen from above, so only this fraction of the full top width is usable.
DECK_USABLE = 0.72

_ASPECT_CACHE = {}


def _aspect(text, face):
    """Ink width / cap height for a string.

    Measured rather than assumed: Arial Narrow Bold runs about 0.8 cap-widths
    per character, not the ~0.45 an eyeball estimate suggests. That difference
    is enough to overflow every decal on the car, so nothing here guesses.
    """
    key = (text, face)
    if key not in _ASPECT_CACHE:
        font = _font(220, face)
        box = ImageDraw.Draw(Image.new("RGBA", (8, 8))).textbbox(
            (0, 0), text, font=font)
        _ASPECT_CACHE[key] = (box[2] - box[0]) / (box[3] - box[1])
    return _ASPECT_CACHE[key]


def _fit_across(text, face, want_cap, deck_m):
    """Largest cap height whose advance still fits inside the deck width."""
    return min(want_cap, deck_m / _aspect(text, face))


def _pack_along(marks, z_head, z_tail, deck_fn, gap=0.045):
    """Lay marks nose-to-tail along the car, packed and non-overlapping.

    Reading along the car puts the cap height across the deck and the advance
    along it, so each mark is bounded two ways: cap by the deck width, length
    by whatever z budget is left. If the run overflows, every cap is scaled by
    one common factor rather than shrinking the tail marks alone — a uniform
    reduction still reads as a designed hierarchy, an uneven one reads as a
    mistake.
    """
    caps = [min(cap, deck_fn(z_head)) for _z, _t, cap, _f in marks]
    lens = [c * _aspect(t, f) for c, (_z, t, _c, f) in zip(caps, marks)]
    budget = abs(z_head - z_tail) - gap * (len(marks) - 1)
    total = sum(lens)
    if total > budget:
        k = budget / total
        caps = [c * k for c in caps]
        lens = [ln * k for ln in lens]

    placed, cursor = [], z_head
    for (_z, text, _c, face), cap, ln in zip(marks, caps, lens):
        placed.append((cursor - ln / 2.0, text, cap, face))
        cursor -= ln + gap
    return placed


# Body decals are pasted onto a tomato deck, so they are near-black; the
# number sits far enough forward to clear the sponsor column.
# Scuderia badging. 27 is the Ferrari number (Villeneuve, then Alboreto);
# 12 was Senna's McLaren and would be wrong on a red car.
CAR_NUMBER = '27'
TAIL_MARK = 'SCUDERIA'

# `cap` is a wish, not a promise: _fit_across shrinks anything whose advance
# would run off the edge of the deck.
NOSE_STRIP = [
    (1.79, "AWS", 0.075, "black"),
    (1.60, "DOCKER", 0.055, "narrow"),
    (1.41, "NEXT.JS", 0.055, "narrow"),
    (1.22, "FASTAPI", 0.055, "narrow"),
    (1.03, "FLUTTER", 0.055, "narrow"),
    (0.84, "FIREBASE", 0.052, "narrow"),
]

# Opened up by shortening the louvre run. The roll hoop crosses at z ~ -0.24,
# so nothing may sit between -0.20 and -0.30.
COVER_STRIP = [
    (-0.14, "MEGH4TECH", 0.050, "narrow"),
    (-0.42, "KUBERNETES", 0.046, "narrow"),
    (-0.56, "MONGODB", 0.050, "narrow"),
]

# Sidepod decks are 24% of the plan-view silhouette and completely
# unobstructed — the best real estate on the car, so the title marks go here.
# These read along the car and are placed by _pack_along, so the leading value
# is only an ordering key; the packer decides the actual z.
POD_MARKS = {
    "pod_r": [(0, "PYTHON", 0.105, "black"),
              (1, "REACT", 0.058, "narrow"),
              (2, "POSTGRESQL", 0.044, "narrow")],
    "pod_l": [(0, "PYTORCH", 0.105, "black"),
              (1, "DJANGO", 0.058, "narrow"),
              (2, "TENSORFLOW", 0.044, "narrow")],
}

# Clean window measured off the plan-view depth buffer: forward of this the
# front wing intrudes, behind it the rear wing and gearbox do.
POD_WINDOW = (0.30, -1.03)


# --------------------------------------------------------------------- body


def paint_body(w, h, z_front, z_back, deck, band, dark, perim=None,
               deck_w=None):
    u = (np.arange(w, dtype=np.float32) + 0.5) / w
    v = (np.arange(h, dtype=np.float32) + 0.5) / h
    U, V = np.meshgrid(u, v)
    Z = z_front + (z_back - z_front) * V

    # dark band along the flanks, widening as it runs back along the car
    edge = 0.072 + 0.052 * _smoothstep(1.60, -0.60, Z)
    flank = (U <= edge) | (U >= 0.5 - edge)
    is_dark = flank | (Z > 2.10) | (Z < -1.03)

    img = np.where(is_dark[:, :, None], np.array(band), np.array(deck))

    # curvature shading baked in very lightly: the underside sits in shadow
    under = _smoothstep(0.55, 0.80, np.abs(U - 0.75) * -1 + 0.25)
    img *= (1.0 - 0.10 * under)[:, :, None]

    # fine speckle so large flat panels are not perfectly uniform
    img *= (0.985 + 0.030 * _noise((h, w), 6, 11))[:, :, None]

    out = Image.fromarray(np.clip(img * 255, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(out)

    def vy(z):
        return (z_front - z) / (z_front - z_back) * h

    px_along = h / (z_front - z_back)

    def px_across(z):
        return w / (perim(z) if perim else 1.24)

    def deck_m(z):
        return (deck_w(z) if deck_w else 0.30) * DECK_USABLE

    line = (70, 70, 76)
    # transverse panel joints, kept inside the deck
    for z in (1.94, 0.70, -0.80):
        y = int(vy(z))
        d.line([(0.16 * w, y), (0.355 * w, y)], fill=line, width=2)
    # longitudinal shoulder seams either side of the crown
    for x in (0.148, 0.366):
        d.line([(x * w, vy(1.98)), (x * w, vy(-0.95))], fill=line, width=2)

    ink = _ink(dark)
    hot = _ink(deck)

    # Car number, reading along the car on the red nose deck. Forward of the
    # sponsor column and clear of the front wing. 27 is the Scuderia number —
    # 12 was Senna's McLaren and makes no sense on a red car.
    _paste_centre(out, _decal(CAR_NUMBER, 0.075, px_across(2.00), px_along,
                              ink, face="black", angle=90),
                  DECK_U, vy(2.00))

    # Partner column down the nose, as on a modern car: reads across the car,
    # glyph-up towards the nose.
    for z, text, cap, face in NOSE_STRIP + COVER_STRIP:
        cap = _fit_across(text, face, cap, deck_m(z))
        _paste_centre(out, _decal(text, cap, px_across(z), px_along, ink,
                                  face=face, angle=BODY_ACROSS, mirror=BODY_MIRROR),
                      DECK_U, vy(z))

    # Hairline rules between the nose-strip slots, as on the real column.
    for a, b in zip(NOSE_STRIP, NOSE_STRIP[1:]):
        y = int(vy((a[0] + b[0]) / 2.0))
        d.line([(0.19 * w, y), (0.325 * w, y)], fill=ink[:3], width=2)

    # Tail is dark, so the mark there is red.
    cap = _fit_across(TAIL_MARK, "narrow", 0.048, deck_m(-1.20))
    _paste_centre(out, _decal(TAIL_MARK, cap, px_across(-1.20), px_along, hot,
                              face="narrow", angle=BODY_ACROSS,
                              mirror=BODY_MIRROR),
                  DECK_U, vy(-1.20))

    return out


# ----------------------------------------------------------------- sidepods


def paint_pod(w, h, z_front, z_back, deck, band, dark, mirror=False,
              perim=None, deck_w=None):
    u = (np.arange(w, dtype=np.float32) + 0.5) / w
    v = (np.arange(h, dtype=np.float32) + 0.5) / h
    U, V = np.meshgrid(u, v)
    Z = z_front + (z_back - z_front) * V

    edge = 0.082 + 0.030 * _smoothstep(0.10, -0.95, Z)
    flank = (U <= edge) | (U >= 0.5 - edge)
    img = np.where((flank | (Z > 0.345))[:, :, None],
                   np.array(band), np.array(deck))
    img = np.where((Z > 0.655)[:, :, None], np.array(dark), img)
    img *= (0.985 + 0.030 * _noise((h, w), 6, 23))[:, :, None]

    out = Image.fromarray(np.clip(img * 255, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(out)

    def vy(z):
        return (z_front - z) / (z_front - z_back) * h

    px_along = h / (z_front - z_back)

    def px_across(z):
        return w / (perim(z) if perim else 1.10)

    def deck_m(z):
        return (deck_w(z) if deck_w else 0.26) * DECK_USABLE

    line = (70, 70, 76)
    d.line([(0.14 * w, vy(0.30)), (0.14 * w, vy(-1.02))], fill=line, width=2)
    d.line([(0.39 * w, vy(0.30)), (0.39 * w, vy(-1.02))], fill=line, width=2)

    ink = _ink(dark)

    # The pods read along the car, nose-ward. The two tiles have opposite
    # handedness, so the rotation has to flip with the mirror or one side
    # comes out upside down: angle = +90 unmirrored, -90 mirrored.
    marks = _pack_along(POD_MARKS["pod_l" if mirror else "pod_r"],
                        POD_WINDOW[0], POD_WINDOW[1], deck_m)
    for z, text, cap, face in marks:
        _paste_centre(out, _decal(text, cap, px_across(z), px_along, ink,
                                  face=face, angle=-90 if mirror else 90,
                                  mirror=mirror),
                      DECK_U, vy(z))

    return out


# -------------------------------------------------------------------- tyres


def paint_tyre(w, h):
    v = (np.arange(h, dtype=np.float32) + 0.5) / h
    across = np.broadcast_to(v[:, None], (h, w))
    base = 0.052 + 0.016 * np.abs(across - 0.5) * 2
    img = np.repeat(base[:, :, None], 3, axis=2)
    img[:, :, 2] *= 1.06
    tread = (across > 0.34) & (across < 0.66)
    img = np.where(tread[:, :, None], img * 0.86, img)
    img *= (0.94 + 0.12 * _noise((h, w), 4, 7))[:, :, None]

    out = Image.fromarray(np.clip(img * 255, 0, 255).astype(np.uint8))
    # moulded sidewall lettering, repeated around the circumference
    font = _font(30, "bold")
    txt = Image.new("RGBA", (10, 10))
    probe = ImageDraw.Draw(txt)
    label = " ".join("RADIAL  ·  460/640-13")
    box = probe.textbbox((0, 0), label, font=font)
    txt = Image.new("RGBA", (box[2] - box[0] + 8, box[3] - box[1] + 8),
                    (0, 0, 0, 0))
    ImageDraw.Draw(txt).text((4 - box[0], 4 - box[1]), label, font=font,
                             fill=(120, 120, 125, 255))
    flipped = txt.transpose(Image.ROTATE_180)
    reps = 4
    for band_v, glyph in ((0.15, flipped), (0.85, txt)):
        step = w // reps
        if glyph.width > step - 24:
            glyph = glyph.resize(
                (step - 24,
                 max(1, glyph.height * (step - 24) // glyph.width)))
        for k in range(reps):
            out.paste(glyph,
                      (k * step + 12, int(band_v * h) - glyph.height // 2),
                      glyph)
    return out


# -------------------------------------------------------------------- atlas


def build_atlas(body_z, pod_z, deck, band, dark, body_perim=None,
                pod_perim=None, body_deck=None, pod_deck=None, path=None):
    """Paint every region into one image.

    `deck` is the dominant colour and lands on the upper surfaces, which is
    what makes the car read tomato from directly above. `band` is the
    complementing dark for the flanks and the nose and tail caps; `dark` is
    the deepest value, used for the radiator mouths.
    """
    _check_regions()
    atlas = Image.new("RGB", (SIZE, SIZE), (255, 255, 255))

    painters = (
        ("body", lambda w, h: paint_body(w, h, *body_z, deck, band, dark,
                                         perim=body_perim,
                                         deck_w=body_deck)),
        ("pod_r", lambda w, h: paint_pod(w, h, *pod_z, deck, band, dark,
                                         mirror=False, perim=pod_perim,
                                         deck_w=pod_deck)),
        ("pod_l", lambda w, h: paint_pod(w, h, *pod_z, deck, band, dark,
                                         mirror=True, perim=pod_perim,
                                         deck_w=pod_deck)),
        ("tyre", paint_tyre),
    )

    for name, painter in painters:
        x0, y0, x1, y1 = REGIONS[name]
        iw, ih = (x1 - x0) - 2 * PAD, (y1 - y0) - 2 * PAD
        # Paint at the INSET size: uv_of only ever addresses the inset box, so
        # painting at the full box size shifted every decal by PAD.
        tile = painter(iw, ih)
        # Bleed first, then stamp the true tile on top of it.
        atlas.paste(tile.resize((iw + 4 * PAD, ih + 4 * PAD)),
                    (x0 - PAD, y0 - PAD))
        atlas.paste(tile, (x0 + PAD, y0 + PAD))

    x0, y0, x1, y1 = REGIONS["swatch"]
    ImageDraw.Draw(atlas).rectangle([x0 - PAD, y0 - PAD, x1 + PAD, y1 + PAD],
                                    fill=(255, 255, 255))
    if path:
        atlas.save(path)
    return atlas


def to_png_bytes(img):
    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()
