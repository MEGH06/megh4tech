import { useEffect, useRef, useState } from 'react';
import styles from './Cascade.module.css';

/**
 * Equilibrium.ai, drawn.
 *
 * A network of institutions, an exposure graph between them, and a failure
 * that travels along the edges until it dies out — which is the thing the
 * project actually models. This is the one section on the site where the
 * graphic is evidence rather than decoration: a client is not told that Megh
 * builds systemic-risk systems, they are watching one run.
 *
 * Canvas rather than WebGL, deliberately. It is roughly 6 KB against the car's
 * 260 KB gzip, it runs on the software rasteriser that the car cannot, and it
 * needs no library — so it survives the performance floor that switches the
 * car off. Real perspective projection and depth sorting; the 3D is honest,
 * only the renderer is cheap.
 */

const N = 24;
const TIERS = [['G-SIB', 5], ['REGIONAL', 9], ['INSURER', 5], ['FUND', 5]];
const HOP_MS = 620;
const MAX_HOPS = 6;

/* Seeded, so the network is the same every visit. A layout that reshuffles on
   reload reads as noise; one that is always this shape reads as a system. */
function makeRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function build() {
  const rnd = makeRandom(419);
  const nodes = [];
  const tiers = TIERS.map((t) => [...t]);
  let ti = 0;

  for (let i = 0; i < N; i += 1) {
    while (tiers[ti][1] === 0) ti += 1;
    tiers[ti][1] -= 1;
    nodes.push({
      id: i,
      tier: tiers[ti][0],
      name: `${tiers[ti][0].charAt(0)}-${101 + i}`,
      x: (rnd() - 0.5) * 180,
      y: (rnd() - 0.5) * 180,
      z: (rnd() - 0.5) * 180,
      vx: 0, vy: 0, vz: 0, deg: 0, state: 0, age: 0,
    });
  }

  // A spanning tree first so nothing is orphaned, then extra exposures. The
  // sqrt bias attaches new institutions to established ones, which is what
  // makes the cascade travel instead of fizzling.
  const edges = [];
  const has = (a, b) => edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  for (let i = 1; i < N; i += 1) edges.push([i, Math.floor(rnd() ** 0.5 * i)]);
  for (let k = 0; k < 20; k += 1) {
    const a = Math.floor(rnd() * N);
    const b = Math.floor(rnd() * N);
    if (a !== b && !has(a, b)) edges.push([a, b]);
  }

  const adj = nodes.map(() => []);
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  nodes.forEach((n, i) => { n.deg = adj[i].length; });

  // Settle the layout once up front rather than simulating forever.
  for (let step = 0; step < 450; step += 1) {
    for (let i = 0; i < N; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < N; j += 1) {
        const b = nodes[j];
        const dx = b.x - a.x; const dy = b.y - a.y; const dz = b.z - a.z;
        const d2 = dx * dx + dy * dy + dz * dz + 1;
        const d = Math.sqrt(d2);
        const f = 1800 / d2;
        a.vx -= (dx / d) * f; a.vy -= (dy / d) * f; a.vz -= (dz / d) * f;
        b.vx += (dx / d) * f; b.vy += (dy / d) * f; b.vz += (dz / d) * f;
      }
    }
    edges.forEach(([ai, bi]) => {
      const a = nodes[ai]; const b = nodes[bi];
      const dx = b.x - a.x; const dy = b.y - a.y; const dz = b.z - a.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;
      const f = (d - 76) * 0.013;
      a.vx += (dx / d) * f; a.vy += (dy / d) * f; a.vz += (dz / d) * f;
      b.vx -= (dx / d) * f; b.vy -= (dy / d) * f; b.vz -= (dz / d) * f;
    });
    nodes.forEach((a) => {
      a.vx -= a.x * 0.0045; a.vy -= a.y * 0.0045; a.vz -= a.z * 0.0045;
      a.vx *= 0.83; a.vy *= 0.83; a.vz *= 0.83;
      a.x += a.vx; a.y += a.vy; a.z += a.vz;
    });
  }

  return { nodes, edges, adj, order: [...nodes].sort((a, b) => b.deg - a.deg) };
}

const NET = build();

export default function Cascade() {
  const cv = useRef(null);
  const [failed, setFailed] = useState(0);
  const [hops, setHops] = useState(0);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);

  const state = useRef({ queue: [], at: 0, running: false, yaw: 0.45, pitch: -0.15, drag: null });

  // Reset every node, then fail the largest institution and let it spread.
  const trigger = () => {
    NET.nodes.forEach((n) => { n.state = 0; n.age = 0; });
    const seed = NET.order[0];
    seed.state = 2;
    state.current.queue = [{ list: [...NET.adj[seed.id]], hop: 1 }];
    state.current.at = performance.now() + 420;
    state.current.running = true;
    setFailed(1); setHops(0); setRunning(true); setTick((t) => t + 1);
  };

  const reset = () => {
    NET.nodes.forEach((n) => { n.state = 0; n.age = 0; });
    state.current.queue = []; state.current.running = false;
    setFailed(0); setHops(0); setRunning(false); setTick((t) => t + 1);
  };

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rnd = makeRandom(77);

    let W = 0; let H = 0; let scale = 1;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(W, H) / 330;
    };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    size();

    const CAM = 470;
    const project = (n) => {
      const { yaw, pitch } = state.current;
      const cy = Math.cos(yaw); const sy = Math.sin(yaw);
      const cx = Math.cos(pitch); const sx = Math.sin(pitch);
      const x = n.x * cy - n.z * sy;
      let z = n.x * sy + n.z * cy;
      const y = n.y * cx - z * sx;
      z = n.y * sx + z * cx;
      const k = CAM / (CAM + z);
      return { x: W / 2 + x * k * scale, y: H / 2 + y * k * scale, k, z };
    };

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const P = NET.nodes.map(project);

      const es = [...NET.edges].sort(
        (a, b) => (P[b[0]].z + P[b[1]].z) - (P[a[0]].z + P[a[1]].z),
      );
      es.forEach(([ai, bi]) => {
        const A = P[ai]; const B = P[bi];
        const hot = NET.nodes[ai].state === 2 && NET.nodes[bi].state === 2;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = hot ? '#e01236' : '#262626';
        ctx.globalAlpha = hot ? 0.5 : Math.max(0.16, Math.min(0.7, (A.k + B.k) / 2 - 0.4));
        ctx.lineWidth = hot ? 1.4 : 1;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      [...NET.nodes.keys()].sort((a, b) => P[b].z - P[a].z).forEach((i) => {
        const n = NET.nodes[i]; const p = P[i];
        const r = Math.max(1.4, (2.2 + n.deg * 0.72) * p.k * scale * 0.9);
        if (n.state && n.age < 22) {
          ctx.beginPath(); ctx.arc(p.x, p.y, r + (22 - n.age) * 1.1, 0, 6.2832);
          ctx.fillStyle = n.state === 2 ? '#e01236' : '#ffd400';
          ctx.globalAlpha = ((22 - n.age) / 22) * 0.2; ctx.fill(); ctx.globalAlpha = 1;
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832);
        ctx.fillStyle = n.state === 2 ? '#e01236' : n.state === 1 ? '#ffd400' : '#f2f0ee';
        ctx.globalAlpha = n.state ? 1 : Math.max(0.34, Math.min(0.92, p.k - 0.24));
        ctx.fill(); ctx.globalAlpha = 1;
      });
    };

    const step = (now) => {
      const st = state.current;
      if (!st.drag && !reduce) st.yaw += 0.0018;
      NET.nodes.forEach((n) => { if (n.state && n.age < 40) n.age += 1; });

      if (st.running && st.queue.length && now >= st.at) {
        const lv = st.queue.shift();
        const next = [];
        let any = false;
        lv.list.forEach((id) => {
          const m = NET.nodes[id];
          if (m.state === 2) return;
          // Bigger counterparties are likelier to be dragged down.
          if (rnd() < 0.5 + m.deg * 0.035) {
            m.state = 2; m.age = 0; any = true; next.push(...NET.adj[id]);
          } else if (m.state === 0) { m.state = 1; m.age = 0; }
        });
        setFailed(NET.nodes.filter((n) => n.state === 2).length);
        if (any) setHops(lv.hop);
        if (next.length && lv.hop < MAX_HOPS) {
          st.queue.push({ list: next, hop: lv.hop + 1 });
          st.at = now + HOP_MS;
        } else { st.running = false; setRunning(false); }
      }

      draw();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const down = (e) => {
      state.current.drag = { x: e.clientX, y: e.clientY, ...state.current };
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      const d = state.current.drag;
      if (!d) return;
      state.current.yaw = d.yaw + (e.clientX - d.x) * 0.007;
      state.current.pitch = Math.max(-1.2, Math.min(1.2, d.pitch + (e.clientY - d.y) * 0.006));
    };
    const up = () => { state.current.drag = null; };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [tick]);

  const pct = Math.round((failed / N) * 100);

  return (
    <div className={styles.rig}>
      <div className={styles.telemetry}>
        <div className={`${styles.pad} panel`}>
          <div className={styles.padHead}>
            <span>Contagion telemetry</span>
            <span>
              <i className={`${styles.dot} ${running ? styles.dotOn : ''}`} />
              {running ? 'Propagating' : failed ? 'Settled' : 'Idle'}
            </span>
          </div>
          <div className={styles.reads}>
            <div>
              <div className={styles.k}>Failed</div>
              <div className={`${styles.v} display`}>
                {String(failed).padStart(2, '0')}
                <small>{`/${N}`}</small>
              </div>
            </div>
            <div>
              <div className={styles.k}>Hops</div>
              <div className={`${styles.v} display`}>{hops}</div>
            </div>
            <div>
              <div className={styles.k}>Contagion</div>
              <div className={`${styles.v} display ${pct >= 40 ? styles.alarm : ''}`}>
                {pct}
                <small>%</small>
              </div>
            </div>
            <div>
              <div className={styles.k}>Exposures</div>
              <div className={`${styles.v} display`}>{NET.edges.length}</div>
            </div>
          </div>
        </div>

        <div className={`${styles.pad} panel`}>
          <div className={styles.padHead}>
            <span>Institutions · by exposure</span>
            <span>{failed ? (running ? 'Cascading' : 'Settled') : 'Stable'}</span>
          </div>
          <ol className={styles.tower}>
            {NET.order.map((n, i) => {
              const s = n.state === 2 ? 'failed' : n.state === 1 ? 'stressed' : 'stable';
              return (
                <li key={n.id} className={styles.row} data-s={s}>
                  <span className={styles.pos}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.nm}>{n.name}</span>
                  <span className={styles.tier}>{n.tier}</span>
                  <span className={styles.st}>
                    {n.state === 2 ? 'DNF' : n.state === 1 ? 'WARN' : 'OK'}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className={`${styles.stagePanel} panel`}>
        <div className={styles.padHead}>
          <span>{`Interbank exposure network · ${N} nodes`}</span>
          <span className={styles.ctrl}>
            <button type="button" className={`${styles.btn} ${styles.primary} panel--sm`} onClick={trigger}>
              Trigger failure
            </button>
            <button type="button" className={`${styles.btn} panel--sm`} onClick={reset}>
              Reset
            </button>
          </span>
        </div>
        <div className={styles.stage}>
          <canvas
            ref={cv}
            className={styles.net}
            aria-label={`Interbank exposure network of ${N} institutions. `
              + `${failed} have failed after ${hops} hops.`}
          />
          <span className={styles.hint}>Drag to rotate</span>
        </div>
      </div>
    </div>
  );
}
