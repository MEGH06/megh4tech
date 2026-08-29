/**
 * Scroll the page to an element.
 *
 * `el.scrollIntoView()` does not work on this page, and each reason was
 * measured rather than guessed at:
 *
 * 1. **It picks the wrong scroller.** `scrollIntoView` walks up for the nearest
 *    scrollable ancestor, and `body { overflow: hidden auto }` — which the page
 *    needs to kill horizontal overflow on phones — looks like one while being
 *    unable to scroll, because that overflow propagates to the viewport.
 *    `window.scrollTo` with an absolute offset skips the walk entirely.
 *
 * 2. **Scroll anchoring cancels it.** Any anchoring adjustment aborts an
 *    in-flight smooth scroll, and this page resizes content above the fold
 *    constantly. A 9,460px jump died at 6,566, and often at 0. `base.css` sets
 *    `overflow-anchor: none` for that reason; it is load-bearing, not cosmetic.
 *
 * 3. **It has to run after React commits.** Every caller closes an overlay in
 *    the same handler that scrolls, and the nav sheet holds
 *    `body.overflow: hidden` until its effect cleanup. Scroll too early and the
 *    scroll is dropped against a locked body, or the commit's layout change
 *    kills it — a 60ms timer left the page motionless, where two frames landed
 *    on target.
 *
 * 4. **Where it lands has to be checked, more than once.** With anchoring off,
 *    content that resizes mid-flight shifts the destination out from under the
 *    scroll and nothing puts it back — on a phone, two of nine sections settled
 *    83px and 228px off. Worse right after load, where fonts and media are
 *    still arriving: one jump aimed at a page 728px shorter than the one it
 *    landed on, leaving a card 495px above the fold. So the target is
 *    re-measured on arrival and re-scrolled until it stops moving.
 */

/** How still, in frames, counts as stopped. */
const STILL_FRAMES = 3;
/** Give up watching a scroll that never settles — a hand on the page. */
const SETTLE_CEILING = 4000;
/** Landing within this many pixels is aligned; past it, scroll again. */
const SLACK = 8;
/**
 * How many corrections before giving up.
 *
 * Each one only happens when the page has actually moved the destination, so a
 * settled page pays nothing for this. Two, not more: each correction is another
 * visible scroll, and a page that is still wrong after two is moving
 * continuously — at which point more scrolls read as the page hunting for its
 * own content, which is worse than landing slightly high.
 */
const MAX_CORRECTIONS = 2;

export function scrollToEl(el, { block = 'start', onArrive } = {}) {
  if (!el) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** The absolute scroll position that puts `el` where it was asked to go. */
  const target = () => {
    const r = el.getBoundingClientRect();
    const top = block === 'center'
      ? window.scrollY + r.top - Math.max(0, (window.innerHeight - r.height) / 2)
      : window.scrollY + r.top;
    return Math.max(0, Math.round(top));
  };

  /**
   * Call back once the page has stopped moving.
   *
   * There is no completion event for a smooth scroll. Watching the position
   * settle beats any fixed duration in both directions — a short hop finishes
   * long before a timer would, and a full-page jump on a slow device is still
   * travelling after it.
   */
  const settle = (done) => {
    let last = window.scrollY;
    let still = 0;
    const t0 = performance.now();
    const check = () => {
      if (window.scrollY === last) still += 1;
      else { still = 0; last = window.scrollY; }
      if (still >= STILL_FRAMES || performance.now() - t0 > SETTLE_CEILING) done();
      else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  };

  const go = (attempt) => {
    // Clear any inline scroll lock first. Overlays covering the viewport set
    // `body.overflow: hidden` and release it from an effect cleanup, which runs
    // a render later than this. Being asked to navigate means the overlay is on
    // its way out, so the lock is stale; its cleanup restores the same value.
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }

    window.scrollTo({
      top: target(),
      behavior: reduce ? 'instant' : 'smooth',
    });

    settle(() => {
      // Converge, bounded. Bounded because a page that never stops moving would
      // otherwise scroll forever; converging because a single correction is not
      // enough while fonts and images are still landing.
      if (attempt < MAX_CORRECTIONS
          && Math.abs(target() - window.scrollY) > SLACK) {
        go(attempt + 1);
        return;
      }
      if (onArrive) onArrive();
    });
  };

  // Two frames, and frames rather than a timer — see (3) above.
  requestAnimationFrame(() => requestAnimationFrame(() => go(0)));
}
