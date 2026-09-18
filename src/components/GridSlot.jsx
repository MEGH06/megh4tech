import { useEffect, useRef, useState } from 'react';
import { DRIVER, DRIVER_ROLES } from '../data/driver';
import { asset } from '../lib/assets';
import styles from './GridSlot.module.css';

// Served from public/ as a plain URL rather than imported, so it streams as a
// static file instead of going through the bundle graph. 2.8 MB, re-encoded
// from the 36.8 MB original.
const HERO_VIDEO = asset('/hero-loop.mp4');
// The first frame, as a still. Shown until the video decodes, and it is the
// whole landing on a phone that refuses to play one — iOS blocks autoplay
// outright in Low Power Mode, and a black rectangle there reads as a broken
// page rather than as a video that did not start.
const HERO_POSTER = asset('/hero-poster.jpg');

/**
 * The landing.
 *
 * Everything sits in the bottom-left corner and the rest of the frame is left
 * to the car and the light — the composition is the empty space, not the
 * content. Name, three disciplines, then the season figures counting up.
 */
export default function GridSlot() {
  const video = useRef(null);
  // Whether the video is genuinely running. Until it is, the element stays
  // transparent and the still frame below it is the landing.
  const [playing, setPlaying] = useState(false);

  // iOS reads the muted ATTRIBUTE when it decides whether a video may
  // autoplay, and React writes only the property — so Safari saw a video it
  // considered unmuted and refused to start it. Set on the element itself,
  // then ask for playback and ask again on the first touch, which is a user
  // gesture and lifts the block where one is still in force.
  useEffect(() => {
    const el = video.current;
    if (!el) return undefined;

    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute('muted', '');

    // Resolves when playback actually begins; rejects when the browser
    // refuses. The `playing` event below covers a start we did not ask for.
    const start = () => {
      const p = el.play();
      if (p && p.then) {
        p.then(() => setPlaying(true)).catch(() => { /* the poster stands in */ });
      }
    };

    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    el.addEventListener('playing', on);
    el.addEventListener('pause', off);
    el.addEventListener('stalled', off);
    start();
    // Not `once`: in Low Power Mode the first touch can be refused too, and a
    // listener that has already spent itself never gets a second chance.
    window.addEventListener('touchstart', start, { passive: true });
    document.addEventListener('visibilitychange', start);

    return () => {
      el.removeEventListener('playing', on);
      el.removeEventListener('pause', off);
      el.removeEventListener('stalled', off);
      window.removeEventListener('touchstart', start);
      document.removeEventListener('visibilitychange', start);
    };
  }, []);

  return (
    <section className={styles.section} id="home">
      {/* Video and scrim masked together as one unit. Separately they each end
          at the section edge with their own hard line; the whole backdrop has
          to dissolve, or the landing reads as a block sitting on the page. */}
      <div className={styles.backdrop} aria-hidden="true">
        {/* Under the video, and the whole landing wherever it cannot play. */}
        <img className={styles.poster} src={HERO_POSTER} alt="" decoding="async" />
        <video
          className={`${styles.video} ${playing ? styles.videoOn : ''}`}
          ref={video}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disableRemotePlayback
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className={styles.scrim} />
      </div>

      {/* No canvas here. The car comes from the single fixed CarStage behind
          the whole document — the landing is just the first window onto it. */}

      {/* The corner. */}
      <div className={styles.content}>
        <div className={styles.wrap}>
          <h1 className={styles.name}>
            <span className={styles.first}>{DRIVER.first}</span>
            <span className={styles.last}>{DRIVER.last}</span>
          </h1>

          <ul className={styles.roles}>
            {DRIVER_ROLES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
