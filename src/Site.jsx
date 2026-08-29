import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import CarWindow from './components/CarWindow';
import StartLights from './components/StartLights';
import SectorMark from './components/SectorMark';
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
  const webgl = canWebGL();

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
          <SectorMark n={1} label="About" />
          <Driver />
          <SectorMark n={2} label="Education" />
          <Ladder />
          <CarWindow id="aero" height="tall" align="right" />

          <SectorMark n={3} label="Achievements" />
          <RaceRecord />
          <SectorMark n={4} label="Experience" />
          <Paddock />
          <CarWindow id="chassis" height="tall" align="left" />

          <SectorMark n={5} label="Projects" />
          <TimingTower />
          <SectorMark n={6} label="Research" />
          <Development />
          <CarWindow id="drive" height="tall" align="right" />

          <SectorMark n={7} label="Skills" />
          <Skills />
          <SectorMark n={8} label="Contact" />
          <PitBoard />
        </main>
      </div>
    </>
  );
}
