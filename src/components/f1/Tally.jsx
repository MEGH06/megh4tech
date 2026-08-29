import { useEffect, useMemo, useRef, useState } from 'react';

const prefersReduced = () =>
  typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Counts up to `value` once, when it first scrolls into view.
 *
 * Handles decimals (8.93) and suffixes (40+) by counting only the numeric
 * part and re-attaching whatever was around it, so one component covers every
 * figure on the site.
 *
 * Deliberately short — a tally longer than about three quarters of a second
 * stops reading as a count and starts reading as a delay.
 */
export default function Tally({ value, duration = 900, className }) {
  const text = String(value);

  /**
   * Parse once, and memoised.
   *
   * This used to be a bare `text.match(...)` with the resulting array listed in
   * the effect's dependencies. A RegExp match is a fresh object every render,
   * so the effect tore down and restarted on every single `setCounted` — which
   * happens every animation frame. The observer was rebuilt, the frame was
   * cancelled, and the count restarted from zero, forever. Every figure on the
   * site sat at roughly a tenth of its real value: 17 showed as 02, 8.96 as
   * 0.96, 40+ as 04+.
   *
   * Memoising on `text` makes it a stable reference, and the effect below now
   * depends only on primitives.
   */
  const parsed = useMemo(() => {
    const m = text.match(/^(\D*)([\d.]+)(.*)$/);
    if (!m) return null;
    return {
      prefix: m[1],
      target: parseFloat(m[2]),
      suffix: m[3],
      decimals: m[2].includes('.') ? m[2].split('.')[1].length : 0,
      // "09" has to land back on "09", not "9".
      width: m[2].split('.')[0].length,
    };
  }, [text]);

  const {
    prefix = '', target = 0, suffix = '', decimals = 0, width = 0,
  } = parsed ?? {};

  const [reduced] = useState(prefersReduced);
  const [counted, setCounted] = useState(0);
  const ref = useRef(null);
  const shown = reduced ? target : counted;

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !parsed) return undefined;

    let timer = 0;
    let start = 0;

    // A timer, not requestAnimationFrame.
    //
    // rAF is right for frame-synced motion and wrong here: this page runs two
    // WebGL canvases, and when they are slow rAF is throttled with them. On
    // software rendering the count reached 5 of 17 after two full seconds,
    // because only a couple of frames had fired. Elapsed time is read from the
    // clock either way, so a 40ms interval gives the same curve and cannot be
    // starved by the renderer.
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        start = performance.now();
        const step = () => {
          const t = Math.min((performance.now() - start) / duration, 1);
          // ease-out cubic: fast off the line, settles rather than stops
          setCounted((1 - (1 - t) ** 3) * target);
          if (t >= 1) clearInterval(timer);
        };
        timer = setInterval(step, 40);
        step();
      },
      { threshold: 0.5 },
    );

    io.observe(node);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
    // Primitives and one memoised object only — see the note above.
  }, [target, duration, reduced, parsed]);

  if (!parsed) return <span className={className}>{text}</span>;

  const body = shown
    .toFixed(decimals)
    .padStart(width + (decimals ? decimals + 1 : 0), '0');

  return (
    <span ref={ref} className={className}>
      {prefix}
      {body}
      {suffix}
    </span>
  );
}
