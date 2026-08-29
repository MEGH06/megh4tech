import useReveal from '../hooks/useReveal';
import { GROUPS } from '../data/skills';
import styles from './Skills.module.css';

/**
 * Skills, as a partner sheet.
 *
 * Keeps the poster layout — title bar, centred rows of wordmarks on one flat
 * ground — but the rows are now categories rather than importance tiers.
 *
 * Two things changed and both were the same mistake. The old top tier set two
 * marks at 5rem in Rosso, which did not read as "these matter most", it read
 * as two words shouting over a list. And an Amazon panel sat at the foot of
 * the section, which advertised AWS rather than saying what Megh can do. Marks
 * are now one size and one colour throughout; the only variable is which group
 * a thing is in, and the AWS services are simply part of Cloud & DevOps.
 *
 * Wordmarks, not logos: rendering trademarks would be a licensing problem and
 * off-brand. Type at the right weight reads as a mark anyway.
 */

function Group({ group }) {
  const reveal = useReveal({ threshold: 0.08 });

  return (
    <div className={styles.group} ref={reveal} data-reveal>
      <h3 className={styles.groupLabel}>{group.label}</h3>
      <ul className={styles.marks}>
        {group.marks.map((mark, i) => (
          <li key={mark} data-step={Math.min(6, 1 + ((i / 5) | 0))}>
            {mark}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Skills() {
  const head = useReveal({ threshold: 0.3 });

  return (
    <section
      id="sponsors"
      className={styles.section}
      aria-labelledby="skills-title"
    >
      <div className={styles.sheet}>
        {/* The title bar off a partner poster: white out of a solid block. */}
        <header className={styles.banner} ref={head} data-reveal>
          <h2 id="skills-title" className={styles.title}>
            Skills
          </h2>
        </header>

        {GROUPS.map((group) => (
          <Group key={group.id} group={group} />
        ))}
      </div>
    </section>
  );
}
