# F1 car GLB generator

Procedurally builds a 1988-McLaren-MP4/4-style Formula 1 car and writes it as a
single self-contained `.glb`. No modelling app, no textures, no dependencies
beyond `numpy` (plus `matplotlib` / `pillow` for the preview tools).

```bash
python tools/generate_f1_glb.py                 # -> public/models/mclaren-mp4-4.glb
python tools/generate_f1_glb.py out/car.glb     # custom path

python tools/render_glb.py public/models/mclaren-mp4-4.glb hero.png hero
python tools/render_glb.py public/models/mclaren-mp4-4.glb sheet.png   # 4 views
python tools/preview_glb.py public/models/mclaren-mp4-4.glb quick.png  # fast, flat-shaded
```

## Model

- glTF 2.0 binary, Y up, metres, nose towards **+Z**, wheels resting on `y = 0`
- 4.28 m long, 1.82 m wide, 0.97 m tall, 2.875 m wheelbase
- ~44k triangles, ~2.6 MB (incl. a 2048px texture atlas), 13 named meshes: `Body`, `Sidepods`, `Cockpit`,
  `EngineCover`, `Floor`, `FrontWing`, `RearWing`, `Powertrain`, `Suspension`,
  `Wheel_FL/FR/RL/RR`
- 4 PBR materials — `CarPaint` (clear-coated), `Rubber`, `Carbon`, `Metal`
- One embedded 2048px atlas (`texture.py`) carrying the painted livery, panel
  lines, the nose number, the sponsor decals and moulded tyre sidewall
  lettering. Base colour = atlas x `COLOR_0`, so parts that are not unwrapped
  point at a flat white swatch and keep their vertex colour
- `KHR_materials_clearcoat` is genuinely applied, not merely declared:
  `CarPaint` carries `clearcoatFactor 0.85 / clearcoatRoughness 0.08` and
  `Carbon` `0.5 / 0.15`. A viewer that ignores the extension still renders
  correctly, it just loses the coat. Note that clearcoat needs *something to
  reflect* — under punctual lights alone it adds a tight highlight and little
  else, so a viewer wanting glossy paint has to supply an environment

### Colour space — read this before changing the palette

Base colour is `baseColorFactor x baseColorTexture x COLOR_0`, and the two
sources are **not** in the same space: glTF defines `baseColorTexture` as sRGB
and `COLOR_0` as linear. So:

- `Body` and `Sidepods` are textured and carry `COLOR_0 = white`. The atlas is
  the single source of their colour. Writing the livery into both would square
  it — tomato `#FF5A3C` would come out a hot scarlet.
- Everything else points at the flat white swatch and carries its colour in
  `COLOR_0`, which therefore has to be **linear**. `generate_f1_glb._lin()`
  does that conversion; the palette itself is written in sRGB because that is
  what the hex values mean.

`render_glb.py` decodes the atlas with `** 2.2` on load for the same reason.
Skip that and every albedo is gamma-boosted twice and the car washes out.

Every mesh is its own node: wheels can be spun and parts hidden or recoloured
individually.

## How the surfaces are built

1. **Control sections.** `BODY_CONTROL` and `POD_OUTLINE` list a handful of
   cross-sections as `(z, width, bottom, top)`.
2. **Spline resampling.** `resample()` runs Catmull-Rom through them at ~3 cm
   spacing, so the longitudinal curvature is smooth rather than segmented.
3. **Arc-length sections.** `section()` builds a tapered superellipse and
   redistributes its points by arc length. A plain angular sweep bunches
   vertices into the corners and starves the flat flanks, which shows up as
   uneven shading and stepped livery edges.
4. **Welded normals.** `Part` groups faces into smoothing groups and averages
   an area-weighted normal per (position, group), so bodywork reads as one
   continuous shell while plates and edges stay crisp.
5. **Parametric livery.** `body_livery(p, u)` receives `u`, the position around
   the section. Splits at a constant `u` (or a constant ring) land exactly on
   mesh edges — a split on a world-space height would cut diagonally across the
   triangles and stair-step.
6. **UV unwrap.** The lofts map `u` around the section and `v` along the body
   straight into atlas regions, so painting happens in a flat rectangle. The
   seam column deliberately uses `u = 1` rather than wrapping to `0`, which
   splits it into its own vertices and stops the texture smearing. The two
   sidepods are mirror images, so each gets its own tile — a shared one shows
   one side's decals backwards.

Wings are real NACA-style aerofoils (`aerofoil()` + `wing_element()`), and the
wheels are solids of revolution with a bead, sidewall bulge, rim barrel, five
spokes, a hub nut and a brake disc.

## Editing

- Shape: `BODY_CONTROL`, `POD_OUTLINE`, `BODY_TAPER`, `POD_TAPER`
- Stance: `FRONT_AXLE_Z`, `REAR_AXLE_Z`, radii, track and tyre widths
- Density: `BODY_STEP` / `BODY_SEGS`, `POD_STEP` / `POD_SEGS`
- Colours: the palette block, `body_livery()`, `pod_livery()`
- Texture: `texture.py` — `REGIONS`, `paint_body()`, `paint_pod()`,
  `paint_tyre()`. Decal text lives there (swap `MP4/4` / `megh4tech`)
- The `12` on the rear wing endplates: `draw_number()`

`glbkit.py` holds the reusable parts — the mesh builder (`quad`, `hexa`,
`loft`, `revolve`, `extrude`, `tube`) and the GLB writer.

## Tools

| script | what it does |
| --- | --- |
| `generate_f1_glb.py` | builds the car, writes the GLB |
| `render_glb.py` | software rasteriser: per-pixel normals, specular, clear-coat sheen, contact shadow. Matches what a GPU viewer shows |
| `preview_glb.py` | fast matplotlib preview. Flat-shades each facet, so smooth surfaces look faceted — use `render_glb.py` to judge shading |
| `texture.py` | paints the atlas; run `build_atlas(..., path="atlas.png")` to dump it for inspection |

`render_glb.py` also reflects a small procedural studio environment. Without
an environment to reflect, clear-coated paint reads as matte plastic — that is
most of what separates a "finished" viewer render from a flat one.
