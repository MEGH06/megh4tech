import { useEffect, useState } from 'react';
import { scrollToEl } from '../lib/scrollTo';
import styles from './SectorNav.module.css';

/**
 * Navigation.
 *
 * Nothing at all on the landing — the first screen is the car, the name and
 * three tags, and a nav bar across it would be the same mistake as the section
 * plates. A hamburger fades in once you start scrolling and opens a
 * full-screen sheet.
 *
 * Scroll-spy runs off one IntersectionObserver rather than a scroll handler
 * measuring offsets: it costs nothing while idle and cannot drift when content
 * length changes.
 */

const STOPS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'education', label: 'Education' },
  { id: 'record', label: 'Achievements' },
  { id: 'paddock', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'research', label: 'Research Papers' },
  { id: 'sponsors', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

export default function SectorNav() {
  const [active, setActive] = useState('home');
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  // The button appears only once the landing has started to move.
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const nodes = STOPS
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    if (!nodes.length) return undefined;

    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.intersectionRatio));
        // Most-visible wins. "First one intersecting" makes the marker jump
        // backwards whenever a tall section is still tailing off.
        let best = null;
        let ratio = 0;
        seen.forEach((r, id) => {
          if (r > ratio) {
            ratio = r;
            best = id;
          }
        });
        if (best) setActive(best);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // A full-screen overlay with no keyboard exit is a trap, and the page behind
  // it should not scroll while it is up.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    // scrollToEl clears the sheet's scroll lock itself — the effect cleanup
    // that would otherwise release it runs a render too late, and a scroll
    // issued against a locked body is silently dropped.
    scrollToEl(document.getElementById(id));
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${shown || open ? styles.in : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="nav-sheet"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {/* Icon only. The word was redundant next to a hamburger and the
            "Close" state was wide enough to collide with the first nav item.
            `aria-label` on the button still announces the state. */}
        <span
          className={`${styles.bars} ${open ? styles.barsX : ''}`}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
        </span>
      </button>

      <div
        id="nav-sheet"
        className={`${styles.sheet} ${open ? styles.sheetOpen : ''}`}
        hidden={!open}
      >
        <nav aria-label="Sections">
          <ul className={styles.list}>
            {STOPS.map((s, i) => (
              <li key={s.id} style={{ '--i': i }}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => go(e, s.id)}
                  className={active === s.id ? styles.on : undefined}
                  aria-current={active === s.id ? 'true' : undefined}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.foot}>
          <a
            href="https://github.com/MEGH06"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/megh-dave-4a2227314/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href="https://medium.com/@meghdave2006"
            target="_blank"
            rel="noopener noreferrer"
          >
            Medium
          </a>
        </div>
      </div>
    </>
  );
}
