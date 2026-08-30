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
 * Cheap on purpose: one small canvas, no library, and the loop stops whenever
 * the card is off screen.
 */

const INK = '#f2f0ee';
const RED = '#e01236';
const LINE = '#2c2c2c';
const YELLOW = '#ffd400';

const seeded = (n) => () => {
  n = (n * 1664525 + 1013904223) >>> 0;
  return n / 4294967296;
};

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
    const a = Math.floor(rnd() * count);
    const b = Math.floor(rnd() * count);
    if (a !== b && !edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
      edges.push([a, b]);
    }
  }

  const adj = nodes.map(() => []);
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); nodes[a].deg += 1; nodes[b].deg += 1; });

  for (let s = 0; s < 320; s += 1) {
    for (let i = 0; i < count; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < count; j += 1) {
        const b = nodes[j];
        const dx = b.x - a.x; const dy = b.y - a.y; const dz = b.z - a.z;
        const d2 = dx * dx + dy * dy + dz * dz + 1;
        const d = Math.sqrt(d2); const f = 1500 / d2;
        a.vx -= (dx / d) * f; a.vy -= (dy / d) * f; a.vz -= (dz / d) * f;
        b.vx += (dx / d) * f; b.vy += (dy / d) * f; b.vz += (dz / d) * f;
      }
    }
    edges.forEach(([ai, bi]) => {
      const a = nodes[ai]; const b = nodes[bi];
      const dx = b.x - a.x; const dy = b.y - a.y; const dz = b.z - a.z;
      const d = Math.hypot(dx, dy, dz) + 0.01; const f = (d - 66) * 0.013;
      a.vx += (dx / d) * f; a.vy += (dy / d) * f; a.vz += (dz / d) * f;
      b.vx -= (dx / d) * f; b.vy -= (dy / d) * f; b.vz -= (dz / d) * f;
    });
    nodes.forEach((a) => {
      a.vx -= a.x * 0.005; a.vy -= a.y * 0.005; a.vz -= a.z * 0.005;
      a.vx *= 0.83; a.vy *= 0.83; a.vz *= 0.83;
      a.x += a.vx; a.y += a.vy; a.z += a.vz;
    });
  }
  return { nodes, edges, adj };
}

const NET = makeNetwork(419, 22, 0.5);

/* ------------------------------------------------------------------ modes */

/** Equilibrium — a failure travelling an exposure network. */
function drawCascade(c, W, H, t, S) {
  const yaw = S.yaw;
  const cy = Math.cos(yaw); const sy = Math.sin(yaw);
  const cp = Math.cos(-0.18); const sp = Math.sin(-0.18);
  const scale = Math.min(W, H) / 210;

  const P = NET.nodes.map((n) => {
    const x = n.x * cy - n.z * sy;
    let z = n.x * sy + n.z * cy;
    const y = n.y * cp - z * sp;
    z = n.y * sp + z * cp;
    const k = 400 / (400 + z);
    return { x: W / 2 + x * k * scale, y: H / 2 + y * k * scale, k, z };
  });

  [...NET.edges].sort((a, b) => (P[b[0]].z + P[b[1]].z) - (P[a[0]].z + P[a[1]].z))
    .forEach(([ai, bi]) => {
      const A = P[ai]; const B = P[bi];
      const hot = S.state[ai] && S.state[bi];
      c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y);
      c.strokeStyle = hot ? RED : LINE;
      c.globalAlpha = hot ? 0.55 : Math.max(0.14, Math.min(0.6, (A.k + B.k) / 2 - 0.45));
      c.lineWidth = hot ? 1.3 : 0.9;
      c.stroke();
    });
  c.globalAlpha = 1;

  NET.nodes.map((_, i) => i).sort((a, b) => P[b].z - P[a].z).forEach((i) => {
    const p = P[i];
    const r = Math.max(1.1, (1.6 + NET.nodes[i].deg * 0.42) * p.k * scale * 0.85);
    if (S.state[i]) {
      const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4.5);
      g.addColorStop(0, 'rgba(224,18,54,.34)');
      g.addColorStop(1, 'rgba(224,18,54,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(p.x, p.y, r * 4.5, 0, 6.2832); c.fill();
    }
    c.beginPath(); c.arc(p.x, p.y, r, 0, 6.2832);
    c.fillStyle = S.state[i] ? RED : INK;
    c.globalAlpha = S.state[i] ? 1 : Math.max(0.3, Math.min(0.85, p.k - 0.3));
    c.fill(); c.globalAlpha = 1;
  });
}

/**
 * LawTune — 22 scheduled languages, each a bar of coverage.
 * Bars, not a grid: a language is a row of text, and coverage across them is a
 * list you read down rather than a field you scan.
 */
function drawLanguages(c, W, H, t, S) {
  const n = 22;
  const pad = W * 0.07;
  const gap = 3;
  const bh = (H - pad * 2 - gap * (n - 1)) / n;
  for (let i = 0; i < n; i += 1) {
    const y = pad + i * (bh + gap);
    const full = (W - pad * 2) * (0.34 + S.w[i] * 0.62);
    // A pass moves down the list; the row it is on is the live one.
    const head = ((t * n * 1.6) % (n + 6)) - 3;
    const on = Math.abs(head - i) < 1.4;
    c.fillStyle = LINE;
    c.globalAlpha = 0.5;
    c.fillRect(pad, y, W - pad * 2, bh);
    c.globalAlpha = 1;
    c.fillStyle = on ? RED : INK;
    c.globalAlpha = on ? 0.92 : 0.34;
    c.fillRect(pad, y, full, bh);
    c.globalAlpha = 1;
  }
}

/**
 * OopsIDidntStudy — scattered material consolidating into one set of notes.
 * Pages drift inward and stack; the point is the gathering, not the grid.
 */
function drawDocuments(c, W, H, t, S) {
  const cx = W * 0.5; const cy = H * 0.52;
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

    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.fillStyle = arrived ? RED : INK;
    c.globalAlpha = arrived ? 0.34 : 0.12 + ease * 0.2;
    c.fillRect(-pw / 2, -ph / 2, pw, ph);
    c.strokeStyle = arrived ? RED : INK;
    c.globalAlpha = arrived ? 0.85 : 0.3 + ease * 0.35;
    c.lineWidth = 1;
    c.strokeRect(-pw / 2, -ph / 2, pw, ph);
    // Text lines on the page.
    c.globalAlpha *= 0.6;
    for (let l = 0; l < 3; l += 1) {
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
  const cx = W * 0.5; const cy = H * 0.5;
  const r = Math.min(W, H) * 0.3;

  // Leaf silhouette: two mirrored arcs meeting at a point.
  c.beginPath();
  c.moveTo(cx, cy - r);
  c.bezierCurveTo(cx + r * 0.95, cy - r * 0.5, cx + r * 0.6, cy + r * 0.75, cx, cy + r);
  c.bezierCurveTo(cx - r * 0.6, cy + r * 0.75, cx - r * 0.95, cy - r * 0.5, cx, cy - r);
  c.closePath();
  c.strokeStyle = INK; c.globalAlpha = 0.5; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = INK; c.globalAlpha = 0.07; c.fill();

  // Veins are drawn inside a clip of the silhouette. Without it they run
  // straight out past the edge of the leaf and the shape stops reading as one.
  c.save();
  c.clip();
  c.strokeStyle = INK; c.globalAlpha = 0.28;
  c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx, cy + r); c.stroke();
  for (let i = -2; i <= 2; i += 1) {
    const vy = cy + i * r * 0.3;
    c.beginPath(); c.moveTo(cx, vy);
    c.lineTo(cx + r * 0.8, vy + r * 0.24); c.stroke();
    c.beginPath(); c.moveTo(cx, vy);
    c.lineTo(cx - r * 0.8, vy + r * 0.24); c.stroke();
  }
  c.restore();
  c.globalAlpha = 1;

  // A scan line crosses, then the box and the verdict land behind it.
  const scan = (t * 1.5) % 1;
  const sy = cy - r * 1.15 + scan * r * 2.3;
  if (scan < 0.82) {
    c.strokeStyle = YELLOW; c.globalAlpha = 0.75; c.lineWidth = 1;
    c.beginPath(); c.moveTo(W * 0.12, sy); c.lineTo(W * 0.88, sy); c.stroke();
    c.globalAlpha = 1;
  }

  if (scan > 0.55) {
    const a = Math.min(1, (scan - 0.55) / 0.16);
    c.strokeStyle = RED; c.globalAlpha = a; c.lineWidth = 1.4;
    S.spots.forEach((s) => {
      const bw = r * 0.3;
      c.strokeRect(cx + s.x * r * 0.5 - bw / 2, cy + s.y * r * 0.6 - bw / 2, bw, bw);
    });
    c.globalAlpha = 1;
  }
}

/**
 * EcoSort AI — items on a belt, diverted into two streams.
 * Sorting is a movement, not a state, so the picture moves.
 */
function drawConveyor(c, W, H, t, S) {
  const beltY = H * 0.52;
  const split = W * 0.58;

  c.strokeStyle = LINE; c.lineWidth = 1; c.globalAlpha = 0.7;
  c.beginPath(); c.moveTo(0, beltY); c.lineTo(split, beltY); c.stroke();
  c.beginPath(); c.moveTo(split, beltY); c.lineTo(W, beltY - H * 0.26); c.stroke();
  c.beginPath(); c.moveTo(split, beltY); c.lineTo(W, beltY + H * 0.26); c.stroke();
  c.globalAlpha = 1;

  S.items.forEach((it) => {
    const local = (t * 1.1 + it.phase) % 1;
    const x = local * W;
    let y = beltY;
    let tint = INK;
    if (x > split) {
      const after = (x - split) / (W - split);
      y = beltY + (it.up ? -1 : 1) * after * H * 0.26;
      tint = it.up ? RED : INK;
    }
    const s = it.size * Math.min(W, H) * 0.035;
    c.fillStyle = tint;
    c.globalAlpha = x > split ? 0.9 : 0.55;
    c.fillRect(x - s / 2, y - s / 2, s, s);
    c.globalAlpha = 1;
  });

  // The decision point.
  c.strokeStyle = YELLOW; c.globalAlpha = 0.6;
  c.beginPath(); c.moveTo(split, beltY - H * 0.1); c.lineTo(split, beltY + H * 0.1); c.stroke();
  c.globalAlpha = 1;
}

/** EasyOffRoad — terrain resolving into classes, unchanged. */
function drawSegment(c, W, H, t, S) {
  const cols = 8; const rows = 5;
  const gap = Math.max(2, Math.min(W, H) * 0.018);
  const cw = (W - gap * (cols + 1)) / cols;
  const ch = (H - gap * (rows + 1)) / rows;
  for (let r = 0; r < rows; r += 1) {
    for (let col = 0; col < cols; col += 1) {
      const i = r * cols + col;
      const phase = ((col + r) / (cols + rows)) * 0.75;
      const on = ((t - phase + 1) % 1) < 0.55;
      const settled = S.cells[i];
      c.fillStyle = on && settled ? 'rgba(224,18,54,.42)'
        : on ? 'rgba(242,240,238,.16)' : 'rgba(242,240,238,.05)';
      c.fillRect(gap + col * (cw + gap), gap + r * (ch + gap), cw, ch);
      if (on && settled) {
        c.strokeStyle = 'rgba(224,18,54,.75)'; c.lineWidth = 1;
        c.strokeRect(gap + col * (cw + gap) + 0.5, gap + r * (ch + gap) + 0.5, cw - 1, ch - 1);
      }
    }
  }
}

const MODES = {
  cascade: drawCascade,
  languages: drawLanguages,
  documents: drawDocuments,
  leaf: drawLeaf,
  conveyor: drawConveyor,
  segment: drawSegment,
};

/** Per-mode fixed data, so a picture is the same shape on every visit. */
function initState(mode) {
  const rnd = seeded(mode.length * 977 + 13);
  return {
    yaw: 0.5,
    state: NET.nodes.map(() => 0),
    queue: [],
    next: 0,
    w: Array.from({ length: 22 }, () => rnd()),
    cells: Array.from({ length: 40 }, () => rnd() < 0.34),
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
    const draw = MODES[mode] || MODES.segment;
    const S = initState(mode || 'segment');
    const rnd = seeded(909);

    let W = 0; let H = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Document positions are stored 0..1 so they survive a resize.
      S.docs.forEach((d) => { d.px = d.x * W; d.py = d.y * H; });
    };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    size();

    let raf = 0;
    let running = false;
    const t0 = performance.now();

    const step = (now) => {
      const t = reduce ? 0.42 : ((now - t0) / 5200) % 1;

      if (mode === 'cascade') {
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
      if (mode === 'documents') {
        S.docs.forEach((d) => {
          d.x = (d.px ?? d.x * W); d.y = (d.py ?? d.y * H);
        });
      }

      ctx.clearRect(0, 0, W, H);
      draw(ctx, W, H, t, S);
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

    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, [mode]);

  return (
    <div className={styles.wrap}>
      <canvas ref={cv} className={styles.canvas} aria-label={label} role="img" />
      <span className={styles.tag}>{label}</span>
    </div>
  );
}
