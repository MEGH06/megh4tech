import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { createLayout } from 'animejs/layout';
import { asset } from '../lib/assets';
import Cascade from './Cascade';
import useReveal from '../hooks/useReveal';
import useDockZone from '../hooks/useDockZone';
import { PROJECTS } from '../data/projects';
import styles from './TimingTower.module.css';

/**
 * Projects as case studies.
 *
 * Each row used to be a title, a sentence and a stack list. A client reading
 * that learns what the thing is and nothing about whether Megh can solve their
 * problem — no statement of what was hard, no statement of what he did, and no
 * measurable outcome.
 *
 * Two audiences, one layout. Collapsed, a row shows the one-liner and the
 * result, because most people are skimming and the result is the only line
 * that actually argues for him. Expanded, it gives problem, role, approach —
 * the reasoning, for someone who has decided to care.
 *
 * Ordered by strength rather than date, so the first card is the best card.
 *
 * Rows with no case study yet simply render the one-liner. Inventing a problem
 * statement or an outcome to fill the layout would be worse than an honest gap.
 */

const ROWS = [...PROJECTS].sort((a, b) => a.pos - b.pos);

/**
 * How many show before the fold.
 *
 * A portfolio grows, and a section that simply gets longer every time a
 * project is added stops being a showcase and becomes a list — the eighth
 * entry gets the same weight as the first, and nobody reaches it anyway.
 * Four lead. The rest are one click away and clearly counted, so a visitor
 * knows there is more without having to scroll past it to find out.
 */
const LEAD = 4;

/**
 * Animate the layout change a state update causes.
 *
 * Both toggles in this section used to snap: "View all" swapped four cards for
 * nine in a single frame, and the case study appeared at full height with no
 * transition. Neither is animatable in CSS, because both change the height of
 * a list to a value nothing knows in advance — `height: auto` is not a
 * tweenable value, and the cards below have to travel by whatever amount the
 * one above grew.
 *
 * anime.js does FLIP: measure every child, apply the mutation, measure again,
 * then animate the difference away. `flushSync` is the load-bearing part —
 * `update()` expects the callback to change the DOM synchronously so it can
 * take the second measurement, and a bare `setState` would only queue a render
 * for later, leaving it measuring a DOM that had not changed yet.
 *
 * Returns a plain runner when there is no layout instance (reduced motion, or
 * before the effect has run), so the toggles always work.
 */
function useLayoutTransition(rootRef) {
  const layout = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    layout.current = createLayout(root, {
      children: 'li',
      duration: 480,
      ease: 'outQuart',
      // Declared, not defaulted. Measured in isolation: with the default set,
      // opening a card animated nothing — the cards below it jumped to their
      // new position, which is the whole thing this was added to fix. Naming
      // the properties turns on the position tracking that makes a size change
      // in one row move the rows under it.
      properties: ['x', 'y', 'width', 'height', 'opacity'],
      // Cards arriving and leaving fade rather than fly: nine rows sliding in
      // from nowhere is a lot of motion for a click on "view all".
      enterFrom: { opacity: 0, duration: 320 },
      leaveTo: { opacity: 0, duration: 200 },
    });

    return () => {
      layout.current?.revert();
      layout.current = null;
    };
  }, [rootRef]);

  return useCallback((mutate) => {
    const l = layout.current;
    if (!l) { mutate(); return; }
    l.update(() => flushSync(mutate));
  }, []);
}

function Project({ p, step, transition }) {
  const [open, setOpen] = useState(false);
  const study = Boolean(p.problem);

  return (
    <li
      className={p.featured ? styles.front : undefined}
      data-step={step}
      // The command bar scrolls to a card by id and marks it.
      data-project={p.id}
      // Drives the two-column layout below. Only cards with a screenshot get
      // the image track, so the ones without do not sit in a short column.
      data-shot={p.shot ? 'yes' : undefined}
    >
      {/* Rendered only when a file exists. A card with no screenshot shows
          none, rather than a broken image or a grey placeholder box. */}
      {p.shot ? (
        <a
          className={styles.shotWrap}
          href={p.demo || p.code || undefined}
          target={p.demo || p.code ? '_blank' : undefined}
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            className={styles.shot}
            src={asset(p.shot)}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.closest('a').style.display = 'none'; }}
          />
        </a>
      ) : null}

      <div className={styles.body}>
        <div className={styles.headRow}>
          <h3 className={styles.name}>{p.title}</h3>
          {p.field ? <span className={styles.field}>{p.field}</span> : null}
        </div>

        <p className={styles.blurb}>{p.blurb}</p>

        {/* The line that does the arguing, so it stays visible collapsed. */}
        {p.result ? (
          <p className={styles.result}>
            <span className={styles.resultKey}>Result</span>
            {p.result}
          </p>
        ) : null}

        {study ? (
          <>
            <button
              type="button"
              className={styles.more}
              onClick={() => transition(() => setOpen((v) => !v))}
              aria-expanded={open}
              aria-controls={`study-${p.id}`}
            >
              {open ? 'Less' : 'How it was built'}
            </button>

            <dl className={styles.study} id={`study-${p.id}`} hidden={!open}>
              <dt>Problem</dt>
              <dd>{p.problem}</dd>
              {p.role ? (
                <>
                  <dt>My role</dt>
                  <dd>{p.role}</dd>
                </>
              ) : null}
              <dt>Approach</dt>
              <dd>{p.built}</dd>
            </dl>
          </>
        ) : null}

        {/* The one move. Equilibrium is the only project whose subject is
            itself a picture, so it gets the picture. */}
        {p.id === 'equilibrium' ? <Cascade /> : null}

        <ul className={styles.stack}>
          {p.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <div className={styles.links}>
          {p.code ? (
            <a
              href={p.code}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Source
            </a>
          ) : null}
          {p.demo ? (
            <a
              href={p.demo}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.link} ${styles.live}`}
            >
              Live
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function TimingTower() {
  const [showAll, setShowAll] = useState(false);
  const rowsRef = useRef(null);
  const transition = useLayoutTransition(rowsRef);
  const reveal = useReveal({ threshold: 0.08 });
  // Content left, car right. `x` is where the CAR goes.
  const dockRef = useDockZone({ x: 0, y: 0, scale: 1 });

  return (
    <section
      id="projects"
      className={styles.section}
      ref={dockRef}
    >
      <div className={`${styles.wrap} col`} ref={reveal} data-reveal>
        <header className={styles.head}>
          <h2 className={styles.title}>Projects</h2>
        </header>

        <ol className={styles.rows} ref={rowsRef}>
          {(showAll ? ROWS : ROWS.slice(0, LEAD)).map((p, i) => (
            <Project
              key={p.id}
              p={p}
              step={Math.min(6, i + 1)}
              transition={transition}
            />
          ))}
        </ol>

        {ROWS.length > LEAD ? (
          <button
            type="button"
            className={styles.viewAll}
            onClick={() => transition(() => setShowAll((v) => !v))}
            aria-expanded={showAll}
          >
            {showAll
              ? 'Show less'
              : `View all ${ROWS.length} projects`}
          </button>
        ) : null}
      </div>
    </section>
  );
}
