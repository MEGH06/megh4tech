import styles from './SectorMark.module.css';

/**
 * The rule between two sections, and the only numbering on the site.
 *
 * R8. Numbering is structure here rather than decoration: the page is a lap,
 * the sections are sectors, and they are genuinely ordered — you cannot read
 * Contact before Projects. A numbered marker on content that has no order is
 * the generated-design tell; on content that does, it is a map.
 *
 * `aria-hidden`, because it is a visual divider. The heading inside each
 * section is what a screen reader should hear, and announcing "sector zero
 * four, slash, projects" before every one of them is noise.
 */
export default function SectorMark({ n, label }) {
  return (
    <div className={styles.mark} aria-hidden="true">
      <span className={styles.n}>{`Sector ${String(n).padStart(2, '0')}`}</span>
      <span className={styles.slash}>/</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
