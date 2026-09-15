import { PAGE_AT } from '../three/circuit';
import { isNarrow } from './narrow';

/**
 * Scroll progress, re-timed so the lap lands on the page it was cut for.
 *
 * Every `at` in the lap was set against the desktop page: the drift plays in
 * the gap after Experience because on a laptop that gap sits at 0.48 of the
 * scroll. On a phone the text sections are several screens tall, the same gap
 * sits somewhere else entirely, and raw progress plays the drift behind a wall
 * of project cards.
 *
 * So on phones progress is mapped through the page itself. Each section's top
 * is pinned to the progress it had on desktop, and each car window gets three
 * pins — about to enter, centred, gone — so a move that starts before a gap,
 * peaks in it and exits after it still does all three while the window is on
 * screen, however tall the sections either side have become. Between pins the
 * mapping is linear.
 *
 * Desktop is the identity: the table was measured there.
 */

let dirty = true;
let xs = null;
let ys = null;

/** Called whenever the document height may have changed. */
export const markLapDirty = () => {
  dirty = true;
};

function measure() {
  dirty = false;
  xs = null;
  ys = null;
  if (!isNarrow()) return;

  const vh = window.innerHeight;
  const span = document.documentElement.scrollHeight - vh;
  if (span <= 0) return;

  const pts = [];
  // Strictly increasing on both axes or the segment is dropped: two pins on
  // the same pixel, or a pin that would run the lap backwards, are what a
  // clamped first or last window produces.
  const push = (px, lap) => {
    const c = Math.min(span, Math.max(0, px));
    const last = pts[pts.length - 1];
    if (last && (c <= last[0] || lap <= last[1])) return;
    pts.push([c, lap]);
  };

  PAGE_AT.forEach((a) => {
    const el = a.lap
      ? document.querySelector(`[data-lap="${a.lap}"]`)
      : document.getElementById(a.id);
    if (!el) {
      if (import.meta.env.DEV) console.warn('lap anchor missing', a);
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (a.lap) {
      const [g0, g1] = a.at;
      const h = el.offsetHeight;
      push(top - vh, 2 * g0 - g1);
      push(top + h / 2 - vh / 2, g0);
      push(top + h, g1);
    } else {
      push(top, a.at);
    }
  });

  if (!pts.length || pts[0][0] > 0) pts.unshift([0, 0]);
  const last = pts[pts.length - 1];
  if (last[0] >= span) pts[pts.length - 1] = [span, 1];
  else pts.push([span, 1]);
  if (pts.length < 2) return;

  xs = pts.map((q) => q[0] / span);
  ys = pts.map((q) => q[1]);
}

/** Lap progress for document progress `p`. */
export function lapTime(p) {
  if (dirty) measure();
  if (!xs) return p;
  let i = 0;
  while (i < xs.length - 2 && p >= xs[i + 1]) i += 1;
  const w = xs[i + 1] - xs[i] || 1;
  const t = Math.min(1, Math.max(0, (p - xs[i]) / w));
  return ys[i] + t * (ys[i + 1] - ys[i]);
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__lap = { lapTime, pts: () => (xs ? { xs, ys } : null) };
}
