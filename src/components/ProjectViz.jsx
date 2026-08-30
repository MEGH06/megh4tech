import { useEffect, useRef } from 'react';
import styles from './ProjectViz.module.css';

/**
 * A generated picture for a project that has no screenshot.
 *
 * It occupies exactly the slot a screenshot would, at the same size, so a card
 * with one of these and a card with a real image are the same shape. That is
 * the whole point: four of nine projects had an empty column where the others
 * showed the product.
 *
 * Each mode depicts something true about its project rather than being an
 * abstract flourish — a knowledge graph for the project built on a knowledge
 * graph, a spreading failure for the project that models spreading failure. If
 * a project's work is not shaped like any of these, it should get a real
 * screenshot instead of being given a picture of someone else's structure.
 *
 * Cheap on purpose: one small canvas, no library, and the loop is stopped
 * whenever the card is off screen — four of these running unseen would cost
 * more than the thing they replace.
 */

const seeded = (n) => () => {
  n = (n * 1664525 + 1013904223) >>> 0;
  return n / 4294967296;
};

/** Nodes and edges, settled once. Used by both network modes. */
function makeNetwork(seed, count, linkBias) {
  const rnd = seeded(seed);
  const nodes = Array.from({ length: count }, () => ({
    x: (rnd() - 0.5) * 150,
    y: (rnd() - 0.5) * 150,
    z: (rnd() - 0.5) * 150,
    vx: 0, vy: 0, vz: 0, deg: 0, lit: 0,
  }));

  const edges = [];
  for (let i = 1; i < count; i += 1) {
    edges.push([i, Math.floor(rnd() ** linkBias * i)]);
  }
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

const NETS = {
  // Twenty-two institutions, hub-heavy — a failure travels because exposure
  // concentrates, which is the thing the project measures.
  cascade: makeNetwork(419, 22, 0.5),
  // Denser and flatter: a citation/judgment graph has no single centre.
  graph: makeNetwork(77, 26, 0.85),
};

/** Grid modes: cells resolve from unknown to classified, in waves. */
function drawGrid(ctx, W, H, t, cols, rows, hitRate, rnd, cell) {
  const gap = Math.max(2, Math.min(W, H) * 0.018);
  const cw = (W - gap * (cols + 1)) / cols;
  const ch = (H - gap * (rows + 1)) / rows;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const i = r * cols + c;
      // A diagonal sweep, so the resolve reads as a pass over the data rather
      // than as cells blinking at random.
      const phase = ((c + r) / (cols + rows)) * 0.75;
      const local = (t - phase + 1) % 1;
      const on = local < 0.55;
      const settled = cell[i];

      ctx.fillStyle = on && settled
        ? 'rgba(224,18,54,.42)'
        : on ? 'rgba(242,240,238,.16)' : 'rgba(242,240,238,.05)';
      ctx.fillRect(gap + c * (cw + gap), gap + r * (ch + gap), cw, ch);

      if (on && settled) {
        ctx.strokeStyle = 'rgba(224,18,54,.75)';
        ctx.lineWidth = 1;
        ctx.strokeRect(gap + c * (cw + gap) + 0.5, gap + r * (ch + gap) + 0.5, cw - 1, ch - 1);
      }
    }
  }
}

export default function ProjectViz({ mode, label }) {
  const cv = useRef(null);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isGrid = mode === 'grid' || mode === 'sort';
    const net = NETS[mode === 'cascade' ? 'cascade' : 'graph'];
    const { nodes, edges, adj } = net;
    const state = nodes.map(() => 0);
    const rnd = seeded(mode === 'cascade' ? 909 : 313);

    let W = 0; let H = 0; let scale = 1;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(W, H) / 210;
    };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    size();

    let yaw = 0.5;
    let raf = 0;
    let running = false;
    let next = 0;
    let wave = [];

    // Cascade mode restarts on a long cycle so a reader who looks twice sees
    // it happen, rather than arriving after it finished.
    const reseed = (now) => {
      state.fill(0);
      const seed = nodes.reduce((best, n, i) => (n.deg > nodes[best].deg ? i : best), 0);
      state[seed] = 1;
      wave = [{ list: [...adj[seed]], at: now + 420 }];
    };

    // Which cells are positives. Fixed per mount so the pattern is stable
    // rather than flickering into a different answer every sweep.
    const cols = mode === 'sort' ? 8 : 7;
    const rows = mode === 'sort' ? 5 : 5;
    const cell = Array.from({ length: cols * rows }, () => rnd() < (mode === 'sort' ? 0.34 : 0.42));

    const step = (now) => {
      if (isGrid) {
        const t = reduce ? 0.2 : ((now / 4200) % 1);
        ctx.clearRect(0, 0, W, H);
        drawGrid(ctx, W, H, t, cols, rows, 0, rnd, cell);
        if (running) raf = requestAnimationFrame(step);
        return;
      }

      yaw += reduce ? 0 : 0.0022;

      if (mode === 'cascade') {
        if (!wave.length && now > next) { reseed(now); next = now + 9000; }
        if (wave.length && now >= wave[0].at) {
          const lv = wave.shift();
          const onward = [];
          lv.list.forEach((id) => {
            if (state[id]) return;
            if (rnd() < 0.62) { state[id] = 1; onward.push(...adj[id]); }
          });
          if (onward.length) wave.push({ list: onward, at: now + 520 });
        }
      } else {
        // Graph mode lights a wandering path instead — a traversal, not a
        // failure, because nothing about a knowledge graph is failing.
        if (now > next) {
          state.fill(0);
          let at = Math.floor(rnd() * nodes.length);
          for (let i = 0; i < 6; i += 1) {
            state[at] = 1;
            const near = adj[at];
            if (!near.length) break;
            at = near[Math.floor(rnd() * near.length)];
          }
          next = now + 1500;
        }
      }

      const cy = Math.cos(yaw); const sy = Math.sin(yaw);
      const cp = Math.cos(-0.18); const sp = Math.sin(-0.18);
      const P = nodes.map((n) => {
        const x = n.x * cy - n.z * sy;
        let z = n.x * sy + n.z * cy;
        const y = n.y * cp - z * sp;
        z = n.y * sp + z * cp;
        const k = 400 / (400 + z);
        return { x: W / 2 + x * k * scale, y: H / 2 + y * k * scale, k, z };
      });

      ctx.clearRect(0, 0, W, H);
      [...edges].sort((a, b) => (P[b[0]].z + P[b[1]].z) - (P[a[0]].z + P[a[1]].z))
        .forEach(([ai, bi]) => {
          const A = P[ai]; const B = P[bi];
          const hot = state[ai] && state[bi];
          ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
          ctx.strokeStyle = hot ? '#e01236' : '#2c2c2c';
          ctx.globalAlpha = hot ? 0.55 : Math.max(0.14, Math.min(0.6, (A.k + B.k) / 2 - 0.45));
          ctx.lineWidth = hot ? 1.3 : 0.9;
          ctx.stroke();
        });
      ctx.globalAlpha = 1;

      nodes.map((_, i) => i).sort((a, b) => P[b].z - P[a].z).forEach((i) => {
        const p = P[i];
        const r = Math.max(1.1, (1.6 + nodes[i].deg * 0.42) * p.k * scale * 0.85);
        if (state[i]) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4.5);
          g.addColorStop(0, 'rgba(224,18,54,.34)');
          g.addColorStop(1, 'rgba(224,18,54,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, r * 4.5, 0, 6.2832); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832);
        ctx.fillStyle = state[i] ? '#e01236' : '#f2f0ee';
        ctx.globalAlpha = state[i] ? 1 : Math.max(0.3, Math.min(0.85, p.k - 0.3));
        ctx.fill(); ctx.globalAlpha = 1;
      });

      if (running) raf = requestAnimationFrame(step);
    };

    // Four of these on one page, all animating unseen, would cost more than
    // the screenshots they stand in for.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true; next = performance.now(); raf = requestAnimationFrame(step);
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
