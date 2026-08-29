import { useState } from 'react';
import { CONTACT, SERVICES } from '../data/contact';
import styles from './Enquiry.module.css';

/**
 * The enquiry form.
 *
 * Composes a mail rather than posting anywhere. That is a deliberate choice,
 * not a shortcut: the site is a static Space with no backend, so any endpoint
 * means a third party. The forms.space embed that used to sit here is blocked
 * by Cloudflare Turnstile and rendered an apology for a form that never
 * arrived — worse than no form at all, in the one place a visitor is trying
 * to act.
 *
 * A mail compose is honest. It opens the visitor's own client with everything
 * already written, they press send, and it lands in Megh's inbox — no relay,
 * nothing to configure, nothing that can silently drop a lead. The trade is
 * that it leaves the page, which is why the fields are few and the direct
 * address is shown right beside it for anyone who would rather just write.
 *
 * The fields are the ones that make a first reply useful: who, what kind of
 * work, roughly what budget. Asking more loses people at exactly the moment
 * they were willing.
 */
export default function Enquiry() {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [need, setNeed] = useState(SERVICES[0] ?? '');
  const [budget, setBudget] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const ready = name.trim() && from.trim();

  const send = (e) => {
    e.preventDefault();
    if (!ready) return;
    const body = [
      `Name: ${name.trim()}`,
      `Reply to: ${from.trim()}`,
      `Looking for: ${need}`,
      budget.trim() ? `Budget: ${budget.trim()}` : null,
      '',
      note.trim() || '(no details yet)',
      '',
      '— sent from megh4tech',
    ].filter((l) => l !== null).join('\n');

    window.location.href = `mailto:${CONTACT.email}`
      + `?subject=${encodeURIComponent(`Enquiry — ${need}`)}`
      + `&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form className={styles.form} onSubmit={send}>
      <h3 className={styles.title}>Start a project</h3>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Your name</span>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            className={styles.input}
            type="email"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>What you need</span>
          <select
            className={styles.input}
            value={need}
            onChange={(e) => setNeed(e.target.value)}
          >
            {SERVICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="Something else">Something else</option>
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Budget <i>optional</i></span>
          <input
            className={styles.input}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="₹1,00,000  ·  $2,500  ·  not sure yet"
          />
        </label>
      </div>

      <label className={`${styles.field} ${styles.wide}`}>
        <span className={styles.label}>What are you building?</span>
        <textarea
          className={`${styles.input} ${styles.area}`}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <div className={styles.foot}>
        <button type="submit" className={styles.send} disabled={!ready}>
          Send enquiry
        </button>
        <p className={styles.aside}>
          {sent
            ? 'Your mail app should be open with it written — just press send.'
            : <>Opens your mail app, pre-written. Or write to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> directly.</>}
        </p>
      </div>
    </form>
  );
}
