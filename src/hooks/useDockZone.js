import { useEffect, useId, useRef } from 'react';
import { claimDock, releaseDock } from '../three/dock';

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

    // On a phone there is no room to sit beside anything. The car is parked
    // small in a corner for the whole page instead of tracking each section.
    const narrow = window.matchMedia('(max-width: 900px)').matches;

    const spec = {
      node,
      x: narrow ? 0.62 : x,
      y: narrow ? 0.52 : y,
      scale: narrow ? 0.3 : scale,
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
