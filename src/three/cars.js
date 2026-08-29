import { asset } from '../lib/assets';
/**
 * The garage.
 *
 * Every model is normalised at load — measured, scaled to a common length and
 * re-centred — so nothing here needs per-car scale or offset numbers. See
 * `CarStage`'s `Car` component.
 *
 * Sizes are post-pipeline: textures downscaled by `tools/shrink_glb_textures.py`
 * (sharp's libvips cannot resize in this environment), then meshopt-compressed
 * and simplified by gltf-transform. 88.7 MB of source became 10.8 MB.
 */

export const CARS = {
  /** Built procedurally by tools/generate_f1_glb.py — carries the stack as
   *  sponsor decals. The only car that is genuinely Megh's. 1.0 MB. */
  scuderia: { url: asset('/models/mclaren-mp4-4.glb'), label: 'Scuderia Megh4Tech' },

  f2022: { url: asset('/models/f1_2022_generic.glb'), label: '2022 · ground effect' },
  williams: { url: asset('/models/2008_williams_fw30.glb'), label: '2008 · FW30' },
  sf71h: { url: asset('/models/2018_ferrari_sf71h.glb'), label: '2018 · SF71H' },
  f2000: { url: asset('/models/2000_ferrari_f2000.glb'), label: '2000 · F2000' },
};

export const DEFAULT_CAR = 'scuderia';
