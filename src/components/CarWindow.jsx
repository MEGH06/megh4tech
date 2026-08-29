import useReveal from '../hooks/useReveal';
import styles from './CarWindow.module.css';

/**
 * A gap between sections that the fixed car canvas shows through.
 *
 * It draws no car of its own — the camera is one continuous flight behind the
 * whole document and this is a window onto it.
 *
 * It is now empty on purpose. It used to carry a readout panel naming part of
 * the stack, and a huge ghosted word behind the car. Both were removed for the
 * same reason: they named no fact the page did not already state better
 * elsewhere, and they lay across the bodywork the gap exists to reveal. The
 * height has not changed, so the rhythm between sections is the same — the
 * space is simply doing its actual job now, which is showing the car.
 *
 * All that is left is a diagonal shaft on the shared rake. Decorative, so the
 * section is `aria-hidden` and carries no label.
 */
export default function CarWindow({ height = 'tall', align = 'left' }) {
  const reveal = useReveal({ threshold: 0.25 });

  return (
    <section
      className={`${styles.window} ${styles[height]} ${styles[align]}`}
      ref={reveal}
      data-reveal
      aria-hidden="true"
    >
      {/* Nothing but the shaft. The ghosted word that used to sit here was
          invented decoration — it named no fact and lay across the bodywork
          the gap exists to reveal. Emptiness is what the gap is for. */}
      <span className={styles.shaft} />
    </section>
  );
}
