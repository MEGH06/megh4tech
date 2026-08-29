/**
 * Generated. Do not edit by hand.
 *
 * Written by `node tools/cloudinary.mjs --upload`. Maps a local public path to
 * the URL it was uploaded to, and it is the entire switch between serving
 * assets from this repo and serving them from Cloudinary.
 *
 * Empty means everything is served locally, which is the state the site ships
 * in today. Nothing else in the codebase has to know which mode it is in —
 * `lib/assets.js` reads this and every call site goes through it.
 *
 * To go back to local hosting: empty this object. That is the whole rollback.
 */
export const CDN = {};

/** Set by the uploader so it is obvious in the diff when assets last moved. */
export const CDN_UPLOADED_AT = null;
