import { useEffect, useRef } from 'react';

/**
 * Document scroll progress, 0..1, in a ref.
 *
 * Deliberately a ref and not state: this updates on every scroll frame, and
 * putting it in state would re-render the whole tree sixty times a second.
 * The consumer reads `ref.current` inside useFrame instead.
 *
 * `onChange` fires after each update so a canvas on `frameloop="demand"` can
 * invalidate itself — otherwise the camera would only move when something else
 * happened to trigger a draw.
 *
 * ## Measured synchronously, not in requestAnimationFrame
 *
 * This used to schedule the measurement with rAF behind a `ticking` flag. Two
 * things were wrong with that, and both showed up on the page.
 *
 * rAF is throttled by whatever else is drawing, and this page runs a WebGL
 * canvas — so the value lagged the actual scroll position.
 *
 * Far worse, the flag latched. If the rAF callback did not fire — and it will
 * not while the tab is hidden, and can be starved when the renderer is busy —
 * `ticking` stayed true and every subsequent scroll event returned early. Scroll
 * tracking then stopped for the life of the page. Measured: `--stage-in` froze
 * at 0.444 and never reached 1, so the car never finished fading in after the
 * landing video, and the camera stopped following the page from that point on.
 *
 * Reading the position is two cheap property reads, so it happens inline. The
 * browser already coalesces scroll events to one per frame; there is nothing
 * for rAF to save here, and a correctness path should not depend on a callback
 * that is allowed not to run.
 *
 * `scrollHeight` is the one expensive read (it forces layout), so it is cached
 * and only recomputed on resize — and on the first few scrolls, because lazy
 * images and the 3D chunk change the document height after mount.
 */
export default function useScrollProgress(onChange) {
  const progress = useRef(0);
  const cb = useRef(onChange);

  // Assigned in an effect, not during render — writing a ref while rendering is
  // a tearing hazard under concurrent rendering.
  useEffect(() => {
    cb.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let span = 0;
    let settled = 0;

    const remeasure = () => {
      span = document.documentElement.scrollHeight - window.innerHeight;
    };

    const update = () => {
      // The document keeps growing for a moment after mount as fonts land and
      // the 3D chunk arrives; re-read the height until it stops changing.
      if (settled < 12) {
        const before = span;
        remeasure();
        if (span === before) settled += 1;
        else settled = 0;
      }
      progress.current = span > 0
        ? Math.min(1, Math.max(0, window.scrollY / span))
        : 0;
      cb.current?.(progress.current);
    };

    const onResize = () => {
      settled = 0;
      remeasure();
      update();
    };

    remeasure();
    update();

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    // Height changes that are not resizes: images loading, sections revealing.
    const ro = new ResizeObserver(onResize);
    ro.observe(document.documentElement);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, []);

  return progress;
}
