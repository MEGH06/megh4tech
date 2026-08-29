import { useEffect, useRef } from 'react';

/**
 * Reveal-on-enter, once.
 *
 * One IntersectionObserver per element rather than a scroll handler doing
 * getBoundingClientRect on everything: the observer is off the main thread and
 * costs nothing while the section is out of view.
 *
 * The element starts hidden via CSS (`[data-reveal]`), and this only flips a
 * data attribute — the animation itself is a transform/opacity transition in
 * CSS, so it stays on the compositor. Under `prefers-reduced-motion` the
 * element is revealed immediately and never transitions.
 */
export default function useReveal({ threshold = 0.18, once = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced || !('IntersectionObserver' in window)) {
      node.dataset.reveal = 'in';
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            node.dataset.reveal = 'in';
            if (once) io.disconnect();
          } else if (!once) {
            node.dataset.reveal = 'out';
          }
        });
      },
      { threshold },
    );

    io.observe(node);

    // Failsafe. The hidden state is `opacity: 0` — plus, on the heading, a
    // clip-path that crops it to nothing — so if the observer never fires the
    // content is not merely un-animated, it is invisible, and nothing in the
    // console says why.
    //
    // It can genuinely fail to fire: an element taller than the viewport can
    // never reach a high threshold, and a section inside a scroll container or
    // a display:none ancestor never intersects at all. A decorative reveal must
    // not be able to permanently hide real content.
    //
    // But it has to rescue only what SHOULD be on screen. This used to reveal
    // every element unconditionally 1.2s after mount, which meant every section
    // below the fold was already revealed before it was ever scrolled to — with
    // a ~2s intro veil in front, nothing past the first screen had an entrance
    // animation at all. The reveal system was inert and the page simply
    // assembled itself while nobody was looking.
    //
    // So: check the geometry, and keep checking. A section far below the fold
    // has not failed to reveal, it just has not been reached — leave it to the
    // observer. One that is on screen and still hidden is a real failure and is
    // rescued. The interval stops the moment it is revealed, so a settled page
    // costs nothing.
    const failsafe = setInterval(() => {
      if (node.dataset.reveal === 'in') {
        clearInterval(failsafe);
        return;
      }
      const r = node.getBoundingClientRect();
      const onScreen = r.top < window.innerHeight && r.bottom > 0;
      if (onScreen) {
        node.dataset.reveal = 'in';
        clearInterval(failsafe);
      }
    }, 1200);

    return () => {
      clearInterval(failsafe);
      io.disconnect();
    };
  }, [threshold, once]);

  return ref;
}
