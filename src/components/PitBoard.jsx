import useReveal from '../hooks/useReveal';
import useDockZone from '../hooks/useDockZone';
import { CONTACT, SERVICES, RESUME_NOTE, SOCIALS } from '../data/contact';
import Enquiry from './Enquiry';
import styles from './PitBoard.module.css';

/**
 * Contact, as a pit board.
 *
 * Real routes only. The old form claimed "Message Sent!" a second and a half
 * before it opened a mailto:, and sent nothing at all if the visitor had no
 * mail client — a trust break on the one control that has to work. Until there
 * is an endpoint behind it, this offers links that genuinely go somewhere.
 *
 * Column `e`, not `b`. `b` is the widest at 54% and spanned 3-57%, while the
 * car docked right reached back to 39% — an 18% overlap, on the one section
 * where a reader is actually trying to act. Narrow and flush instead.
 */
export default function PitBoard() {
  const reveal = useReveal({ threshold: 0.12 });
  const dockRef = useDockZone({ x: 0, y: 0, scale: 1 });

  return (
    <section
      id="contact"
      className={styles.section}
      ref={dockRef}
    >
      <div className={`${styles.wrap} col`} ref={reveal} data-reveal>
        <header className={styles.head}>
          <h2 className={styles.title}>Get In Touch</h2>
        </header>

        <p className={styles.lede}>
          Open to freelance work and research collaboration.
        </p>

        <ul className={styles.routes}>
          <li data-step="1">
            <span className={styles.k}>Email</span>
            <a className={styles.v} href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
          </li>
          <li data-step="2">
            <span className={styles.k}>Phone</span>
            <a
              className={styles.v}
              href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
            >
              {CONTACT.phone}
            </a>
          </li>
          <li data-step="3">
            <span className={styles.k}>Location</span>
            <span className={styles.v}>{CONTACT.base}</span>
          </li>
        </ul>

        <h3 className={styles.sub}>Available For</h3>
        <ul className={styles.services}>
          {SERVICES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        {/* GitHub and LinkedIn are the proof, and they were three grey words
            in a footer — the least prominent thing on a page whose job is
            getting hired. Marks, at a size someone clicks. */}
        <ul className={styles.socials}>
          {SOCIALS.map((s, i) => (
            <li key={s.id} data-step={Math.min(6, i + 1)}>
              <a
                className={styles.social}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.socialIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </span>
                <span className={styles.socialText}>
                  <span className={styles.socialName}>{s.name}</span>
                  <span className={styles.socialHandle}>{s.handle}</span>
                </span>
                <span className={styles.socialGo} aria-hidden="true">&#8599;</span>
              </a>
            </li>
          ))}
        </ul>

        <Enquiry />

        <p className={styles.resume}>{RESUME_NOTE}</p>

        <p className={styles.colophon}>
          {`© ${new Date().getFullYear()} Megh Dave`}
        </p>
      </div>
    </section>
  );
}
