import { useEffect, useId, useRef } from 'react';
import { claimDock, releaseDock } from '../three/dock';
import { isNarrow } from '../lib/narrow';

/**
 * Marks a section as claiming a dock while it is on screen.
 *
 * Attach the returned ref to the section. While it is visible the car slides
 * to the opposite side and shrinks; when it leaves, the car returns to centre
 * and full size.
 *
 * `x` is where the CAR goes, not the content: a section whose text sits on the
 * left claims `x: +0.6` to push the car right.
 *
 * The observer is only a gate — it registers and unregisters the node. How
 * strongly the section is docked is measured in `dock.js` from the node's own
 * rect, because `intersectionRatio` is the fraction of the *element* that is
 * visible and therefore caps out around 0.3 on any section taller than the
 * viewport. Projects and Achievements are both taller than the viewport, and
 * both used to fail to dock at all for that reason.
 *
 * `rootMargin` registers the node slightly before it enters so the first
 * measurement happens ahead of the section arriving, not a frame late.
 */
export default function useDockZone({ x = 0.6, y = 0, scale = 0.42 } = {}) {
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // On a phone there is no room to sit beside anything, so every section
    // docks the way a full-width desktop section does: centred, full size.
    // The car used to be parked small in a corner for the whole page, which
    // meant it never had a full-frame moment even in the gaps. Now only
    // `hold` changes — it dims the car behind the text and slows the lap,
    // and falls to zero as a car window takes the screen.
    const narrow = isNarrow();

    const spec = {
      node,
      x: narrow ? 0 : x,
      y: narrow ? 0 : y,
      scale: narrow ? 1 : scale,
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) claimDock(id, spec);
        else releaseDock(id);
      },
      { rootMargin: '15% 0px' },
    );

    io.observe(node);
    return () => {
      io.disconnect();
      releaseDock(id);
    };
  }, [id, x, y, scale]);

  return ref;
}
