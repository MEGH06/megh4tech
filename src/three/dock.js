/**
 * Where the car sits on screen.
 *
 * Content sections no longer cover the car — they push it aside. Each section
 * claims a dock while it is on screen, and the car scales down and slides to
 * the free side rather than disappearing behind glass.
 *
 * Driven by the sections themselves rather than by scroll position, because
 * section heights change whenever content does; hard-coding scroll thresholds
 * would silently drift out of alignment the first time a hackathon name got
 * added.
 *
 * A plain module store with subscribers, not React state: this is read every
 * animation frame and a re-render per frame would be absurd.
 *
 * ## Why this measures occupancy rather than intersectionRatio
 *
 * It used to take `IntersectionObserver`'s `intersectionRatio` straight from
 * the entry. That is the fraction of *the element's own area* that is visible,
 * which is the wrong quantity here and fails badly on exactly the sections
 * that need docking most.
 *
 * Projects runs ~2500px tall. In an 800px viewport its ratio cannot exceed
 * 800/2500 = 0.32 no matter how completely it owns the screen. At 0.32 the car
 * slid barely half way, shrank to only ~0.66, and `hold` — which needs 0.55 —
 * never left zero, so the lap kept crawling while someone was trying to read.
 * The result was a large, moving car directly behind the text.
 *
 * What actually matters is "how much of the screen is this section", so that
 * is what gets measured: visible height over the most this section could ever
 * show. A tall section fully covering the viewport and a short section fully
 * on screen both reach 1.
 */

// x: -1 hard left, 0 centre, +1 hard right (as a fraction of half the frame)
// scale: 1 fills the frame, 0.4 is docked small
const CENTRED = { x: 0, y: 0, scale: 1, hold: 0 };

const claims = new Map();
const listeners = new Set();
let current = { ...CENTRED };

let ticking = false;
let bound = false;

/**
 * Fraction of the available screen this node occupies, 0..1.
 *
 * The denominator is `min(viewportHeight, elementHeight)` — the most of itself
 * the element could possibly have on screen at once. Normalising by the
 * viewport alone would cap short sections below 1; normalising by the element
 * alone is the bug described above.
 */
function occupancy(node) {
  const vh = window.innerHeight || document.documentElement.clientHeight || 1;
  const r = node.getBoundingClientRect();
  if (r.height <= 0) return 0;

  const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
  const span = Math.min(vh, r.height) || 1;
  return Math.max(0, Math.min(1, visible / span));
}

function recompute() {
  // The most-visible claim wins. Two sections overlap during every scroll
  // between them, and without this the car would flick between docks.
  let best = null;
  let bestRatio = 0;

  claims.forEach((c) => {
    const ratio = c.node ? occupancy(c.node) : 0;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = c;
    }
  });

  if (!best || bestRatio < 0.12) {
    current = { ...CENTRED, hold: 0 };
  } else {
    // Ease in over the first part of the section's visibility so the car
    // slides aside as the content arrives instead of snapping when it crosses
    // a threshold.
    const t = Math.min(1, (bestRatio - 0.12) / 0.38);
    current = {
      x: best.x * t,
      y: (best.y ?? 0) * t,
      scale: 1 + (best.scale - 1) * t,
      // Once a section genuinely owns the screen the car parks: the lap stops
      // advancing so it is not still crawling round while someone is reading.
      // Ramped rather than switched, or the camera would stall mid-move.
      hold: Math.min(1, Math.max(0, (bestRatio - 0.55) / 0.25)),
    };
  }

  listeners.forEach((fn) => fn(current));
}

/**
 * Recompute on the next frame.
 *
 * Coalesced, so a scroll burst costs one measurement pass. Only currently
 * registered (on-screen) sections are measured — at most two or three during
 * a transition — so the reads are trivial, and they happen inside rAF where
 * nothing has written to the DOM since the last layout.
 */
function schedule() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    recompute();
  });
}

function bind() {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}

function unbind() {
  if (!bound || claims.size > 0) return;
  bound = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
}

export function claimDock(id, spec) {
  claims.set(id, spec);
  bind();
  schedule();
}

export function releaseDock(id) {
  if (!claims.delete(id)) return;
  unbind();
  schedule();
}

export function getDock() {
  return current;
}

export function onDock(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
