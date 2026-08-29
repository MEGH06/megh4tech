import useReveal from '../hooks/useReveal';
import useDockZone from '../hooks/useDockZone';
import { ROLES, PADDOCK_PHOTO } from '../data/paddock';
import styles from './Paddock.module.css';

/**
 * The Paddock — roles, as distinct from results.
 *
 * Absorbs the old Experience section. Judging, mentoring and teaching do not
 * fit a job-history list, but they are among the most credible things on the
 * CV: being asked to judge a hackathon is a stronger signal than entering one.
 */
export default function Paddock() {
  const reveal = useReveal({ threshold: 0.1 });
  const photo = PADDOCK_PHOTO;
  // Back to the left, but a narrower column and the car lifted as well as
  // pushed — three lefts in a row would be the pattern this is avoiding.
  const dockRef = useDockZone({ x: -0.46, y: -0.06, scale: 0.64 });

  return (
    <section
      id="paddock"
      className={styles.section}
      data-side="right"
      data-col="a"
      ref={dockRef}
    >
      <div className={`${styles.wrap} col`} ref={reveal} data-reveal>
        <header className={styles.head}>
          <h2 className={styles.title}>Experience</h2>
        </header>

        <ul className={styles.roles}>
          {ROLES.map((role, i) => (
            <li
              key={role.id}
              className={styles.role}
              data-step={Math.min(6, i + 1)}
            >
              <span className={styles.kind}>{role.kind}</span>

              <div className={styles.body}>
                <h3 className={styles.roleTitle}>
                  {role.title}
                  {role.org ? (
                    <span className={styles.org}> · {role.org}</span>
                  ) : null}
                </h3>
                {role.period ? (
                  <span className={styles.period}>{role.period}</span>
                ) : null}

                <p className={styles.detail}>{role.detail}</p>

                {role.skills?.length ? (
                  <ul className={styles.skills}>
                    {role.skills.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : null}

              </div>
            </li>
          ))}
        </ul>

        {/* Nothing at all until a real photograph exists.
            This used to render a dashed empty box captioned "Photograph —
            needs photo file", which is a note-to-self shown to visitors: it
            reads as a broken image and makes a finished section look
            unfinished. Set `src` in PADDOCK_PHOTO and the figure returns. */}
        {photo.src ? (
          <figure className={styles.figure}>
            <img
              className={styles.photo}
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
            />
            {photo.caption ? (
              <figcaption className={styles.caption}>{photo.caption}</figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </section>
  );
}
