"""Generate a late-1980s Formula 1 car as a smooth-shaded GLB.

Scuderia livery: Ferrari red over a cool black. The bodywork geometry is
still MP4/4-derived — the livery and badging are Ferrari, the sections are
not.

Everything is procedural: no textures, no external assets. Surfaces are lofted
from cross-section tables, resampled with a Catmull-Rom spline and welded with
averaged vertex normals, so the bodywork reads as a smooth shell rather than a
faceted block. The livery is carried by per-vertex colours.

Units are metres, Y up, nose pointing towards +Z, tyres resting on y = 0.

    python tools/generate_f1_glb.py [output.glb]
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import texture  # noqa: E402
from glbkit import Part, lerp, resample, write_glb  # noqa: E402

# ------------------------------------------------------------------ palette

# Ferrari red over a cool black. ROSSO lands on the upper surfaces, so the car
# reads red-dominant from directly above — which is the only view the site
# uses it in.
#
# INK is deliberately not #000: it is cool (b > r) so it reads as a chosen
# complement to the warm red rather than as absence, and it sits a step above
# the page ground so black bodywork still separates from a dark section
# background instead of dissolving into it.
def _lin(c):
    """sRGB -> linear.

    glTF is explicit that baseColorTexture is sRGB-encoded but COLOR_0 is
    linear. The palette below is written in sRGB because that is what the
    atlas stores and what the hex values mean; anything used as a vertex
    colour has to be decoded first or it renders washed out.
    """
    return tuple(v ** 2.2 for v in c)


# sRGB — these go into the texture atlas.
ROSSO_S = (0.784, 0.063, 0.180)      # #C8102E  Rosso Corsa, Pantone 186 C
                                     # the historic Ferrari racing red, not
                                     # the modern orange-leaning #FF2800
INK_S = (0.078, 0.086, 0.102)        # #14161A  the complementing black
JET_S = (0.039, 0.043, 0.051)        # #0A0B0D  intake mouths, cockpit

# linear — these go into COLOR_0 on the untextured parts.
ROSSO = _lin(ROSSO_S)
ROSSO_LO = _lin((0.580, 0.043, 0.125))    # #941F20 shaded lower flank
INK = _lin(INK_S)
JET = _lin(JET_S)
CARBON = _lin((0.110, 0.115, 0.128))      # a step above INK so it separates
TIRE = _lin((0.090, 0.094, 0.104))        # lifted so tyres do not merge
TIRE_WALL = _lin((0.074, 0.078, 0.090))
RIM = _lin((0.36, 0.365, 0.385))
STEEL = _lin((0.60, 0.61, 0.63))
DISC = _lin((0.22, 0.225, 0.235))
GLASS = _lin((0.075, 0.095, 0.115))

# The lofted, textured parts must not also carry the livery in COLOR_0:
# glTF multiplies baseColorFactor x baseColorTexture x COLOR_0, so writing the
# palette into both squares it (#C8102E would render near-black in the green
# The atlas is the single source of colour for Body and Sidepods; every other
# part points at the flat white swatch and keeps its vertex colour.
PLAIN = (1.0, 1.0, 1.0)

# ---------------------------------------------------------------- materials

CLEARCOAT = {"KHR_materials_clearcoat": {"clearcoatFactor": 0.85,
                                         "clearcoatRoughnessFactor": 0.08}}

MATERIALS = [
    {   # 0 - body paint, clear-coated
        "name": "CarPaint",
        "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1],
                                 "metallicFactor": 0.0,
                                 "roughnessFactor": 0.20},
        "extensions": CLEARCOAT,
        "doubleSided": True,
    },
    {   # 1 - tyres and matte trim
        "name": "Rubber",
        "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1],
                                 "metallicFactor": 0.0,
                                 "roughnessFactor": 0.95},
        "doubleSided": True,
    },
    {   # 2 - carbon fibre
        "name": "Carbon",
        "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1],
                                 "metallicFactor": 0.15,
                                 "roughnessFactor": 0.38},
        "extensions": {"KHR_materials_clearcoat":
                       {"clearcoatFactor": 0.5,
                        "clearcoatRoughnessFactor": 0.15}},
        "doubleSided": True,
    },
    {   # 3 - machined metal
        "name": "Metal",
        "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1],
                                 "metallicFactor": 1.0,
                                 "roughnessFactor": 0.28},
        "doubleSided": True,
    },
]

PAINT, RUBBER, CARBONM, METAL = 0, 1, 2, 3
EXTENSIONS = ["KHR_materials_clearcoat"]

# --------------------------------------------------------------- dimensions

FRONT_AXLE_Z = 1.44
REAR_AXLE_Z = -1.435
FRONT_R, FRONT_HW, FRONT_X = 0.305, 0.150, 0.735
REAR_R, REAR_HW, REAR_X = 0.340, 0.208, 0.700

BODY_STEP = 0.030          # longitudinal resampling of the tub
BODY_SEGS = 60             # points around a tub section
POD_STEP = 0.028
POD_SEGS = 48

# Central tub and engine cover: (z, half-width, bottom y, top y).
BODY_CONTROL = [
    (2.240, 0.046, 0.302, 0.352),
    (2.120, 0.080, 0.292, 0.372),
    (1.960, 0.110, 0.276, 0.394),
    (1.740, 0.138, 0.250, 0.418),
    (1.440, 0.162, 0.220, 0.446),
    (1.100, 0.184, 0.190, 0.480),
    (0.780, 0.202, 0.158, 0.526),
    (0.460, 0.220, 0.130, 0.576),
    (0.100, 0.232, 0.112, 0.598),
    (-0.260, 0.238, 0.106, 0.630),
    (-0.640, 0.230, 0.110, 0.618),
    (-1.000, 0.200, 0.118, 0.556),
    (-1.320, 0.148, 0.130, 0.476),
    (-1.560, 0.084, 0.146, 0.402),
    (-1.680, 0.038, 0.162, 0.346),
]

# Sidepods: (z, outer edge x, bottom y, top y). The inner edge is tucked
# inside the tub so the volumes merge instead of leaving a seam.
POD_OUTLINE = [
    (0.700, 0.316, 0.164, 0.284),
    (0.540, 0.462, 0.136, 0.356),
    (0.240, 0.580, 0.114, 0.388),
    (-0.180, 0.592, 0.108, 0.392),
    (-0.560, 0.574, 0.112, 0.378),
    (-0.860, 0.512, 0.120, 0.346),
    (-1.080, 0.402, 0.132, 0.296),
]

COCKPIT_FRONT_Z = 0.545
COCKPIT_BACK_Z = -0.185

BODY_TAPER = 0.86          # lower flanks pulled in
POD_TAPER = 0.60


def station_lookup(table, z, i):
    zs = [s[0] for s in table]
    if z >= zs[0]:
        return table[0][i]
    if z <= zs[-1]:
        return table[-1][i]
    for a, b in zip(table, table[1:]):
        if b[0] <= z <= a[0]:
            t = (a[0] - z) / (a[0] - b[0])
            return lerp(a[i], b[i], t)
    return table[-1][i]


def body_top(z):
    return station_lookup(BODY_CONTROL, z, 3)


def body_hw(z):
    return station_lookup(BODY_CONTROL, z, 1)


def smoothstep(a, b, t):
    t = min(1.0, max(0.0, (t - a) / (b - a)))
    return t * t * (3 - 2 * t)


def section(z, hw, ybot, ytop, n, e=4.8, xoff=0.0, taper=1.0, dense=480):
    """Rounded superellipse cross-section, narrowed towards its underside.

    Points are redistributed by arc length: a plain angular sweep bunches
    vertices into the corners and leaves the flat flanks coarse, which shows
    up as a stepped edge wherever the livery splits and as uneven shading.
    """
    yc, hy = (ytop + ybot) / 2.0, (ytop - ybot) / 2.0
    raw = []
    for i in range(dense):
        t = 2 * math.pi * i / dense
        c, s = math.cos(t), math.sin(t)
        x = hw * math.copysign(abs(c) ** (2.0 / e), c)
        y = yc + hy * math.copysign(abs(s) ** (2.0 / e), s)
        if taper < 1.0 and hy > 1e-6:
            f = (y - ybot) / (2 * hy)
            x *= taper + (1.0 - taper) * smoothstep(0.0, 0.62, f)
        raw.append((x, y))

    cum = [0.0]
    for i in range(dense):
        ax, ay = raw[i]
        bx, by = raw[(i + 1) % dense]
        cum.append(cum[-1] + math.hypot(bx - ax, by - ay))
    total = cum[-1]

    pts = []
    j = 0
    for k in range(n):
        target = total * k / n
        while cum[j + 1] < target and j < dense - 1:
            j += 1
        span = cum[j + 1] - cum[j]
        f = 0.0 if span < 1e-12 else (target - cum[j]) / span
        ax, ay = raw[j]
        bx, by = raw[(j + 1) % dense]
        pts.append((ax + (bx - ax) * f + xoff, ay + (by - ay) * f, z))
    return pts


# Sidepods resolved to (z, half-width, bottom y, top y, centre x).
POD_CONTROL = []
for _z, _outer, _yb, _yt in POD_OUTLINE:
    _inner = body_hw(_z) - 0.042
    POD_CONTROL.append((_z, (_outer - _inner) / 2.0, _yb, _yt,
                        (_outer + _inner) / 2.0))

BODY_STATIONS = resample(BODY_CONTROL, BODY_STEP)
POD_STATIONS = resample(POD_CONTROL, POD_STEP)


# ------------------------------------------------------------------ livery


# The livery used to be written here as vertex colours as well as into the
# atlas. It is now painted once, in texture.paint_body / paint_pod, using the
# same u/z predicates. Keeping a second copy here would double-multiply it.
#
# The split is no longer mesh-edge-exact — it is texture-resolution-limited at
# roughly 1.8 mm — but because the splits stay at constant u they remain
# straight lines in UV space and still render clean.


def plain(p, u):
    return PLAIN


def _perimeter_lookup(stations, segs, **kw):
    """Cross-section perimeter in metres as a function of z.

    `texture._decal` needs this to size a wordmark in real units: the atlas
    gives a fixed pixel budget across the section, but the section perimeter
    varies about 7x along the car, so px/m across is not constant.
    """
    zs, per = [], []
    for st in stations:
        pts = np.asarray(section(st[0], st[1], st[2], st[3], segs, **kw),
                         dtype=float)[:, :2]
        d = np.linalg.norm(np.diff(np.vstack([pts, pts[:1]]), axis=0), axis=1)
        zs.append(float(st[0]))
        per.append(float(d.sum()))
    order = np.argsort(zs)
    zs = np.asarray(zs)[order]
    per = np.asarray(per)[order]
    return lambda z: float(np.interp(z, zs, per))


# ------------------------------------------------------------------- shapes


def build_body():
    part = Part("Body", PAINT, uv=texture.SWATCH_UV)
    rings = [section(z, hw, yb, yt, BODY_SEGS, taper=BODY_TAPER)
             for (z, hw, yb, yt) in BODY_STATIONS]

    def uv(i, m, s, ns):
        return texture.uv_of("body", i / m, s / (ns - 1))

    part.loft(rings, plain, cap_color=PLAIN, uv_fn=uv)
    return part


def build_sidepods():
    part = Part("Sidepods", PAINT, uv=texture.SWATCH_UV)
    for s in (1, -1):
        rings = [section(z, hw, yb, yt, POD_SEGS, e=5.8, xoff=s * xc,
                         taper=POD_TAPER)
                 for (z, hw, yb, yt, xc) in POD_STATIONS]

        # u = 0 must land on the outer flank for both pods, otherwise the
        # left one samples the texture the right one uses for its inner face
        # and the decals end up in the wrong place.
        def uv(i, m, si, ns, s=s):
            u = i / m
            if s < 0:
                u = (0.5 - u) % 1.0
            return texture.uv_of("pod_r" if s > 0 else "pod_l",
                                 u, si / (ns - 1))

        part.loft(rings, plain, cap_color=PLAIN, uv_fn=uv)
    return part


def build_cockpit():
    """Recessed opening with a padded rim, headrest and screen."""
    part = Part("Cockpit", RUBBER, uv=texture.SWATCH_UV)
    zs = np.linspace(COCKPIT_FRONT_Z, COCKPIT_BACK_Z, 22)
    outer, inner = [], []
    for z in zs:
        t = (z - COCKPIT_BACK_Z) / (COCKPIT_FRONT_Z - COCKPIT_BACK_Z)
        w = 0.112 + 0.090 * math.sin(math.pi * min(1.0, max(0.0, t)) ** 0.75)
        w = min(w, body_hw(float(z)) - 0.038)
        top = body_top(float(z))
        outer.append((w, top))
        inner.append((w * 0.70, top - 0.115))

    g = part.group()
    for i in range(len(zs) - 1):
        z0, z1 = float(zs[i]), float(zs[i + 1])
        (ow0, ty0), (iw0, by0) = outer[i], inner[i]
        (ow1, ty1), (iw1, by1) = outer[i + 1], inner[i + 1]
        for s in (1, -1):
            part.quad((s * ow0, ty0, z0), (s * ow1, ty1, z1),
                      (s * iw1, by1, z1), (s * iw0, by0, z0), JET, None, g)
        part.quad((-iw0, by0, z0), (iw0, by0, z0),
                  (iw1, by1, z1), (-iw1, by1, z1), CARBON, None, g)
    for k, col in ((0, GLASS), (-1, JET)):
        (ow, ty), (iw, by) = outer[k], inner[k]
        z = float(zs[k])
        part.quad((-ow, ty, z), (ow, ty, z), (iw, by, z), (-iw, by, z), col)

    # headrest bolster behind the opening
    zr = COCKPIT_BACK_Z
    hr = body_top(zr - 0.02)
    part.hexa([
        (-0.145, hr - 0.03, zr), (0.145, hr - 0.03, zr),
        (0.128, hr - 0.03, zr - 0.185), (-0.128, hr - 0.03, zr - 0.185),
        (-0.136, hr + 0.070, zr), (0.136, hr + 0.070, zr),
        (0.110, hr + 0.046, zr - 0.185), (-0.110, hr + 0.046, zr - 0.185),
    ], JET)

    # wrap-around windscreen
    zf = COCKPIT_FRONT_Z
    wf = outer[0][0]
    part.hexa([
        (-wf, body_top(zf) - 0.012, zf), (wf, body_top(zf) - 0.012, zf),
        (wf * 0.94, body_top(zf + 0.11) - 0.012, zf + 0.11),
        (-wf * 0.94, body_top(zf + 0.11) - 0.012, zf + 0.11),
        (-wf * 0.90, body_top(zf) + 0.052, zf),
        (wf * 0.90, body_top(zf) + 0.052, zf),
        (wf * 0.86, body_top(zf + 0.11) + 0.014, zf + 0.11),
        (-wf * 0.86, body_top(zf + 0.11) + 0.014, zf + 0.11),
    ], GLASS)
    return part


def build_engine_details():
    """Cooling louvres, roll hoop and mirrors."""
    part = Part("EngineCover", CARBONM, uv=texture.SWATCH_UV)
    # Shortened from 13 slats spanning -0.30..-0.96. The louvres sit on top of
    # the tub and occlude it from above, and this run covered the whole engine
    # cover deck — the flattest, most visible panel in a plan view. Pulling it
    # back to -0.58 opens z -0.10..-0.55 for the sponsor marks.
    for z in np.linspace(-0.58, -0.96, 8):
        z = float(z)
        w = body_hw(z) * 0.60
        y = body_top(z) + 0.003
        part.hexa([
            (-w, y - 0.010, z + 0.013), (w, y - 0.010, z + 0.013),
            (w, y - 0.010, z - 0.013), (-w, y - 0.010, z - 0.013),
            (-w, y + 0.011, z + 0.008), (w, y + 0.011, z + 0.008),
            (w, y + 0.011, z - 0.008), (-w, y + 0.011, z - 0.008),
        ], JET)

    zh = COCKPIT_BACK_Z - 0.055
    apex = (0.0, body_top(zh) + 0.135, zh)
    for s in (1, -1):
        part.tube((s * 0.125, body_top(zh) - 0.03, zh), apex,
                  0.024, 0.021, CARBON, segments=10)
    for s in (1, -1):
        part.tube((s * 0.235, 0.560, 0.470), (s * 0.300, 0.588, 0.470),
                  0.010, 0.010, CARBON, segments=8)
        part.hexa([
            (s * 0.300, 0.556, 0.432), (s * 0.352, 0.556, 0.432),
            (s * 0.352, 0.556, 0.512), (s * 0.300, 0.556, 0.512),
            (s * 0.300, 0.606, 0.432), (s * 0.352, 0.606, 0.432),
            (s * 0.352, 0.606, 0.512), (s * 0.300, 0.606, 0.512),
        ], JET)
    return part


def build_floor():
    part = Part("Floor", CARBONM, uv=texture.SWATCH_UV)
    plan = [(0.760, 0.480), (0.400, 0.590), (-0.200, 0.610), (-0.700, 0.600),
            (-1.100, 0.520), (-1.240, 0.470)]
    y0, y1 = 0.052, 0.092
    g = part.group()
    for i in range(len(plan) - 1):
        (z0, w0), (z1, w1) = plan[i], plan[i + 1]
        part.hexa([
            (-w0, y0, z0), (w0, y0, z0), (w1, y0, z1), (-w1, y0, z1),
            (-w0, y1, z0), (w0, y1, z0), (w1, y1, z1), (-w1, y1, z1),
        ], CARBON)
    # rear diffuser ramp
    part.hexa([
        (-0.470, 0.052, -1.240), (0.470, 0.052, -1.240),
        (0.400, 0.168, -1.660), (-0.400, 0.168, -1.660),
        (-0.470, 0.092, -1.240), (0.470, 0.092, -1.240),
        (0.400, 0.206, -1.660), (-0.400, 0.206, -1.660),
    ], JET)
    for s in (1, -1):     # diffuser strakes
        for xo in (0.16, 0.30):
            part.hexa([
                (s * xo, 0.052, -1.240), (s * (xo + 0.012), 0.052, -1.240),
                (s * (xo + 0.012), 0.168, -1.640), (s * xo, 0.168, -1.640),
                (s * xo, 0.150, -1.240), (s * (xo + 0.012), 0.150, -1.240),
                (s * (xo + 0.012), 0.250, -1.640), (s * xo, 0.250, -1.640),
            ], CARBON)
    return part


# ------------------------------------------------------------------- wings


def aerofoil(n=30, thickness=0.10, camber=0.05, camber_pos=0.42):
    """Closed NACA-style profile in chord coordinates, x from 0 (LE) to 1."""
    def yt(x):
        return 5 * thickness * (0.2969 * math.sqrt(x) - 0.1260 * x
                                - 0.3516 * x * x + 0.2843 * x ** 3
                                - 0.1036 * x ** 4)

    def yc(x):
        m, p = camber, camber_pos
        if m == 0:
            return 0.0
        if x < p:
            return m / (p * p) * (2 * p * x - x * x)
        return m / ((1 - p) ** 2) * ((1 - 2 * p) + 2 * p * x - x * x)

    xs = [(1 - math.cos(math.pi * i / n)) / 2 for i in range(n + 1)]
    upper = [(x, yc(x) + yt(x)) for x in xs]
    lower = [(x, yc(x) - yt(x)) for x in reversed(xs)]
    return upper + lower[1:-1]


def wing_element(part, le, chord, aoa, half_span, color, profile=None,
                 taper=1.0, tip_drop=0.0, flip=False):
    """Loft an aerofoil across the span. `le` is the leading edge (y, z)."""
    prof = profile if profile is not None else aerofoil()
    ly, lz = le
    ca, sa = math.cos(aoa), math.sin(aoa)
    rings = []
    xs = np.linspace(-half_span, half_span, 9)
    for x in xs:
        f = abs(float(x)) / half_span
        c = chord * (1.0 - (1.0 - taper) * f)
        drop = tip_drop * f * f
        ring = []
        for (u, w) in prof:
            w = -w if flip else w
            z = lz - c * u * ca - c * w * sa
            y = ly + c * u * sa + c * w * ca - drop
            ring.append((float(x), y, z))
        rings.append(ring)
    part.loft(rings, lambda p, u: color, cap_color=color)


def rounded_plate(z0, z1, y0, y1, r, seg=6):
    """Closed (z, y) outline of a rectangle with rounded corners."""
    pts = []
    corners = [(z1 - r, y0 + r, -math.pi / 2, 0.0),
               (z1 - r, y1 - r, 0.0, math.pi / 2),
               (z0 + r, y1 - r, math.pi / 2, math.pi),
               (z0 + r, y0 + r, math.pi, 3 * math.pi / 2)]
    for (cz, cy, a0, a1) in corners:
        for i in range(seg + 1):
            a = a0 + (a1 - a0) * i / seg
            pts.append((cz + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def build_front_wing():
    part = Part("FrontWing", PAINT, uv=texture.SWATCH_UV)
    span = 0.580
    wing_element(part, (0.182, 2.150), 0.256, math.radians(-7), span, ROSSO,
                 profile=aerofoil(28, 0.095, 0.055), taper=0.94, flip=True)
    wing_element(part, (0.240, 2.022), 0.146, math.radians(-16), span * 0.93,
                 INK, profile=aerofoil(22, 0.085, 0.06), taper=0.92, flip=True)
    for s in (1, -1):
        poly = rounded_plate(1.794, 2.216, 0.120, 0.288, 0.040)
        part.extrude(poly, s * span, s * (span + 0.013), INK)
    for s in (1, -1):     # mounting pylons up to the nose
        part.tube((s * 0.076, 0.216, 2.020), (s * 0.050, 0.300, 2.060),
                  0.015, 0.015, ROSSO, segments=10)
    return part


def build_rear_wing():
    part = Part("RearWing", PAINT, uv=texture.SWATCH_UV)
    span = 0.535
    wing_element(part, (0.766, -1.560), 0.310, math.radians(14), span, ROSSO,
                 profile=aerofoil(30, 0.105, 0.06), taper=0.97)
    wing_element(part, (0.868, -1.668), 0.178, math.radians(26), span * 0.965,
                 INK, profile=aerofoil(24, 0.09, 0.06), taper=0.96)
    wing_element(part, (0.452, -1.596), 0.240, math.radians(11), 0.430, INK,
                 profile=aerofoil(24, 0.10, 0.05), taper=0.95)
    for s in (1, -1):
        poly = rounded_plate(-1.960, -1.462, 0.446, 0.968, 0.050)
        part.extrude(poly, s * span, s * (span + 0.015), INK)
        # Read from texture.py so the endplate and the nose deck cannot
        # disagree — they were "12" and "27" respectively until this was fixed.
        draw_number(part, texture.CAR_NUMBER, s * (span + 0.018), 0.578,
                    -1.712 + s * 0.140, 0.262, 0.262, right=-s, color=ROSSO)
    for s in (1, -1):     # swan-neck supports
        part.hexa([
            (s * 0.056, 0.372, -1.548), (s * 0.084, 0.372, -1.548),
            (s * 0.084, 0.372, -1.764), (s * 0.056, 0.372, -1.764),
            (s * 0.056, 0.776, -1.548), (s * 0.084, 0.776, -1.548),
            (s * 0.084, 0.794, -1.764), (s * 0.056, 0.794, -1.764),
        ], ROSSO)
    return part


# ------------------------------------------------------------- number plate

# Seven-segment digits. Only the ones actually used are defined — an unknown
# character draws nothing at all rather than failing, so anything added to the
# endplate number has to be added here too.
SEGMENTS = {
    "0": "abcdef",
    "1": "bc",
    "2": "abged",
    "3": "abgcd",
    "4": "fgbc",
    "5": "afgcd",
    "6": "afgecd",
    "7": "abc",
    "8": "abcdefg",
    "9": "abfgcd",
}
SEG_BOX = {
    "a": (0.06, 0.86, 0.94, 1.00),
    "b": (0.86, 0.52, 1.00, 0.94),
    "c": (0.86, 0.06, 1.00, 0.48),
    "d": (0.06, 0.00, 0.94, 0.14),
    "e": (0.00, 0.06, 0.14, 0.48),
    "f": (0.00, 0.52, 0.14, 0.94),
    "g": (0.06, 0.43, 0.94, 0.57),
}


def draw_number(part, text, x, y0, z0, w, h, right, color, gap=0.08):
    """Blocky number on a plane of constant x. `right` is +1 or -1 along z."""
    cell = w / (len(text) + gap * (len(text) - 1))
    ref_x = x - 0.05 * (1 if x > 0 else -1)
    for n, ch in enumerate(text):
        base = z0 + right * n * (cell * (1 + gap))
        for seg in SEGMENTS.get(ch, ""):
            u0, v0, u1, v1 = SEG_BOX[seg]
            za, zb = base + right * u0 * cell, base + right * u1 * cell
            ya, yb = y0 + v0 * h, y0 + v1 * h
            part.quad((x, ya, za), (x, ya, zb), (x, yb, zb), (x, yb, za),
                      color, (ref_x, ya, za))


# ------------------------------------------------------------------ wheels


def build_wheel(name, side, cz, radius, hw):
    """Tyre, rim, spokes and brake disc. `side` is +1 for the right wheel."""
    part = Part(name, RUBBER, uv=texture.SWATCH_UV)
    cx = side * (FRONT_X if cz > 0 else REAR_X)
    cy = radius
    centre = (cy, cz)
    seg = 44
    bead = 0.60 * radius

    o = side          # outboard direction along x
    tyre = [
        (-o * 0.62 * hw, bead),
        (-o * 0.82 * hw, 0.645 * radius),
        (-o * 0.96 * hw, 0.740 * radius),
        (-o * 1.00 * hw, 0.855 * radius),
        (-o * 0.985 * hw, 0.940 * radius),
        (-o * 0.910 * hw, 0.988 * radius),
        (-o * 0.780 * hw, 1.000 * radius),
        (0.0, 1.006 * radius),
        (o * 0.780 * hw, 1.000 * radius),
        (o * 0.910 * hw, 0.988 * radius),
        (o * 0.985 * hw, 0.940 * radius),
        (o * 1.00 * hw, 0.855 * radius),
        (o * 0.96 * hw, 0.740 * radius),
        (o * 0.82 * hw, 0.645 * radius),
        (o * 0.62 * hw, bead),
    ]

    def tyre_colour(p, u):
        return TIRE if abs(p[0] - cx) < 0.80 * hw else TIRE_WALL

    rings = []
    for (px, pr) in tyre:
        ring = []
        for i in range(seg):
            t = 2 * math.pi * i / seg
            ring.append((cx + px, cy + pr * math.sin(t), cz + pr * math.cos(t)))
        rings.append(ring)

    def uv(i, m, s, ns):
        return texture.uv_of("tyre", i / m, s / (ns - 1))

    part.loft(rings, tyre_colour, cap_front=False, cap_back=False, uv_fn=uv)

    # rim barrel and outboard face
    part.revolve([(-o * 0.62 * hw, bead), (-o * 0.56 * hw, 0.575 * radius),
                  (o * 0.50 * hw, 0.575 * radius), (o * 0.60 * hw, bead)],
                 RIM, axis_x=cx, centre=centre, segments=seg)
    part.revolve([(o * 0.50 * hw, 0.575 * radius),
                  (o * 0.46 * hw, 0.505 * radius)],
                 RIM, axis_x=cx, centre=centre, segments=seg)
    # brake disc set back inside the rim
    part.revolve([(-o * 0.10 * hw, 0.0), (-o * 0.10 * hw, 0.455 * radius),
                  (o * 0.02 * hw, 0.455 * radius), (o * 0.02 * hw, 0.0)],
                 DISC, axis_x=cx, centre=centre, segments=seg)
    # hub and retaining nut
    part.revolve([(-o * 0.10 * hw, 0.135 * radius),
                  (o * 0.52 * hw, 0.135 * radius)],
                 RIM, axis_x=cx, centre=centre, segments=24)
    part.revolve([(o * 0.52 * hw, 0.0), (o * 0.52 * hw, 0.135 * radius),
                  (o * 0.60 * hw, 0.115 * radius), (o * 0.60 * hw, 0.0)],
                 STEEL, axis_x=cx, centre=centre, segments=24)

    # five spokes bridging hub to rim lip
    xa, xb = cx + o * 0.40 * hw, cx + o * 0.48 * hw
    for k in range(5):
        a = 2 * math.pi * k / 5
        ca, sa = math.cos(a), math.sin(a)
        tz, ty = -sa, ca          # tangential
        pts = []
        for (r, wdt) in ((0.125 * radius, 0.075 * radius),
                         (0.545 * radius, 0.050 * radius)):
            for sgn in (-1, 1):
                pts.append((cz + r * ca + sgn * wdt * tz,
                            cy + r * sa + sgn * wdt * ty))
        quad = [pts[0], pts[1], pts[3], pts[2]]
        part.hexa([
            (xa, quad[0][1], quad[0][0]), (xa, quad[1][1], quad[1][0]),
            (xa, quad[2][1], quad[2][0]), (xa, quad[3][1], quad[3][0]),
            (xb, quad[0][1], quad[0][0]), (xb, quad[1][1], quad[1][0]),
            (xb, quad[2][1], quad[2][0]), (xb, quad[3][1], quad[3][0]),
        ], RIM)
    return part


# -------------------------------------------------------------- suspension


def build_suspension():
    part = Part("Suspension", CARBONM, uv=texture.SWATCH_UV)
    r = 0.0125
    for s in (1, -1):
        # front corner
        hx, hz, hr = s * FRONT_X, FRONT_AXLE_Z, FRONT_R
        top = (hx - s * 0.055, hr + 0.098, hz)
        bot = (hx - s * 0.055, hr - 0.105, hz)
        part.tube(bot, top, 0.030, 0.026, CARBON, segments=12)
        for (hub, ty) in ((top, 0.402), (bot, 0.212)):
            part.tube(hub, (s * (body_hw(hz + 0.26) - 0.01), ty, hz + 0.30),
                      r, r, CARBON, segments=10)
            part.tube(hub, (s * (body_hw(hz - 0.24) - 0.01), ty, hz - 0.26),
                      r, r, CARBON, segments=10)
        part.tube(bot, (s * 0.150, 0.498, hz - 0.330), 0.012, 0.012, CARBON,
                  segments=10)                                   # pushrod
        part.tube((hx - s * 0.075, hr + 0.010, hz - 0.100),
                  (s * 0.190, 0.336, hz - 0.255), 0.010, 0.010, CARBON,
                  segments=8)                                    # track rod

        # rear corner
        hx, hz, hr = s * REAR_X, REAR_AXLE_Z, REAR_R
        top = (hx - s * 0.070, hr + 0.108, hz)
        bot = (hx - s * 0.070, hr - 0.116, hz)
        part.tube(bot, top, 0.034, 0.029, CARBON, segments=12)
        for (hub, ty) in ((top, 0.470), (bot, 0.208)):
            part.tube(hub, (s * 0.125, ty, hz + 0.300), r, r, CARBON,
                      segments=10)
            part.tube(hub, (s * 0.125, ty, hz - 0.215), r, r, CARBON,
                      segments=10)
        part.tube(bot, (s * 0.115, 0.520, hz + 0.330), 0.013, 0.013, CARBON,
                  segments=10)
        part.tube((hx - s * 0.070, hr, hz), (s * 0.095, hr, hz),
                  0.030, 0.030, CARBON, segments=12)             # driveshaft
    return part


def build_powertrain():
    part = Part("Powertrain", METAL, uv=texture.SWATCH_UV)
    for s in (1, -1):
        part.tube((s * 0.150, 0.498, -0.930), (s * 0.192, 0.436, -1.520),
                  0.040, 0.034, STEEL, segments=14)
    part.hexa([
        (-0.122, 0.232, -1.180), (0.122, 0.232, -1.180),
        (0.096, 0.252, -1.610), (-0.096, 0.252, -1.610),
        (-0.122, 0.452, -1.180), (0.122, 0.452, -1.180),
        (0.096, 0.392, -1.610), (-0.096, 0.392, -1.610),
    ], (0.20, 0.205, 0.215))
    return part


def build():
    return [
        build_body(),
        build_sidepods(),
        build_cockpit(),
        build_engine_details(),
        build_floor(),
        build_front_wing(),
        build_rear_wing(),
        build_powertrain(),
        build_suspension(),
        build_wheel("Wheel_FL", -1, FRONT_AXLE_Z, FRONT_R, FRONT_HW),
        build_wheel("Wheel_FR", 1, FRONT_AXLE_Z, FRONT_R, FRONT_HW),
        build_wheel("Wheel_RL", -1, REAR_AXLE_Z, REAR_R, REAR_HW),
        build_wheel("Wheel_RR", 1, REAR_AXLE_Z, REAR_R, REAR_HW),
    ]


def paint_atlas(dump=None):
    """Build the livery atlas. Split out of main() so the render pipeline can
    ask for a 4096 master without also writing a GLB."""
    return texture.build_atlas(
        body_z=(BODY_STATIONS[0][0], BODY_STATIONS[-1][0]),
        pod_z=(POD_STATIONS[0][0], POD_STATIONS[-1][0]),
        deck=ROSSO_S, band=INK_S, dark=JET_S,
        body_perim=_perimeter_lookup(BODY_STATIONS, BODY_SEGS,
                                     taper=BODY_TAPER),
        pod_perim=_perimeter_lookup(POD_STATIONS, POD_SEGS, e=5.8,
                                    taper=POD_TAPER),
        # Full top width at a station. texture.DECK_USABLE trims the outer
        # part that curves away and foreshortens when seen from above.
        body_deck=lambda z: 2.0 * body_hw(z),
        pod_deck=lambda z: 2.0 * station_lookup(POD_CONTROL, z, 1),
        path=dump)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a.split("=")[0]: a.partition("=")[2] for a in sys.argv[1:]
             if a.startswith("--")}

    out = args[0] if args else os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "public", "models", "mclaren-mp4-4.glb")
    os.makedirs(os.path.dirname(out), exist_ok=True)

    if "--atlas" in flags and flags["--atlas"]:
        texture.set_size(int(flags["--atlas"]))

    parts = build()
    atlas = paint_atlas(dump=flags.get("--atlas-out") or None)
    png = texture.to_png_bytes(atlas)
    size = write_glb(parts, MATERIALS, out, extensions_used=EXTENSIONS,
                     texture_png=png)
    tris = sum(len(p) for p in parts)
    print(f"{out}\n  {len(parts)} meshes, {tris} triangles, "
          f"{texture.SIZE}px atlas, {size/1024:.0f} KB")


if __name__ == "__main__":
    main()
