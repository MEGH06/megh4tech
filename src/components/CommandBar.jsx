import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PROJECTS } from '../data/projects';
import { RESULTS } from '../data/results';
import { CONTACT } from '../data/contact';
import { scrollToEl } from '../lib/scrollTo';
import styles from './CommandBar.module.css';

/**
 * Navigation as a command line.
 *
 * The hamburger sheet is the discoverable route and it stays. This is the fast
 * one, and it exists because a portfolio does not scale by scrolling: at twenty
 * projects, typing `forge` beats any amount of dragging, and a sheet listing
 * nine sections cannot list every project without becoming the same problem.
 *
 * Everything it knows comes from the same modules the page renders from —
 * projects, results, contact. Nothing is duplicated, so it cannot drift out of
 * date when a project is added. That is the whole difference between this and
 * a terminal that prints a canned paragraph.
 *
 * It navigates rather than answering. A command that printed Megh's stack into
 * a black box would be a second copy of the site, competing with the real one;
 * scrolling to the section and marking it keeps one source of truth on screen.
 */

const SECTIONS = [
  { id: 'home', label: 'Home', hint: 'top of the page' },
  { id: 'about', label: 'About', hint: 'who he is' },
  { id: 'education', label: 'Education', hint: 'D.J. Sanghvi, 8.96 CGPA' },
  { id: 'record', label: 'Achievements', hint: '7 wins' },
  { id: 'paddock', label: 'Experience', hint: 'IIT Bombay, judging, mentoring' },
  { id: 'projects', label: 'Projects', hint: 'the builds' },
  { id: 'research', label: 'Research Papers', hint: 'ongoing work' },
  { id: 'sponsors', label: 'Skills', hint: 'the stack' },
  { id: 'contact', label: 'Contact', hint: 'start a project' },
];

/** Everything reachable, built once from the real data. */
function buildIndex() {
  const out = SECTIONS.map((s) => ({
    kind: 'section', id: s.id, label: s.label, hint: s.hint, target: s.id,
  }));

  [...PROJECTS].sort((a, b) => a.pos - b.pos).forEach((p) => {
    out.push({
      kind: 'project',
      id: `project-${p.id}`,
      label: p.title,
      hint: p.field || 'project',
      target: 'projects',
      focus: p.id,
    });
  });

  RESULTS.filter((r) => r.event).forEach((r) => {
    out.push({
      kind: 'win',
      id: `win-${r.round}`,
      label: r.event,
      hint: r.project ? `${r.result} — ${r.project}` : r.result,
      alt: r.project || '',
      target: 'record',
    });
  });

  out.push({
    kind: 'action', id: 'mail', label: `Email ${CONTACT.email}`,
    hint: 'opens your mail app', href: `mailto:${CONTACT.email}`,
  });
  out.push({
    kind: 'action', id: 'github', label: 'GitHub', hint: 'github.com/MEGH06',
    href: CONTACT.github,
  });
  out.push({
    kind: 'action', id: 'linkedin', label: 'LinkedIn', hint: 'profile',
    href: CONTACT.linkedin,
  });
  return out;
}

const INDEX = buildIndex();

/**
 * Subsequence match, so "eco" finds "EcoSort" and "ltagt" finds "LitAgent".
 *
 * Scored by how tightly the matched letters sit together, not merely whether
 * they all appear. Run loosely over a whole haystack, "ecst" is a subsequence
 * of "Projects the builds" as readily as of "EcoSort" — every long string
 * contains nearly every short subsequence — so a scattered match has to rank
 * below a compact one instead of tying with it.
 */
function subsequence(text, q) {
  let i = 0;
  let first = -1;
  let last = 0;
  for (let n = 0; n < text.length && i < q.length; n += 1) {
    if (text[n] === q[i]) {
      if (first < 0) first = n;
      last = n;
      i += 1;
    }
  }
  if (i < q.length) return -1;
  const spread = last - first + 1;
  // 40 when the letters are adjacent, falling away as they scatter.
  return Math.max(8, 40 - (spread - q.length) * 4);
}

function score(item, q) {
  if (!q) return 0;
  const label = item.label.toLowerCase();

  if (label.startsWith(q)) return 100;
  if (label.includes(q)) return 70;

  // A win is labelled by its event, but people remember what was built. Search
  // the project name too — one tier down, so "hackniche" still beats "ecosort"
  // for the row that is literally called Hackniche.
  const alt = (item.alt || '').toLowerCase();
  if (alt && alt.startsWith(q)) return 90;
  if (alt && alt.includes(q)) return 60;

  const best = Math.max(subsequence(label, q), alt ? subsequence(alt, q) : -1);
  if (best >= 0) return best;

  return `${label} ${item.hint}`.toLowerCase().includes(q) ? 20 : -1;
}

export default function CommandBar() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef(null);
  const listRef = useRef(null);

  const hits = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return INDEX.slice(0, 9);
    return INDEX
      .map((it) => ({ it, s: score(it, query) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 9)
      .map((x) => x.it);
  }, [q]);

  const run = useCallback((item) => {
    if (!item) return;
    setOpen(false);
    setQ('');

    if (item.href) {
      window.open(item.href, item.href.startsWith('mailto:') ? '_self' : '_blank',
        'noopener,noreferrer');
      return;
    }

    // One scroll, straight to the destination. This used to scroll to the
    // section and then again to the card 620ms later; two overlapping smooth
    // scrolls cancel, and the page did not move at all.
    const card = item.focus
      ? document.querySelector(`[data-project="${item.focus}"]`)
      : null;

    scrollToEl(card ?? document.getElementById(item.target), {
      block: card ? 'center' : 'start',
      // Marked on arrival, not on the keystroke. The point of the highlight is
      // to answer "which one of these did I ask for" at the moment the reader
      // is looking at the list — starting it while the page is still travelling
      // spends most of it off-screen.
      onArrive: card ? () => {
        card.dataset.found = 'yes';
        window.setTimeout(() => { delete card.dataset.found; }, 2400);
      } : undefined,
    });
  }, []);

  // Cmd/Ctrl+K anywhere, Escape to close.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        setSel(0);
        return;
      }
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  // Matches the hamburger's threshold so the two appear on the same scroll.
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clamped during render rather than reset from an effect. The selection is
  // derived from the current result count, so a shrinking list can never leave
  // the highlight pointing past the end — and no second render is needed to
  // correct it.
  const cur = hits.length ? Math.min(sel, hits.length - 1) : 0;

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((cur + 1) % hits.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((cur - 1 + hits.length) % hits.length); }
    else if (e.key === 'Enter') { e.preventDefault(); run(hits[cur]); }
    else if (e.key === 'Tab' && hits[cur]) { e.preventDefault(); setQ(hits[cur].label.toLowerCase()); setSel(0); }
  };

  return (
    <>
      {/* The affordance. Nobody discovers Cmd+K on their own. */}
      <button
        type="button"
        className={`${styles.hint} ${shown || open ? styles.hintIn : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open command bar"
        data-cmdbar="trigger"
      >
        <span className={styles.prompt}>&gt;</span>
        <span className={styles.hintText}>Search</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </button>

      <div
        className={`${styles.wrap} ${open ? styles.wrapOpen : ''}`}
        hidden={!open}
        role="dialog"
        aria-label="Command bar"
      >
        {/* Click-away. A button, not a div, so it is reachable by keyboard. */}
        <button
          type="button"
          className={styles.veil}
          onClick={() => setOpen(false)}
          aria-label="Close command bar"
          tabIndex={-1}
        />

        <div className={styles.panel}>
          <div className={styles.inputRow}>
            <span className={styles.prompt} aria-hidden="true">&gt;</span>
            <input
              ref={input}
              className={styles.input}
              value={q}
              onChange={(e) => { setQ(e.target.value); setSel(0); }}
              onKeyDown={onKeyDown}
              placeholder="type a section, a project, or a hackathon…"
              aria-label="Search the site"
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <ul className={styles.list} ref={listRef} aria-live="polite">
            {hits.length === 0 ? (
              <li className={styles.empty}>
                no match — try
                {' '}
                <code>projects</code>
                ,
                {' '}
                <code>forge</code>
                {' '}
                or
                {' '}
                <code>contact</code>
              </li>
            ) : hits.map((it, i) => (
              <li key={it.id}>
                <button
                  type="button"
                  className={`${styles.row} ${i === cur ? styles.rowOn : ''}`}
                  onClick={() => run(it)}
                  onMouseEnter={() => setSel(i)}
                >
                  <span className={styles.kind}>{it.kind}</span>
                  <span className={styles.label}>{it.label}</span>
                  <span className={styles.hintCol}>{it.hint}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.foot}>
            <span><kbd>↑↓</kbd> move</span>
            <span><kbd>↵</kbd> go</span>
            <span><kbd>tab</kbd> complete</span>
            <span><kbd>esc</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  );
}
