import useReveal from '../hooks/useReveal';
import useDockZone from '../hooks/useDockZone';
import { LADDER } from '../data/education';
import styles from './Ladder.module.css';

/**
 * Education, as a climb.
 *
 * Was a three-row table with the columns Year / Institution / Score. Accurate,
 * and nothing to look at — three rows of small text is the weakest thing a
 * table can be asked to do, and the one fact worth seeing (a 8.93 CGPA on a
 * data-science degree) was set at the same size as everything else.
 *
 * Now each stage is a rung: the score is the anchor at display size, the
 * institution carries the line, and a rail down the left shows the climb with
 * the live rung marked. Three items is too few to need scanning columns and
 * exactly right for a progression.
 *
 * Reversed from the data order. The source lists bottom rung first, the way a
 * career table reads on a race programme, but someone deciding whether to hire
 * Megh wants where he is now in the first line, not the third.
 */
export default function Ladder() {
  const reveal = useReveal({ threshold: 0.14 });
  const dockRef = useDockZone({ x: 0.46, y: -0.06, scale: 0.64 });

  const rungs = [...LADDER].reverse();

  return (
    <section
      id="education"
      className={styles.section}
      data-side="left"
      data-col="a"
      ref={dockRef}
    >
      <div className={`${styles.wrap} col`} ref={reveal} data-reveal>
        <header className={styles.head}>
          <h2 className={styles.title}>Education</h2>
        </header>

        <ol className={styles.rungs}>
          {rungs.map((rung, i) => (
            <li
              key={rung.id}
              className={rung.current ? styles.live : undefined}
              data-step={Math.min(6, i + 1)}
            >
              <div className={styles.node} aria-hidden="true" />

              <div className={styles.body}>
                <h3 className={styles.institution}>{rung.institution}</h3>
                <p className={styles.qualification}>{rung.qualification}</p>
                <p className={styles.years}>
                  {rung.season}
                  {rung.current ? (
                    <span className={styles.now}>Currently studying</span>
                  ) : null}
                </p>
              </div>

              <div className={styles.score}>
                <span className={`${styles.scoreValue} tabular`}>
                  {rung.score}
                </span>
                <span className={styles.scoreUnit}>{rung.unit}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
