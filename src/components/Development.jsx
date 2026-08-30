import useReveal from '../hooks/useReveal';
import useDockZone from '../hooks/useDockZone';
import { RESEARCH } from '../data/programmes';
import styles from './Development.module.css';

/**
 * Research, as the development programme.
 *
 * Two entries, both running. Kept deliberately spare — an ongoing programme
 * with no paper yet should look like work in progress, not a publication list
 * padded out to seem longer.
 */
export default function Development() {
  const reveal = useReveal({ threshold: 0.12 });
  // Projects immediately above now sits left, so this takes the right and the
  // car crosses back over. Two lefts in a row with no car break between them
  // would read as the layout having stalled.
  const dockRef = useDockZone({ x: 0, y: 0, scale: 1 });

  return (
    <section
      id="research"
      className={styles.section}
      ref={dockRef}
    >
      <div className={`${styles.wrap} col`} ref={reveal} data-reveal>
        <header className={styles.head}>
          <h2 className={styles.title}>Research Papers</h2>
        </header>

        <ul className={styles.list}>
          {RESEARCH.map((r, i) => (
            <li key={r.id} className={styles.item} data-step={i + 1}>
              <div className={styles.top}>
                <h3 className={styles.name}>{r.title}</h3>
                <span
                  className={`${styles.status} ${
                    r.status === 'Ongoing' ? styles.statusOn : ''
                  }`}
                >
                  {r.status}
                </span>
              </div>

              {r.where ? <p className={styles.where}>{r.where}</p> : null}

              <p className={styles.blurb}>{r.blurb}</p>

              <ul className={styles.tags}>
                {r.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
