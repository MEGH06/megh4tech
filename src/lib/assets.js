import { CDN } from '../data/cdn';

/**
 * Resolve a public asset path to wherever it is actually served from.
 *
 * Every heavy asset on the site — the five car models, the hero video, the
 * project screenshots — goes through here rather than being hard-coded, so
 * moving them to a CDN is a change to one generated file instead of a change
 * to every call site.
 *
 * The fallback is the point. If a path is not in the map, it is returned
 * unchanged and the browser fetches it from `public/` exactly as before. That
 * means:
 *
 *   - the site works with an empty map, which is how it ships today;
 *   - a partial upload cannot break the page, because whatever did not upload
 *     simply keeps being served locally;
 *   - rolling back is emptying the map, not reverting code.
 *
 * Paths are the canonical public path with a leading slash — `/models/x.glb`,
 * not `models/x.glb` — because that is what the call sites already use and a
 * mismatch would silently miss the map and fall back to local. `normalise`
 * below forgives the leading slash so a caller cannot get it subtly wrong.
 */
export function asset(path) {
  if (!path) return path;

  // Already absolute: an http(s) URL or a data URI is returned untouched, so
  // passing an already-resolved URL through this a second time is harmless.
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;

  const key = path.startsWith('/') ? path : `/${path}`;
  return CDN[key] ?? path;
}

/** True when this asset is being served from the CDN rather than from `public/`. */
export function isRemote(path) {
  return asset(path) !== path;
}
