/**
 * Move the heavy assets to Cloudinary, and write the map the site reads.
 *
 *   node tools/cloudinary.mjs            # dry run — lists what WOULD upload
 *   node tools/cloudinary.mjs --verify   # checks credentials, uploads nothing
 *   node tools/cloudinary.mjs --upload   # uploads, then writes src/data/cdn.js
 *
 * Dry run is the default on purpose, and it needs no credentials: uploading is
 * the only step that reaches outside this machine, so it has to be asked for
 * rather than being what happens when you run the file to see what it does.
 *
 * No SDK. A Cloudinary signed upload is a SHA-1 over the sorted parameters plus
 * the API secret, and Node has had fetch, FormData and crypto built in since
 * 18 — adding a dependency to save twenty lines would be a poor trade on a
 * project that just went from 17 production dependencies to 8.
 *
 * The secret never reaches the browser. This file is run by Node, reads a
 * gitignored .env, and nothing it touches is imported from src/. The one way to
 * leak it would be to name the variable VITE_something, because Vite inlines
 * those into the client bundle — so readEnv refuses to continue if it sees one.
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const MAP_FILE = path.join(ROOT, 'src', 'data', 'cdn.js');
const NL = String.fromCharCode(10);

/**
 * What moves.
 *
 * Directories are taken whole, so a new screenshot or a new car is picked up
 * without editing this list. Everything else in public/ — robots.txt,
 * sitemap.xml, the favicon — stays in the repo: it is tiny, and some of it has
 * to be served from the site's own origin to work at all.
 */
const MANIFEST = [
  { dir: 'models', match: /\.glb$/i, kind: 'raw' },
  { dir: 'shots', match: /\.(jpe?g|png)$/i, kind: 'image' },
  { file: 'hero-loop.mp4', kind: 'video' },
  { file: 'cybersecure.jpg', kind: 'image' },
  { file: 'jigyasaa.jpg', kind: 'image' },
  { file: 'pinn_medium.jpg', kind: 'image' },
];

const REQUIRED = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

// --- environment ----------------------------------------------------------

/** Returns { env } or { error }. Never exits, so the dry run can report status. */
async function readEnv() {
  let raw;
  try {
    raw = await readFile(path.join(ROOT, '.env'), 'utf8');
  } catch {
    return { error: 'No .env file. Copy .env.example to .env and fill it in.' };
  }

  const env = {};
  for (const line of raw.split(NL)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }

  const leaked = Object.keys(env).filter(
    (k) => k.startsWith('VITE_') && /SECRET|KEY/.test(k),
  );
  if (leaked.length) {
    return {
      error: `${leaked.join(', ')} is prefixed VITE_, which Vite inlines into `
        + 'the browser bundle. Rename it without the prefix — a Cloudinary '
        + 'secret in client JavaScript is readable by every visitor.',
    };
  }

  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length) {
    return {
      error: `missing in .env — ${missing.join(', ')}. All three are on your `
        + 'Cloudinary dashboard; the API key is the 15-digit number.',
    };
  }

  env.CLOUDINARY_FOLDER ||= 'megh4tech';
  return { env };
}

// --- collecting -----------------------------------------------------------

async function collect() {
  const out = [];
  for (const entry of MANIFEST) {
    if (entry.file) {
      const abs = path.join(PUBLIC, entry.file);
      try {
        const s = await stat(abs);
        out.push({ abs, pub: `/${entry.file}`, kind: entry.kind, size: s.size });
      } catch { /* not present; skip quietly */ }
      continue;
    }
    let names = [];
    try {
      names = await readdir(path.join(PUBLIC, entry.dir));
    } catch { continue; }
    for (const n of names.filter((x) => entry.match.test(x))) {
      const abs = path.join(PUBLIC, entry.dir, n);
      const s = await stat(abs);
      out.push({ abs, pub: `/${entry.dir}/${n}`, kind: entry.kind, size: s.size });
    }
  }
  return out.sort((a, b) => b.size - a.size);
}

// --- uploading ------------------------------------------------------------

/** Cloudinary's signature: sorted k=v pairs joined by &, then the secret, SHA-1. */
function sign(params, secret) {
  const base = Object.keys(params).sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(base + secret).digest('hex');
}

async function upload(item, env) {
  // public_id mirrors the local path, so the CDN layout matches the repo and a
  // re-run overwrites in place instead of piling up copies.
  const publicId = item.pub.replace(/^\//, '').replace(/\.[^.]+$/, '');
  const signed = {
    folder: env.CLOUDINARY_FOLDER,
    overwrite: 'true',
    public_id: publicId,
    timestamp: Math.floor(Date.now() / 1000),
  };

  const form = new FormData();
  form.append('file', new Blob([await readFile(item.abs)]), path.basename(item.abs));
  for (const [k, v] of Object.entries(signed)) form.append(k, String(v));
  form.append('api_key', env.CLOUDINARY_API_KEY);
  form.append('signature', sign(signed, env.CLOUDINARY_API_SECRET));

  const url = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${item.kind}/upload`;
  const res = await fetch(url, { method: 'POST', body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
  return json.secure_url;
}

// --- output ---------------------------------------------------------------

async function writeMap(map) {
  const rows = Object.keys(map).sort()
    .map((k) => `  '${k}': '${map[k]}',`)
    .join(NL);

  const head = [
    '/**',
    ' * Generated by tools/cloudinary.mjs. Do not edit by hand.',
    ' *',
    ' * Maps a local public path to the URL it is served from. Empty means',
    ' * everything is served from this repo; see src/lib/assets.js.',
    ' *',
    ' * To roll back to local hosting, replace CDN with {} — that is the whole',
    ' * rollback, and the files are all still in public/.',
    ' */',
    'export const CDN = {',
  ].join(NL);

  const tail = [
    '};',
    '',
    `export const CDN_UPLOADED_AT = '${new Date().toISOString()}';`,
    '',
  ].join(NL);

  await writeFile(MAP_FILE, `${head}${NL}${rows}${NL}${tail}`, 'utf8');
}

// --- driver ---------------------------------------------------------------

const KB = (n) => `${(n / 1024).toFixed(0)} KB`;
const MB = (n) => `${(n / 1048576).toFixed(1)} MB`;
const say = (s = '') => console.log(s);

const args = new Set(process.argv.slice(2));
const { env, error } = await readEnv();

if (args.has('--verify')) {
  if (error) { say(); say(`  Not ready: ${error}`); say(); process.exit(1); }
  const auth = Buffer.from(
    `${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`,
  ).toString('base64');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/image?max_results=1`,
    { headers: { Authorization: `Basic ${auth}` } },
  );
  say();
  say(res.ok
    ? `  Credentials OK — cloud "${env.CLOUDINARY_CLOUD_NAME}" is reachable.`
    : `  Credentials REJECTED (HTTP ${res.status}). Check .env against the dashboard.`);
  say();
  process.exit(res.ok ? 0 : 1);
}

const items = await collect();
const total = items.reduce((s, i) => s + i.size, 0);

say();
say(`  ${items.length} assets, ${MB(total)} total`);
say();
for (const i of items) {
  say(`    ${String(KB(i.size)).padStart(8)}  ${i.kind.padEnd(5)}  ${i.pub}`);
}

if (!args.has('--upload')) {
  say();
  say('  Dry run. Nothing uploaded, nothing changed.');
  say(error
    ? `  Not ready yet: ${error}`
    : '  Credentials present. To upload:  node tools/cloudinary.mjs --upload');
  say();
  process.exit(0);
}

if (error) { say(); say(`  ERROR  ${error}`); say(); process.exit(1); }

say();
say(`  Uploading to "${env.CLOUDINARY_CLOUD_NAME}"/${env.CLOUDINARY_FOLDER} ...`);
say();

const map = {};
let failed = 0;
for (const i of items) {
  try {
    map[i.pub] = await upload(i, env);
    say(`    OK    ${i.pub}`);
  } catch (e) {
    failed += 1;
    say(`    FAIL  ${i.pub}  — ${e.message}`);
  }
}

// Anything that failed is simply absent from the map and keeps being served
// from public/, so a partial run degrades instead of breaking the page.
await writeMap(map);
say();
say(`  Wrote src/data/cdn.js — ${Object.keys(map).length} mapped, ${failed} failed.`);
say('  Rebuild to pick it up:  sh tools/rebuild.sh');
say();
