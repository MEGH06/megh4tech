/**
 * The signature drawn during the loading transition.
 *
 * **One subpath.** The draw is a `stroke-dashoffset` animation, and Chrome
 * restarts the dash pattern at every `M` command — so a path with two subpaths
 * draws both of them at once instead of one after the other. Everything here
 * is a single continuous stroke from the first point to the last, which is
 * also how a signature is actually written: the pen stays down.
 *
 * **No fill.** `d` describes the centreline the pen travels, not the outline
 * around the ink. This matters when replacing it: tracing a photograph of a
 * signature (potrace, Illustrator's Image Trace) produces filled outlines, and
 * those cannot be drawn this way — they would need the clip-path sweep in
 * `StartLights.module.css` instead.
 *
 * **Replacing it.** Swap `d` and `viewBox` together and nothing else changes.
 * The path element carries `pathLength="1"`, which renormalises the geometry so
 * the CSS dash values stay `1` no matter how long the new artwork actually is —
 * there is no length constant to keep in sync and no `getTotalLength()` call.
 *
 * This mark is authored, not scanned: a drawn "Megh Dave" logotype standing in
 * until a real signature is supplied. It is not a reproduction of anyone's
 * handwriting.
 */
export const SIGNATURE = {
  viewBox: '0 0 320 90',

  // Guides used while drawing: ascender 16, x-height 38, baseline 62,
  // descender 82. Capitals run above the ascender line because in a signature
  // they dominate and the rest of the name trails after them.
  d: [
    'M 8 70',
    // M
    'C 9 50 11 24 19 15',
    'C 28 9 31 38 32 60',
    'C 34 38 40 12 48 17',
    'C 55 21 52 46 50 60',
    // e — steep entry, small tilted eye, exit off the baseline. A closed round
    // loop reads as an o.
    'C 52 54 54 46 60 42',
    'C 64 39 68 43 66 49',
    'C 64 55 56 57 54 51',
    'C 52 45 58 41 63 44',
    'C 67 46 70 52 74 52',
    // g, with the descender loop
    'C 78 46 86 42 90 48',
    'C 93 55 85 60 81 55',
    'C 78 50 83 44 89 46',
    'C 93 52 95 66 91 76',
    'C 87 84 77 84 75 78',
    'C 73 73 79 70 85 73',
    // h — narrow ascender loop, then the arch
    'C 93 74 97 58 99 44',
    'C 101 30 102 14 108 15',
    'C 114 16 111 30 107 44',
    'C 105 52 105 57 106 61',
    'C 108 47 113 41 119 43',
    'C 125 45 123 55 122 61',
    // the long connector into D
    'C 125 50 131 43 141 43',
    'C 152 43 154 26 156 13',
    // D — stem down, bowl round, exit back over the top
    'C 154 32 152 48 153 62',
    'C 171 63 183 54 183 41',
    'C 184 24 172 14 158 14',
    'C 167 13 180 24 185 38',
    'C 188 43 189 44 192 44',
    // a — closed bowl with a real stem down to the baseline
    'C 187 40 180 45 181 52',
    'C 182 59 190 62 195 56',
    'C 199 51 199 45 197 42',
    'C 199 48 199 55 200 61',
    'C 202 55 205 49 209 47',
    // v — opposing curves meeting at a corner, so it does not read as u
    'C 212 44 213 43 214 45',
    'C 216 50 218 57 220 61',
    'C 222 56 225 48 227 43',
    'C 228 41 230 43 232 45',
    // e
    'C 234 52 236 46 242 43',
    'C 246 40 250 45 248 51',
    'C 246 57 238 59 236 53',
    'C 234 47 240 43 245 46',
    'C 249 48 252 53 256 51',
    // the underline, sweeping right then back beneath the whole name
    'C 266 44 280 40 292 44',
    'C 302 47 306 56 298 62',
    'C 286 70 250 72 210 72',
    'C 170 72 130 70 108 68',
  ].join(' '),
};
