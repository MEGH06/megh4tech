import { useEffect, useRef } from 'react';
import styles from './ProjectViz.module.css';

/**
 * A generated picture for a project that has no screenshot.
 *
 * It occupies exactly the slot a screenshot would, at the same size, so a card
 * with one of these and a card with a real image are the same shape.
 *
 * One mode per project, and each depicts the thing that project actually does.
 * An earlier version reused two shapes across five projects, which made them
 * read as wallpaper — if a legal model, a leaf classifier and a waste sorter
 * all show the same grid, the picture is saying nothing about any of them.
 *
 * Each mode also has its own palette and its own ground, taken from the
 * subject rather than from the site: a leaf is green, waste sorting is the
 * colour of the bins, a balance is brass. Six cards in a column should not
 * read as six prints of the same photograph.
 *
 * Cheap on purpose: one small canvas, no library, and the loop stops whenever
 * the card is off screen.
 */

/**
 * Palettes. `bg` is the card's own ground — it is what makes two cards next to
 * each other feel like different projects before you have read either label.
 */
const PAL = {
  cascade: {
    bg: ['#080b14', '#0c1322'],
    node: '#6aa6e8', edge: '#1e2c47', warm: '#ffa528', hot: '#ff2d55',
  },
  scales: {
    bg: ['#0e0a05', '#171008'],
    brass: '#d9a441', ivory: '#efe3cb', dim: '#3a2e19', ask: '#8b93a3',
  },
  conveyor: {
    bg: ['#050c0b', '#081411'],
    belt: '#26383d', item: '#9fb6bb', keep: '#3ddc84', waste: '#ff9f1c', gate: '#5fe3ff',
  },
  segment: {
    bg: ['#070a08', '#0c120e'],
    sky: '#5fb8e6', veg: '#4f9d5a', trail: '#c07a3e', rock: '#8892a0',
  },
  documents: {
    bg: ['#0a0810', '#120d1c'],
    page: '#ded8ec', ink: '#6f6785', mark: ['#ffd400', '#ff5da2', '#57d7f5'], done: '#a78bfa',
  },
  leaf: {
    bg: ['#050a05', '#0a1209'],
    blade: '#4caf50', vein: '#93d89a', lesion: '#ff8c42', scan: '#46e2ff',
  },
};

const seeded = (n) => () => {
  n = (n * 1664525 + 1013904223) >>> 0;
  return n / 4294967296;
};

/** Alpha helper. Every colour here is a 6-digit hex, so this is enough. */
const a = (hex, alpha) => {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${alpha})`;
};

/** Rounded rectangle, for chat bubbles, pages and sorted items. */
function rrect(c, x, y, w, h, r) {
  const k = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + k, y);
  c.arcTo(x + w, y, x + w, y + h, k);
  c.arcTo(x + w, y + h, x, y + h, k);
  c.arcTo(x, y + h, x, y, k);
  c.arcTo(x, y, x + w, y, k);
  c.closePath();
}

/* ---------------------------------------------------------------- network */

function makeNetwork(seed, count, linkBias) {
  const rnd = seeded(seed);
  const nodes = Array.from({ length: count }, () => ({
    x: (rnd() - 0.5) * 150,
    y: (rnd() - 0.5) * 150,
    z: (rnd() - 0.5) * 150,
    vx: 0, vy: 0, vz: 0, deg: 0,
  }));

  const edges = [];
  for (let i = 1; i < count; i += 1) edges.push([i, Math.floor(rnd() ** linkBias * i)]);
  for (let k = 0; k < count * 0.7; k += 1) {
    const p = Math.floor(rnd() * count);
    const q = Math.floor(rnd() * count);
    if (p !== q && !edges.some(([x, y]) => (x === p && y === q) || (x === q && y === p))) {
      edges.push([p, q]);
    }
  }

  const adj = nodes.map(() => []);
  edges.forEach(([p, q]) => {
    adj[p].push(q); adj[q].push(p); nodes[p].deg += 1; nodes[q].deg += 1;
  });

  for (let s = 0; s < 320; s += 1) {
    for (let i = 0; i < count; i += 1) {
      const A = nodes[i];
      for (let j = i + 1; j < count; j += 1) {
        const B = nodes[j];
        const dx = B.x - A.x; const dy = B.y - A.y; const dz = B.z - A.z;
        const d2 = dx * dx + dy * dy + dz * dz + 1;
        const d = Math.sqrt(d2); const f = 1500 / d2;
        A.vx -= (dx / d) * f; A.vy -= (dy / d) * f; A.vz -= (dz / d) * f;
        B.vx += (dx / d) * f; B.vy += (dy / d) * f; B.vz += (dz / d) * f;
      }
    }
    edges.forEach(([pi, qi]) => {
      const A = nodes[pi]; const B = nodes[qi];
      const dx = B.x - A.x; const dy = B.y - A.y; const dz = B.z - A.z;
      const d = Math.hypot(dx, dy, dz) + 0.01; const f = (d - 66) * 0.013;
      A.vx += (dx / d) * f; A.vy += (dy / d) * f; A.vz += (dz / d) * f;
      B.vx -= (dx / d) * f; B.vy -= (dy / d) * f; B.vz -= (dz / d) * f;
    });
    nodes.forEach((A) => {
      A.vx -= A.x * 0.005; A.vy -= A.y * 0.005; A.vz -= A.z * 0.005;
      A.vx *= 0.83; A.vy *= 0.83; A.vz *= 0.83;
      A.x += A.vx; A.y += A.vy; A.z += A.vz;
    });
  }
  return { nodes, edges, adj };
}

const NET = makeNetwork(419, 22, 0.5);

/* ------------------------------------------------------------------ modes */

/**
 * Equilibrium.ai — a failure travelling an exposure network.
 * The network is cool and the contagion is warm, so the spread reads as heat
 * moving through something cold rather than as dots changing colour.
 */
function drawCascade(c, W, H, t, S) {
  const P = PAL.cascade;
  const yaw = S.yaw;
  const cy = Math.cos(yaw); const sy = Math.sin(yaw);
  const cp = Math.cos(-0.18); const sp = Math.sin(-0.18);
  const scale = Math.min(W, H) / 210;

  const pts = NET.nodes.map((n) => {
    const x = n.x * cy - n.z * sy;
    let z = n.x * sy + n.z * cy;
    const y = n.y * cp - z * sp;
    z = n.y * sp + z * cp;
    const k = 400 / (400 + z);
    return { x: W / 2 + x * k * scale, y: H / 2 + y * k * scale, k, z };
  });

  [...NET.edges].sort((p, q) => (pts[q[0]].z + pts[q[1]].z) - (pts[p[0]].z + pts[p[1]].z))
    .forEach(([pi, qi]) => {
      const A = pts[pi]; const B = pts[qi];
      const hot = S.state[pi] && S.state[qi];
      c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y);
      c.strokeStyle = hot
        ? a(P.hot, 0.6)
        : a(P.edge, Math.max(0.4, Math.min(1, (A.k + B.k) / 2)));
      c.lineWidth = hot ? 1.4 : 0.9;
      c.stroke();
    });

  NET.nodes.map((_, i) => i).sort((p, q) => pts[q].z - pts[p].z).forEach((i) => {
    const p = pts[i];
    const r = Math.max(1.1, (1.6 + NET.nodes[i].deg * 0.42) * p.k * scale * 0.85);
    if (S.state[i]) {
      const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
      g.addColorStop(0, a(P.warm, 0.4));
      g.addColorStop(1, a(P.hot, 0));
      c.fillStyle = g;
      c.beginPath(); c.arc(p.x, p.y, r * 5, 0, 6.2832); c.fill();
    }
    c.beginPath(); c.arc(p.x, p.y, r, 0, 6.2832);
    c.fillStyle = S.state[i] ? P.hot : a(P.node, Math.max(0.45, Math.min(1, p.k - 0.2)));
    c.fill();
  });
}

/**
 * LawTune — a tarazu, and the exchange it settles.
 *
 * A question arrives, the beam swings and settles, and the answer follows —
 * or, when the pans come level, it does not. The abstention guardrail is the
 * interesting part of this model, and a balance is the one picture that shows
 * a decision and a refusal to decide with the same mechanism.
 */
function drawScales(c, W, H, t, S) {
  const P = PAL.scales;
  const cx = W * 0.5;
  const pivot = H * 0.14;
  const foot = H * 0.5;
  const arm = W * 0.25;

  // Sequence: ask, weigh, answer, hold.
  const ask = Math.min(1, t / 0.14);
  const swing = Math.max(0, Math.min(1, (t - 0.16) / 0.34));
  const reply = Math.max(0, Math.min(1, (t - 0.52) / 0.12));

  // Damped settle. The wobble is what makes it read as a physical balance
  // rather than a bar chart that happens to be diagonal.
  const tilt = S.abstain
    ? 0.32 * Math.exp(-5 * swing) * Math.cos(swing * 13)
    : S.dir * 0.28 * (1 - Math.exp(-4.5 * swing) * Math.cos(swing * 11));

  // Stand.
  c.lineCap = 'round';
  c.strokeStyle = a(P.brass, 0.8); c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(cx, pivot); c.lineTo(cx, foot); c.stroke();
  c.beginPath(); c.moveTo(cx - W * 0.08, foot); c.lineTo(cx + W * 0.08, foot); c.stroke();

  // Beam and pans.
  const dx = Math.cos(tilt) * arm;
  const dy = Math.sin(tilt) * arm;
  c.strokeStyle = P.brass; c.lineWidth = 1.8;
  c.beginPath(); c.moveTo(cx - dx, pivot - dy); c.lineTo(cx + dx, pivot + dy); c.stroke();
  c.fillStyle = P.brass;
  c.beginPath(); c.arc(cx, pivot, 2.6, 0, 6.2832); c.fill();

  [-1, 1].forEach((side) => {
    const ex = cx + side * dx;
    const ey = pivot + side * dy;
    const py = ey + H * 0.15;
    const pw = W * 0.12;
    c.strokeStyle = a(P.brass, 0.5); c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - pw * 0.5, py); c.stroke();
    c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + pw * 0.5, py); c.stroke();
    // A shallow dish, so the two sides read as holding something.
    c.strokeStyle = P.brass; c.lineWidth = 1.5;
    c.beginPath(); c.arc(ex, py - pw * 0.3, pw * 0.6, 0.5, Math.PI - 0.5); c.stroke();
  });

  // The exchange, beneath the balance. Both bubbles finish above 0.79H — the
  // label bar owns the bottom of the frame, and a reply drawn under it is a
  // reply nobody sees.
  const bh = H * 0.1;
  const bw = W * 0.4;
  const thread = H * 0.56;

  if (ask > 0) {
    c.globalAlpha = ask;
    const y = thread + (1 - ask) * 6;
    rrect(c, W * 0.06, y, bw, bh, bh * 0.4);
    c.fillStyle = a(P.ask, 0.18); c.fill();
    c.strokeStyle = a(P.ask, 0.7); c.lineWidth = 1; c.stroke();
    c.fillStyle = a(P.ask, 0.8);
    for (let i = 0; i < 2; i += 1) {
      c.fillRect(W * 0.06 + 6, y + 6 + i * 5, bw - 12 - (i ? bw * 0.3 : 0), 1.6);
    }
    c.globalAlpha = 1;
  }

  if (reply > 0) {
    c.globalAlpha = reply;
    const y = thread + bh * 1.25 + (1 - reply) * 6;
    rrect(c, W * 0.54, y, bw, bh, bh * 0.4);
    c.fillStyle = a(S.abstain ? P.dim : P.brass, 0.22); c.fill();
    c.strokeStyle = S.abstain ? a(P.ivory, 0.7) : P.brass; c.lineWidth = 1.2; c.stroke();
    if (S.abstain) {
      // No lines of text. The refusal is the absence of an answer — which only
      // reads if the empty bubble is plainly there to be seen.
      c.strokeStyle = a(P.ivory, 0.75); c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(W * 0.54 + 9, y + bh / 2);
      c.lineTo(W * 0.54 + bw - 9, y + bh / 2);
      c.stroke();
    } else {
      c.fillStyle = a(P.ivory, 0.85);
      for (let i = 0; i < 2; i += 1) {
        c.fillRect(W * 0.54 + 6, y + 6 + i * 5, bw - 12 - (i ? bw * 0.42 : 0), 1.6);
      }
    }
    c.globalAlpha = 1;
  }
}

/**
 * OopsIDidntStudy — scattered material consolidating into one set of notes.
 * Pages drift inward and stack; each carries its own highlighter, which is
 * what a revision pile actually looks like.
 */
function drawDocuments(c, W, H, t, S) {
  const P = PAL.documents;
  const cx = W * 0.5; const cy = H * 0.48;
  const pw = W * 0.13; const ph = pw * 1.3;
  S.docs.forEach((d, i) => {
    // Each page has its own phase, so they arrive in a stream rather than
    // all at once.
    const local = (t * 1.25 + d.phase) % 1;
    const ease = local < 0.72 ? (local / 0.72) ** 0.7 : 1;
    const x = d.x + (cx - d.x) * ease;
    const y = d.y + (cy + (i - S.docs.length / 2) * 1.6 - d.y) * ease;
    const rot = d.rot * (1 - ease);
    const arrived = ease > 0.985;
    const mark = P.mark[i % P.mark.length];

    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.globalAlpha = 0.36 + ease * 0.56;
    rrect(c, -pw / 2, -ph / 2, pw, ph, 2);
    c.fillStyle = a(P.page, arrived ? 0.18 : 0.12); c.fill();
    c.strokeStyle = arrived ? a(P.done, 0.95) : a(P.page, 0.6); c.lineWidth = 1; c.stroke();
    // One highlighted line and two plain ones.
    c.fillStyle = a(mark, arrived ? 0.9 : 0.5);
    c.fillRect(-pw / 2 + 3, -ph / 2 + 5, pw - 6, 2.4);
    c.fillStyle = a(P.ink, 0.9);
    for (let l = 1; l < 3; l += 1) {
      c.fillRect(-pw / 2 + 3, -ph / 2 + 5 + l * 5, pw - 6 - (l === 2 ? pw * 0.35 : 0), 1.5);
    }
    c.restore();
  });
  c.globalAlpha = 1;
}

/**
 * Potato Leaf Detection — a leaf, scanned, boxed and classified.
 * The subject is a single object being judged, so the picture is one object
 * being judged rather than a field of cells.
 */
function drawLeaf(c, W, H, t, S) {
  const P = PAL.leaf;
  const cx = W * 0.5; const cy = H * 0.5;
  const r = Math.min(W, H) * 0.3;

  // Leaf silhouette: two mirrored arcs meeting at a point.
  c.beginPath();
  c.moveTo(cx, cy - r);
  c.bezierCurveTo(cx + r * 0.95, cy - r * 0.5, cx + r * 0.6, cy + r * 0.75, cx, cy + r);
  c.bezierCurveTo(cx - r * 0.6, cy + r * 0.75, cx - r * 0.95, cy - r * 0.5, cx, cy - r);
  c.closePath();
  const g = c.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, a(P.blade, 0.55));
  g.addColorStop(1, a(P.blade, 0.18));
  c.fillStyle = g; c.fill();
  c.strokeStyle = a(P.vein, 0.75); c.lineWidth = 1.2; c.stroke();

  // Veins are drawn inside a clip of the silhouette. Without it they run
  // straight out past the edge of the leaf and the shape stops reading as one.
  c.save();
  c.clip();
  c.strokeStyle = a(P.vein, 0.5); c.lineWidth = 1;
  c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx, cy + r); c.stroke();
  for (let i = -2; i <= 2; i += 1) {
    const vy = cy + i * r * 0.3;
    c.beginPath(); c.moveTo(cx, vy);
    c.lineTo(cx + r * 0.8, vy + r * 0.24); c.stroke();
    c.beginPath(); c.moveTo(cx, vy);
    c.lineTo(cx - r * 0.8, vy + r * 0.24); c.stroke();
  }
  // Lesions sit under the boxes, so the boxes are seen to find something.
  S.spots.forEach((s) => {
    c.fillStyle = a(P.lesion, 0.5);
    c.beginPath();
    c.arc(cx + s.x * r * 0.5, cy + s.y * r * 0.6, r * 0.1, 0, 6.2832);
    c.fill();
  });
  c.restore();

  // A scan line crosses, then the boxes land behind it.
  const scan = (t * 1.5) % 1;
  const sy = cy - r * 1.15 + scan * r * 2.3;
  if (scan < 0.82) {
    const beam = c.createLinearGradient(0, sy - 7, 0, sy + 7);
    beam.addColorStop(0, a(P.scan, 0));
    beam.addColorStop(0.5, a(P.scan, 0.3));
    beam.addColorStop(1, a(P.scan, 0));
    c.fillStyle = beam;
    c.fillRect(W * 0.1, sy - 7, W * 0.8, 14);
    c.strokeStyle = a(P.scan, 0.9); c.lineWidth = 1;
    c.beginPath(); c.moveTo(W * 0.12, sy); c.lineTo(W * 0.88, sy); c.stroke();
  }

  if (scan > 0.55) {
    const al = Math.min(1, (scan - 0.55) / 0.16);
    c.strokeStyle = a(P.lesion, al); c.lineWidth = 1.4;
    S.spots.forEach((s) => {
      const bw = r * 0.32;
      c.strokeRect(cx + s.x * r * 0.5 - bw / 2, cy + s.y * r * 0.6 - bw / 2, bw, bw);
    });
  }
}

/**
 * EcoSort AI — items on a belt, diverted into two streams.
 * Sorting is a movement, not a state, so the picture moves; and the streams
 * are the colours the bins are, because that is what the model produces.
 */
function drawConveyor(c, W, H, t, S) {
  const P = PAL.conveyor;
  const beltY = H * 0.48;
  const split = W * 0.58;

  c.lineCap = 'butt';
  c.strokeStyle = P.belt; c.lineWidth = 2;
  c.beginPath(); c.moveTo(0, beltY); c.lineTo(split, beltY); c.stroke();
  c.strokeStyle = a(P.keep, 0.5); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(split, beltY); c.lineTo(W, beltY - H * 0.26); c.stroke();
  c.strokeStyle = a(P.waste, 0.5);
  c.beginPath(); c.moveTo(split, beltY); c.lineTo(W, beltY + H * 0.26); c.stroke();

  // Belt tread, so the run before the gate is visibly moving too.
  c.strokeStyle = a(P.belt, 0.95); c.lineWidth = 1;
  for (let i = 0; i < 14; i += 1) {
    const x = ((i / 14 + t * 0.9) % 1) * split;
    c.beginPath(); c.moveTo(x, beltY + 3); c.lineTo(x + 4, beltY + 7); c.stroke();
  }

  S.items.forEach((it) => {
    const local = (t * 1.1 + it.phase) % 1;
    const x = local * W;
    let y = beltY;
    let tint = P.item;
    let alpha = 0.65;
    if (x > split) {
      const after = (x - split) / (W - split);
      y = beltY + (it.up ? -1 : 1) * after * H * 0.26;
      tint = it.up ? P.keep : P.waste;
      alpha = 0.95;
    }
    const s = it.size * Math.min(W, H) * 0.038;
    rrect(c, x - s / 2, y - s / 2, s, s, 2);
    c.fillStyle = a(tint, alpha * 0.35); c.fill();
    c.strokeStyle = a(tint, alpha); c.lineWidth = 1.2; c.stroke();
  });

  // The decision point.
  c.strokeStyle = a(P.gate, 0.85); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(split, beltY - H * 0.11); c.lineTo(split, beltY + H * 0.11); c.stroke();
  c.fillStyle = a(P.gate, 0.9);
  c.beginPath(); c.arc(split, beltY - H * 0.11, 2, 0, 6.2832); c.fill();
}

/**
 * EasyOffRoad — terrain resolving into classes.
 * The classes are the ones a segmentation mask actually carries: sky, canopy,
 * rock, trail. Row order holds the scene together, so it reads as a hillside
 * rather than as coloured confetti.
 */
function drawSegment(c, W, H, t, S) {
  const P = PAL.segment;
  const cols = 8; const rows = 5;
  const gap = Math.max(2, Math.min(W, H) * 0.018);
  const cw = (W - gap * (cols + 1)) / cols;
  const ch = (H - gap * (rows + 1)) / rows;
  const key = {
    sky: P.sky, veg: P.veg, rock: P.rock, trail: P.trail,
  };

  for (let r = 0; r < rows; r += 1) {
    for (let col = 0; col < cols; col += 1) {
      const i = r * cols + col;
      const phase = ((col + r) / (cols + rows)) * 0.75;
      const on = ((t - phase + 1) % 1) < 0.55;
      const hue = key[S.terrain[i]];
      const x = gap + col * (cw + gap);
      const y = gap + r * (ch + gap);
      c.fillStyle = on ? a(hue, 0.5) : a(hue, 0.14);
      c.fillRect(x, y, cw, ch);
      if (on) {
        c.strokeStyle = a(hue, 0.85); c.lineWidth = 1;
        c.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
      }
    }
  }
}

const MODES = {
  cascade: drawCascade,
  scales: drawScales,
  documents: drawDocuments,
  leaf: drawLeaf,
  conveyor: drawConveyor,
  segment: drawSegment,
};

/** Per-mode fixed data, so a picture is the same shape on every visit. */
function initState(mode) {
  const rnd = seeded([...mode].reduce((s, ch) => s * 31 + ch.charCodeAt(0), 7) >>> 0);
  // Terrain reads top to bottom: sky, canopy, rock, trail.
  const band = [
    ['sky', 'sky', 'veg'],
    ['sky', 'veg', 'veg'],
    ['veg', 'veg', 'rock'],
    ['rock', 'trail', 'veg'],
    ['trail', 'trail', 'rock'],
  ];
  return {
    yaw: 0.5,
    state: NET.nodes.map(() => 0),
    queue: [],
    next: 0,
    dir: rnd() < 0.5 ? -1 : 1,
    abstain: false,
    terrain: Array.from({ length: 40 }, (_, i) => {
      const row = band[Math.floor(i / 8)];
      return row[Math.floor(rnd() * row.length)];
    }),
    docs: Array.from({ length: 11 }, () => ({
      x: rnd(), y: rnd(), rot: (rnd() - 0.5) * 1.1, phase: rnd(),
    })),
    spots: Array.from({ length: 3 }, () => ({ x: rnd() * 2 - 1, y: rnd() * 2 - 1 })),
    items: Array.from({ length: 9 }, () => ({
      phase: rnd(), up: rnd() < 0.45, size: 0.7 + rnd() * 0.7,
    })),
  };
}

export default function ProjectViz({ mode, label }) {
  const cv = useRef(null);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const key = MODES[mode] ? mode : 'segment';
    const draw = MODES[key];
    const pal = PAL[key];
    const S = initState(key);
    const rnd = seeded(909);

    let W = 0; let H = 0;
    let ground = null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // The card's own ground. Built once per resize, not once per frame.
      ground = ctx.createLinearGradient(0, 0, W * 0.4, H);
      ground.addColorStop(0, pal.bg[0]);
      ground.addColorStop(1, pal.bg[1]);
      // Document positions are stored 0..1 so they survive a resize.
      S.docs.forEach((d) => { d.px = d.x * W; d.py = d.y * H; });
    };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    size();

    let raf = 0;
    let running = false;
    let cycle = -1;
    const t0 = performance.now();

    const step = (now) => {
      const raw = (now - t0) / 5200;
      const t = reduce ? 0.62 : raw % 1;

      // One verdict per pass of the balance, fixed when the pass begins so it
      // cannot change halfway through the swing.
      //
      // Deliberately a rota and not a coin. Rolling `rnd() < 0.3` looked
      // equivalent and was not: this generator returns 0.219, 0.202 and 0.156
      // on consecutive draws from seed 909, so the balance abstained four
      // cycles out of five and sat level and silent for the first sixteen
      // seconds a reader was looking at it. Every third pass abstains, and the
      // side alternates, so a glance of any length sees the thing tip.
      if (key === 'scales') {
        const n = reduce ? 0 : Math.floor(raw);
        if (n !== cycle) {
          cycle = n;
          S.abstain = n % 3 === 2;
          S.dir = n % 2 === 0 ? 1 : -1;
        }
      }

      if (key === 'cascade') {
        if (!reduce) S.yaw += 0.0022;
        if (!S.queue.length && now > S.next) {
          S.state.fill(0);
          const seed = NET.nodes.reduce((best, n, i) => (n.deg > NET.nodes[best].deg ? i : best), 0);
          S.state[seed] = 1;
          S.queue = [{ list: [...NET.adj[seed]], at: now + 420 }];
          S.next = now + 9000;
        }
        if (S.queue.length && now >= S.queue[0].at) {
          const lv = S.queue.shift();
          const onward = [];
          lv.list.forEach((id) => {
            if (S.state[id]) return;
            if (rnd() < 0.62) { S.state[id] = 1; onward.push(...NET.adj[id]); }
          });
          if (onward.length) S.queue.push({ list: onward, at: now + 520 });
        }
      }

      // Document mode wants pixel coordinates, resolved after sizing.
      if (key === 'documents') {
        S.docs.forEach((d) => {
          d.x = (d.px ?? d.x * W); d.y = (d.py ?? d.y * H);
        });
      }

      ctx.clearRect(0, 0, W, H);
      if (ground) { ctx.fillStyle = ground; ctx.fillRect(0, 0, W, H); }
      ctx.globalAlpha = 1;
      draw(ctx, W, H, t, S);
      ctx.globalAlpha = 1;
      if (running && !reduce) raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true; raf = requestAnimationFrame(step);
      } else if (!e.isIntersecting && running) {
        running = false; cancelAnimationFrame(raf);
      }
    }, { threshold: 0.05 });
    io.observe(canvas);

    return () => {
      running = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
    };
  }, [mode]);

  return (
    <div className={styles.wrap}>
      <canvas ref={cv} className={styles.canvas} aria-label={label} role="img" />
      <span className={styles.tag}>{label}</span>
    </div>
  );
}
