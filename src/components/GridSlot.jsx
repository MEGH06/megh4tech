import { DRIVER, DRIVER_ROLES } from '../data/driver';
import styles from './GridSlot.module.css';

// Served from public/ as a plain URL rather than imported, so it streams as a
// static file instead of going through the bundle graph. 2.8 MB, re-encoded
// from the 36.8 MB original.
const HERO_VIDEO = '/hero-loop.mp4';

/**
 * The landing.
 *
 * Everything sits in the bottom-left corner and the rest of the frame is left
 * to the car and the light — the composition is the empty space, not the
 * content. Name, three disciplines, then the season figures counting up.
 */
export default function GridSlot() {
  return (
    <section className={styles.section} id="home">
      {/* Video and scrim masked together as one unit. Separately they each end
          at the section edge with their own hard line; the whole backdrop has
          to dissolve, or the landing reads as a block sitting on the page. */}
      <div className={styles.backdrop} aria-hidden="true">
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className={styles.scrim} />
      </div>

      {/* No canvas here. The car comes from the single fixed CarStage behind
          the whole document — the landing is just the first window onto it. */}

      {/* The corner. */}
      <div className={styles.content}>
        <div className={styles.wrap}>
          <h1 className={styles.name}>
            <span className={styles.first}>{DRIVER.first}</span>
            <span className={styles.last}>{DRIVER.last}</span>
          </h1>

          <ul className={styles.roles}>
            {DRIVER_ROLES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>

      <a className={styles.scroll} href="#education">
        <span>Scroll</span>
        <i className={styles.arrow} aria-hidden="true" />
      </a>
    </section>
  );
}
