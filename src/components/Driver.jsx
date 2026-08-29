import useReveal from '../hooks/useReveal';
import useDockZone from '../hooks/useDockZone';
import { BIO, DRIVER } from '../data/driver';
import styles from './Driver.module.css';

/**
 * Who he is, in plain language.
 *
 * The rebuild had lost this entirely. Everything else on the page is a table,
 * a mark or a figure — impressive, but a visitor could scroll the whole site
 * without reading one sentence about how he actually works. Carried back over
 * from the previous site, unedited.
 */
export default function Driver() {
  const reveal = useReveal({ threshold: 0.12 });
  // Measured, not guessed: at x -0.58 / scale 0.62 the car sat 0%-56% across
  // and 2%-51% down — clipped at the left edge, and the entire bottom-left of
  // the frame empty beside a full column of prose. Pulled in off the edge,
  // dropped to centre it in its own half, and enlarged to fill that half.
  const dockRef = useDockZone({ x: -0.44, y: -0.08, scale: 0.66 });

  return (
    <section
      id="about"
      className={styles.section}
      data-side="right"
      data-col="e"
      ref={dockRef}
    >
      <div className={`${styles.wrap} col`} ref={reveal} data-reveal>
        <header className={styles.head}>
          <h2 className={styles.title}>About Me</h2>
        </header>

        {/* The old site's own one-liner. The landing carries the name and the
            three tags and nothing else, so this is where it belongs — it reads
            as the lede to the paragraphs rather than a slogan over a photo. */}
        <p className={styles.lede} data-step="1">
          {DRIVER.blurb}
        </p>

        {BIO.map((para, i) => (
          <p key={para.slice(0, 24)} className={styles.para} data-step={i + 2}>
            {para}
          </p>
        ))}

        {/* The figures used to sit here too. They are the same numbers the
            Achievements section already carries, and repeating a claim two
            screens apart does not double it — it makes a reader wonder which
            one is current. One place per fact. */}
      </div>
    </section>
  );
}
