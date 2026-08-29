import styles from './MetaStrip.module.css';

/**
 * Attribution as fields, never as prose.
 *
 * The rule this enforces (§16.3): every project and every achievement carries
 * this strip, in the same position, in the same type. When every entry has it
 * the eye reads metadata and moves on. When only some entries have it, the eye
 * reads an excuse and stops — which is exactly what a sentence explaining team
 * involvement does, however carefully it is worded.
 *
 * ROLE copy is noun-heavy and never states a fraction of the work.
 * "ML pipeline · Risk model", not "I helped with the ML part". The credit is
 * the honesty; the arithmetic is the apology.
 *
 * Fields with no value are not rendered at all, and the grid closes up. A
 * dashed placeholder would be the note-to-self problem again: a visitor should
 * never be shown the shape of information that is missing.
 */

const FIELDS = [
  ['event', 'Event'],
  ['result', 'Result'],
  ['role', 'Role'],
  ['team', 'Team'],
];

export default function MetaStrip({ meta }) {
  if (!meta) return null;
  const shown = FIELDS.filter(([key]) => meta[key]);
  if (!shown.length) return null;

  return (
    <dl className={styles.meta} data-cols={shown.length}>
      {shown.map(([key, label]) => (
        <div key={key} className={styles.cell}>
          <dt className={styles.k}>{label}</dt>
          {/* Only RESULT carries the accent. Everything else is a fact about
              the work, not an outcome of it. */}
          <dd className={`${styles.v} ${key === 'result' ? styles.state : ''}`}>
            {meta[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}
