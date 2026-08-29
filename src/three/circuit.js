/**
 * The lap.
 *
 * The old path lerped between seven arbitrary eye positions, which is why
 * every move had the same character however good the individual shots were.
 * This is a circuit instead: the camera makes one full orbit of the car, and
 * the orbit is shaped like a street course — long fast sweeps, then tight slow
 * corners that reverse direction.
 *
 * Invented, but Monaco-inspired: a climb out of the first corner, a sweeping
 * left, a hairpin that is by far the slowest and closest point on the lap, a
 * dark fast tunnel, then a chicane and the run to the line.
 *
 * Polar, not cartesian. `az` is the bearing around the car in degrees (0 is
 * dead ahead of the nose, increasing clockwise seen from above) and `el` is
 * elevation. Writing it this way is what makes the shape a lap rather than a
 * list of viewpoints — azimuth marching 0 to 360 IS the circuit.
 */

/**
 * Screen time is deliberate, and tied to the page.
 *
 * A car holds the stage from its own keyframe until the next car's keyframe,
 * so the `at` spacing IS the edit. The boundaries below are set against the
 * measured scroll fractions of the real sections, not chosen by feel:
 *
 *   home     0.000 – 0.060      projects  0.594 – 0.715
 *   about    0.119 – 0.199      research  0.715 – 0.779
 *   education 0.199 – 0.254     skills    0.838 – 0.941
 *   record   0.314 – 0.408      articles  0.941 – 0.992
 *   paddock  0.408 – 0.534      contact   0.992 – 1.000
 *
 * Which gives:
 *
 *   MP4/4   0.00 – 0.13   13%   the grid and the plan view
 *   SF71H   0.13 – 0.25   12%   about and education — nose toward the camera
 *   FW30    0.25 – 0.72   47%   from the break after EDUCATION, all the way
 *                               through the record, experience and projects
 *   2022    0.72 – 0.85   13%   research
 *   MP4/4   0.85 – 1.00   15%   returns to plan view behind SKILLS, where its
 *                               painted decals name the same stack the list
 *                               does, then runs to the line
 *
 * The white FW30 takes the lap's whole middle — nearly half of it — and picks
 * the car up immediately after Education, which is where it was asked for.
 */
/**
 * Lens language: long AND wide, deliberately alternating.
 *
 * Every shot used to sit between 18 and 36 degrees — all long-lens
 * compression, which is the elegant choice and the least arresting one. The
 * automotive work worth stealing from does the opposite: a wide lens close to
 * the ground, near enough that the car overflows the frame and its proportions
 * exaggerate. That is what makes a car look like it is looming at you rather
 * than being observed politely from across a car park.
 *
 * So the lap now runs 18 to 58 degrees. The wide shots (52, 58, 54, 48) are
 * pulled in close — `dist` down to 0.40 — so they read as DETAIL crops: a
 * front wing, a wheel, a nose filling the screen, rather than the whole car
 * shrunk into the middle. Nothing but full-car shots is exactly why it felt
 * repetitive however good the path was.
 *
 * The long lenses stay for the tunnel and the plan views, and the contrast
 * between the two is the point.
 */

/**
 * `frame` is composition: where the car sits in the shot, in half-frames.
 *
 * Every shot used to be perfectly centred on the car, which is what a lock-on
 * does, not a camera operator. A broadcast frames with lead room — the subject
 * on a third, space in the direction it is travelling — and drops the car low
 * with air above it for the hero angles. Centring everything is why the flight
 * read as mechanical however good the individual positions were.
 *
 * The two plan views stay dead centre on purpose: overhead is a diagram, and a
 * diagram is centred.
 */
export const LAP = [
  // ============================ HOME 0.000-0.050 =======================
  // Short section. Low wide, front three-quarter, the car looming.
  { at: 0.000, car: 'scuderia', az: 0, el: 16, rel: 34, dist: 0.60, fov: 52, roll: 0, corner: false, frame: [0, -0.14] },
  { at: 0.054, car: 'scuderia', az: 12, el: 20, rel: 38, dist: 0.72, fov: 44, roll: 4, corner: false, frame: [-0.10, -0.10] },

  // ---------------------------- GAP 0.050-0.099 ------------------------
  // Nothing to read. +50 degrees in 0.025 — the fastest move on the lap.
  { at: 0.082, car: 'scuderia', az: 24, el: 70, rel: 46, dist: 1.00, fov: 18, roll: 90, corner: false, frame: [0, 0] },
  { at: 0.108, car: 'scuderia', az: 34, el: 30, rel: 42, dist: 0.84, fov: 30, roll: 22, corner: true, frame: [0.10, 0.02] },

  // ============================ ABOUT 0.099-0.171 ======================
  // These two are the SHORTEST sections on the page and the only ones that
  // keep the car beside the text, so by the same rule that holds the camera
  // almost still through Projects they get the most movement here. They are
  // car moments, not reading blocks with a render parked next to them.
  //
  // A dive to the deck: wide lens, in close, the car filling its half.
  { at: 0.144, car: 'scuderia', az: 44, el: 9, rel: 30, dist: 0.50, fov: 52, roll: -18, corner: true, frame: [-0.18, -0.14] },
  // Lifts away again and the lens goes long.
  { at: 0.187, car: 'scuderia', az: 58, el: 38, rel: 48, dist: 0.88, fov: 26, roll: 12, corner: false, frame: [0.12, 0.04] },

  // ============================ EDUCATION 0.171-0.223 ==================
  // A short slide. Not the full drift after Experience — rel only reaches 104
  // rather than 172 — so the two do not read as the same move twice.
  { at: 0.212, car: 'f2022', az: 70, el: 11, rel: 104, dist: 0.46, fov: 54, roll: 26, corner: true, frame: [0.20, -0.12] },
  // Caught, opposite lock.
  { at: 0.238, car: 'f2022', az: 82, el: 32, rel: 44, dist: 0.82, fov: 30, roll: -14, corner: true, frame: [-0.14, 0.02] },

  // ---------------------------- GAP 0.223-0.273 ------------------------
  // Down 26 then up 54. The white car arrives mid-swing.
  { at: 0.265, car: 'f2022', az: 100, el: 8, rel: 30, dist: 0.46, fov: 54, roll: -8, corner: false, frame: [0.20, -0.14] },
  { at: 0.292, car: 'williams', az: 118, el: 62, rel: 40, dist: 0.96, fov: 22, roll: 48, corner: false, frame: [-0.06, 0.04] },

  // ============================ ACHIEVEMENTS 0.273-0.365 ===============
  { at: 0.369, car: 'williams', az: 152, el: 52, rel: 48, dist: 0.88, fov: 26, roll: 12, corner: false, frame: [0.12, 0.02] },

  // ============================ EXPERIENCE 0.365-0.483 =================
  // The longest content block. The gentlest move on the lap: -8 over 0.118.
  { at: 0.455, car: 'williams', az: 196, el: 34, rel: 122, dist: 0.84, fov: 28, roll: -4, corner: false, frame: [-0.12, 0.02] },

  // ---------------------------- GAP 0.483-0.532 : THE DRIFT ------------
  // `rel` is the angle between camera and nose, so swinging it fast IS the
  // car rotating away from its direction of travel — the tail stepping out.
  // Everywhere else on the lap rel is kept out of flank because a car parked
  // side-on is the dull angle; here it is driven straight through it on
  // purpose, and the roll counter-swings the way a chase camera lags a slide.
  //
  // Entry: turn in, camera drops to the deck, lens goes wide.
  { at: 0.470, car: 'williams', az: 206, el: 12, rel: 150, dist: 0.46, fov: 54, roll: -20, corner: true, frame: [-0.18, -0.12] },
  // Peak: fully sideways, 172 degrees, and the frame thrown the other way.
  { at: 0.485, car: 'williams', az: 216, el: 7, rel: 172, dist: 0.40, fov: 58, roll: 26, corner: true, frame: [0.22, -0.14] },
  // Caught: opposite lock, the nose snapping back toward the camera.
  { at: 0.497, car: 'williams', az: 224, el: 16, rel: 104, dist: 0.52, fov: 48, roll: -14, corner: true, frame: [-0.16, -0.06] },
  // Exit: lifts away and the red car takes over.
  { at: 0.509, car: 'sf71h', az: 232, el: 66, rel: 146, dist: 0.98, fov: 21, roll: 52, corner: false, frame: [0.06, 0.04] },

  // ============================ PROJECTS 0.532-0.690 ===================
  // The longest section on the page. -8 degrees across all of it.
  { at: 0.659, car: 'sf71h', az: 274, el: 58, rel: 140, dist: 0.92, fov: 24, roll: -8, corner: false, frame: [0.12, 0.02] },

  // ============================ RESEARCH 0.690-0.752 ===================
  { at: 0.714, car: 'sf71h', az: 296, el: 46, rel: 132, dist: 1.06, fov: 22, roll: 0, corner: false, tunnel: true, frame: [-0.10, -0.04] },

  // ---------------------------- GAP 0.752-0.802 ------------------------
  // The biggest swing on the lap: -40 then +64.
  // A wide sweeping turn rather than a slide: the camera swings hard around
  // the outside while the car holds its line. Different shape from the drift
  // above, so the two big moments do not read as the same trick twice.
  { at: 0.733, car: 'sf71h', az: 304, el: 8, rel: 126, dist: 0.44, fov: 56, roll: 24, corner: true, frame: [0.22, -0.12] },
  { at: 0.751, car: 'sf71h', az: 316, el: 5, rel: 92, dist: 0.42, fov: 58, roll: -18, corner: true, frame: [-0.20, -0.14] },
  { at: 0.768, car: 'scuderia', az: 324, el: 70, rel: 56, dist: 1.00, fov: 18, roll: 90, corner: false, frame: [0, 0] },

  // ============================ SKILLS 0.802-0.912 =====================
  // Held near plan across the whole section — the decals name the same stack
  // the list does, and it barely moves while you read it.
  { at: 0.876, car: 'scuderia', az: 344, el: 66, rel: 50, dist: 1.00, fov: 19, roll: 84, corner: false, frame: [0, 0] },

  // ============================ ARTICLES 0.912-0.978 ===================
  { at: 0.966, car: 'scuderia', az: 358, el: 52, rel: 42, dist: 0.90, fov: 24, roll: 40, corner: false, frame: [-0.08, 0.02] },

  // ============================ CONTACT 0.978-1.000 ====================
  { at: 1.000, car: 'scuderia', az: 366, el: 46, rel: 36, dist: 0.84, fov: 28, roll: 20, corner: false, frame: [0.08, -0.02] },
];

/**
 * How long a handover takes, in scroll-progress units.
 *
 * A swap used to be a hard cut: the URL changed, Suspense rendered null, and
 * one car was replaced by another between frames. Both cars are now on stage
 * across this window and cross-dissolve, so the changeover is a dissolve
 * rather than a pop. 0.022 is roughly a third of a viewport of scrolling —
 * long enough to read as a transition, short enough that two cars are never
 * both clearly visible at once.
 */
export const SWAP_SPAN = 0.022;

/**
 * The handover in progress at `p`, if any.
 *
 * Returns the outgoing car and how far the dissolve has run (0..1), or null
 * when a single car holds the stage. Driven off the lap table rather than a
 * timer so it stays locked to scroll position — a timer would keep running
 * while the page sat still and would desync the moment someone scrolled back.
 */
export function sampleSwap(p) {
  const t = Math.min(1, Math.max(0, p));
  for (let i = 1; i < LAP.length; i += 1) {
    const b = LAP[i];
    if (b.car === LAP[i - 1].car) continue;
    if (t >= b.at && t < b.at + SWAP_SPAN) {
      return { from: LAP[i - 1].car, to: b.car, k: (t - b.at) / SWAP_SPAN };
    }
  }
  return null;
}

export const SEQUENCE = LAP.reduce((acc, k) => {
  if (acc[acc.length - 1] !== k.car) acc.push(k.car);
  return acc;
}, []);

/**
 * `rel` is the angle between the camera and the nose, stated per shot.
 *
 * It used to be derived — `yaw = NOSE_LEAD * az` with a single constant — which
 * meant the relative angle swept linearly from 0 to 117 across the lap and
 * could not do otherwise. The consequence was structural: 8 of 21 frames landed
 * between 70 and 115 degrees, which is flank, and the entire back half of the
 * lap sat there. Flank-on plus a low camera is a flat side elevation, and that
 * is what made the whole thing read as lateral. No value of the constant fixed
 * it, because the problem was that it was a constant.
 *
 * Stating it per shot means the framing is chosen rather than fallen into:
 *
 *   ~30-55   front three-quarter — the flattering angle, and most of the lap
 *   ~120-150 rear three-quarter — the one sequence that shows its back
 *   ~70-115  flank — passed THROUGH, never held
 *
 *   yaw = -az - rel
 *
 * because rel = wrap(-az - yaw). The negation is the X-flip in `dir`.
 */
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Cubic Hermite with time-aware tangents — not eased lerp between waypoints.
 *
 * The old path eased each segment independently: `easeStraight` finished a
 * segment at zero velocity and the next began at 2.2, so the camera changed
 * speed abruptly at every single keyframe. Measured, every large velocity jump
 * on the lap landed exactly on a waypoint — roll alone jumped by 10,953 units
 * at 0.751. Position was continuous, motion was not, and that is what a
 * "not smooth" transition is.
 *
 * A Hermite spline is continuous in velocity by construction. The tangent at
 * each keyframe is the finite difference of its NEIGHBOURS over their real
 * time span, which matters because these waypoints are unevenly spaced — from
 * 0.012 apart inside the drift to 0.15 across Projects. A uniform spline would
 * overshoot wildly on the short ones.
 *
 * `corner` still does its job: it pulls the tangents in, which tightens the
 * turn and holds the attitude late, exactly as the easing used to — but
 * without breaking continuity to get it.
 */
const h00 = (t) => 2 * t * t * t - 3 * t * t + 1;
const h10 = (t) => t * t * t - 2 * t * t + t;
const h01 = (t) => -2 * t * t * t + 3 * t * t;
const h11 = (t) => t * t * t - t * t;

function tangent(prev, cur, next, key, tension) {
  if (!prev || !next) return 0;
  const span = next.at - prev.at;
  if (span <= 0) return 0;
  return ((next[key] - prev[key]) / span) * tension;
}

function hermite(i, key, t, span) {
  const a = LAP[i];
  const b = LAP[i + 1] ?? a;
  // A corner draws its tangents in; a straight lets them run.
  const ta = tangent(LAP[i - 1], a, b, key, a.corner ? 0.45 : 0.9);
  const tb = tangent(a, b, LAP[i + 2], key, b.corner ? 0.45 : 0.9);
  return h00(t) * a[key]
    + h10(t) * span * ta
    + h01(t) * b[key]
    + h11(t) * span * tb;
}

/** Camera state at scroll progress `p`. */
export function sampleLap(p) {
  const t = Math.min(1, Math.max(0, p));
  let i = 0;
  while (i < LAP.length - 2 && LAP[i + 1].at <= t) i += 1;

  const a = LAP[i];
  const b = LAP[i + 1] ?? a;
  const span = b.at - a.at;
  const raw = span > 0 ? (t - a.at) / span : 0;

  const az = hermite(i, 'az', raw, span);
  const el = hermite(i, 'el', raw, span);
  const rel = hermite(i, 'rel', raw, span);
  // Kept for the frame offsets below, which are pairs rather than scalars.
  const k = raw * raw * (3 - 2 * raw);

  const af = a.frame ?? [0, 0];
  const bf = b.frame ?? [0, 0];

  // Polar to cartesian. This is only ever a direction — the distance that
  // actually frames the car is solved per-viewport from the bounding box.
  const azr = (az * Math.PI) / 180;
  const elr = (el * Math.PI) / 180;
  const ce = Math.cos(elr);

  // X is negated so the camera orbits through the car's left. From +X the
  // screen-right axis is -Z, which puts the nose (+Z) on the LEFT — the car
  // reads as facing backwards. From -X it points right, with travel.

  return {
    dir: [-Math.sin(azr) * ce, Math.sin(elr), Math.cos(azr) * ce],
    dist: hermite(i, 'dist', raw, span),
    fov: hermite(i, 'fov', raw, span),
    roll: hermite(i, 'roll', raw, span),
    // Composition, interpolated with everything else so the framing drifts
    // between shots rather than snapping.
    frame: [lerp(af[0], bf[0], k), lerp(af[1], bf[1], k)],
    // The car turns WITH the camera, not against it. Rotating the same way as
    // the azimuth keeps the nose swinging toward wherever the camera has moved
    // to, so it always leads; counter-rotating (the first attempt) drove the
    // tail round to meet the camera instead and every shot past the midpoint
    // looked like the car was reversing.
    //
    // The car still turns less than the camera travels, so the relative angle
    // opens up and the framing genuinely changes across the lap.
    yaw: -az - rel,
    car: a.car,
    next: b.car !== a.car ? b.car : (LAP[i + 2]?.car ?? null),
    // Ramps 0..1 through the tunnel so the lighting can drop with it.
    tunnel: (a.tunnel ? 1 - raw : 0) + (b.tunnel ? raw : 0),
  };
}
