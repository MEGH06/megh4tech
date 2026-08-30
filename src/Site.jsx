import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import CarWindow from './components/CarWindow';
import StartLights from './components/StartLights';
import Development from './components/Development';
import Driver from './components/Driver';
import GridSlot from './components/GridSlot';
import Ladder from './components/Ladder';
import CommandBar from './components/CommandBar';
import SectorNav from './components/SectorNav';
import Paddock from './components/Paddock';
import PitBoard from './components/PitBoard';
import RaceRecord from './components/RaceRecord';
import Skills from './components/Skills';
import TimingTower from './components/TimingTower';
import useScrollProgress from './hooks/useScrollProgress';
import styles from './Site.module.css';

// ~950 kB of three.js plus the first model. Never in front of first paint.
const CarStage = lazy(() => import('./three/CarStage'));

/**
 * The frame-rate floor at which the render is worth keeping.
 *
 * 26, not 60. Below this the car is not a flourish, it is a stutter — and the
 * measured case is not hypothetical: on software rasterisation, which is what
 * a corporate laptop with no GPU actually gives you, this page runs at roughly
 * one frame per second. A stunning site that stutters is remembered as a
 * stuttering site.
 */
const FPS_FLOOR = 26;

/** How long to watch before deciding. Long enough to survive the first paint. */
const SAMPLE_MS = 1100;

const canWebGL = () => {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext
      && (c.getContext('webgl2') || c.getContext('webgl')),
    );
  } catch {
    return false;
  }
};

// Once per session, and never for someone who asked for less motion.
const shouldRunLights = () => {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    if (sessionStorage.getItem('m4t.lights') === 'out') return false;
  } catch {
    /* private mode — just run it */
  }
  return true;
};

/**
 * The site.
 *
 * One fixed canvas behind the whole document, one continuous camera flying a
 * Monaco-shaped lap driven by scroll. Content sections take one side of the
 * frame and the car slides to the other and shrinks — it is never covered, and
 * it parks while a section is being read.
 */
export default function Site() {
  const invalidate = useRef(null);
  const [lights, setLights] = useState(shouldRunLights);

  const lightsOut = useCallback(() => {
    setLights(false);
    try {
      sessionStorage.setItem('m4t.lights', 'out');
    } catch {
      /* nothing to do */
    }
  }, []);

  // The canvas runs on `frameloop="demand"`, so scroll has to ask for frames.
  // The same pass fades the stage in: the landing is video only, and the car
  // arrives as you leave it. Written as a custom property rather than state —
  // this runs on every scroll frame.
  const onScroll = useCallback((p) => {
    const reveal = Math.min(1, Math.max(0, (p - 0.02) / 0.09));
    document.documentElement.style.setProperty('--stage-in', reveal.toFixed(3));
    invalidate.current?.();
  }, []);

  const progress = useScrollProgress(onScroll);
  const [able] = useState(canWebGL);
  // Knowable at mount, so it is derived rather than set from an effect — a
  // preference that exists before first paint is not a thing that "happens".
  const [reduced] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [slow, setSlow] = useState(false);

  // Watch the real frame rate for a second, then decide once.
  //
  // Detecting the backend by name is unreliable — SwiftShader reports itself
  // inconsistently and a weak discrete GPU reports itself as fine. Counting
  // actual frames measures the thing we care about instead of a proxy for it.
  //
  // The decision is made once and never revisited: a canvas that appears and
  // disappears as the frame rate wanders is worse than either state.
  useEffect(() => {
    if (!able || reduced) return undefined;

    let frames = 0;
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      frames += 1;
      const dt = performance.now() - t0;
      if (dt < SAMPLE_MS) { raf = requestAnimationFrame(tick); return; }
      if ((frames / dt) * 1000 < FPS_FLOOR) setSlow(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [able, reduced]);

  const webgl = able && !reduced && !slow;

  return (
    <>
      {lights ? <StartLights onDone={lightsOut} /> : null}

      {webgl ? (
        <Suspense fallback={null}>
          <CarStage progress={progress} invalidateRef={invalidate} />
        </Suspense>
      ) : null}

      <SectorNav />

      <CommandBar />

      <div className={styles.flow}>
        <GridSlot />
        {/* Windows alternate side so the flight does not settle into a rhythm
            of identical left-aligned plates. */}
        <CarWindow id="plan" height="tall" align="left" />

        <main>
          <Driver />
          <Ladder />
          <CarWindow id="aero" height="tall" align="right" />
          <RaceRecord />
          <Paddock />
          <CarWindow id="chassis" height="tall" align="left" />
          <TimingTower />
          <Development />
          <CarWindow id="drive" height="tall" align="right" />
          <Skills />
          <PitBoard />
        </main>
      </div>
    </>
  );
}
