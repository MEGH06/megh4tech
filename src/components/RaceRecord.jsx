import useReveal from '../hooks/useReveal';
import useDockZone from '../hooks/useDockZone';
import Tally from './f1/Tally';
import { RESULTS, SUMMARY } from '../data/results';
import styles from './RaceRecord.module.css';

/**
 * Hackathon results as a season classification.
 *
 * Wins are red with a red bar down the left edge, third places stay white:
 * one colour rule, so nine wins register at a glance without a badge on
 * every row.
 */
export default function RaceRecord() {
  const reveal = useReveal({ threshold: 0.1 });
  // Content sits right, so the car goes left — and further out, because this
  // is the widest column on the page.
  const dockRef = useDockZone({ x: 0, y: 0, scale: 1 });

  return (
    <section
      id="record"
      className={styles.section}
      ref={dockRef}
    >
      <div className={`${styles.wrap} col`} ref={reveal} data-reveal>
        <header className={styles.head}>
          <h2 className={styles.title}>Achievements</h2>
        </header>

        <div className={styles.summary}>
          {SUMMARY.map((s, i) => (
            <div key={s.label} className={styles.stat} data-step={i + 1}>
              <Tally value={String(s.value).padStart(2, "0")} className={styles.tally} />
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* A list, not a table.
            These entries carry what was actually built — an 85% liquidity-risk
            figure, a Mask2Former backbone, a 15-step retrieval pipeline — and
            none of that fits in a four-column grid. The placing is the least
            interesting thing on the row and is set as a small mark; the build
            is the claim. */}
        <ol className={styles.rows}>
          {RESULTS.map((r, i) => (
            <li
              key={r.round}
              className={r.result === 'Winner' ? styles.win : undefined}
              data-step={Math.min(6, i + 1)}
            >
              <div className={styles.place}>
                <span className={styles.result}>{r.result}</span>
                {r.season ? <span className={styles.when}>{r.season}</span> : null}
              </div>

              <div className={styles.body}>
                <h3 className={styles.event}>
                  {r.event}
                  {r.venue ? <span className={styles.venue}>{r.venue}</span> : null}
                </h3>

                {r.project ? (
                  <p className={styles.project}>{r.project}</p>
                ) : null}
                {r.blurb ? <p className={styles.blurb}>{r.blurb}</p> : null}
                {r.stack?.length ? (
                  <ul className={styles.stack}>
                    {r.stack.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
