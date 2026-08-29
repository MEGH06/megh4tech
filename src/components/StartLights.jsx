import { useEffect, useState } from 'react';
import { SIGNATURE } from '../data/signature';
import styles from './StartLights.module.css';

/**
 * The start gantry.
 *
 * Real procedure, because the wrong procedure is what makes these look
 * generic: five columns illuminate one at a time at a fixed interval, all five
 * hold together, then every lamp goes out at the same instant. Lights out is a
 * cut, not a fade — the whole drama of it is that the extinguish is
 * simultaneous and unannounced.
 *
 * The hold is randomised, as it is on the grid. A fixed hold reads as an
 * animation; a variable one reads as a countdown you cannot anticipate.
 *
 * Shown once per session. Skipped entirely under reduced motion, where a
 * blocking full-screen sequence is exactly the wrong thing.
 */

const COLUMNS = 5;
const STEP = 210;   // ms between columns
const OUT = 380;    // ms for the panel to clear once lights are out

export default function StartLights({ onDone }) {
  const [lit, setLit] = useState(0);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const timers = [];

    for (let i = 1; i <= COLUMNS; i += 1) {
      timers.push(setTimeout(() => setLit(i), i * STEP));
    }

    // 400-1100ms, the same window the real one uses.
    const hold = 400 + Math.random() * 700;
    const outAt = COLUMNS * STEP + hold;

    timers.push(setTimeout(() => setOut(true), outAt));
    timers.push(setTimeout(() => {
      setGone(true);
      onDone?.();
    }, outAt + OUT));

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  if (gone) return null;

  return (
    <div
      className={`${styles.veil} ${out ? styles.clearing : ''}`}
      role="status"
      aria-label="Loading"
    >
      <div className={styles.gantry} aria-hidden="true">
        {Array.from({ length: COLUMNS }, (_, i) => (
          <div key={i} className={styles.column}>
            <span
              className={`${styles.lamp} ${!out && lit > i ? styles.on : ''}`}
            />
            <span
              className={`${styles.lamp} ${!out && lit > i ? styles.on : ''}`}
            />
          </div>
        ))}
      </div>

      {/* The name, written rather than set. It draws itself over the same
          1050ms the gantry takes to light, so the two finish together and the
          randomised hold belongs entirely to the lights.

          `aria-hidden` because the veil already announces itself as "Loading" —
          this is the name as artwork, not a second thing to read out. */}
      <svg
        className={styles.sig}
        viewBox={SIGNATURE.viewBox}
        aria-hidden="true"
        focusable="false"
      >
        <path d={SIGNATURE.d} pathLength="1" />
      </svg>

      {/* A non-breaking space, not an empty string or a null branch: the veil
          is a column flex with a gap, so an element that collapses to nothing
          still contributes one, and removing it entirely shifts the gantry and
          the signature down the instant "Lights out" appears. */}
      <span className={styles.caption} aria-hidden="true">
        {out ? 'Lights out' : ' '}
      </span>
    </div>
  );
}
