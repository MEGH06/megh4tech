/**
 * Contact — the pit board.
 *
 * Carried over from the previous site. One deliberate change: the old form
 * showed "Message Sent!" for 1.5 seconds and *then* opened a mailto: link, so
 * it claimed success before anything had been sent — and sent nothing at all
 * if the visitor had no mail client configured. That is a trust break on the
 * one control that matters, so until there is a real endpoint the page offers
 * direct routes it can actually honour.
 */

export const CONTACT = {
  email: 'meghdave2006@gmail.com',
  phone: '+91 9222056520',
  base: 'Mumbai, India',
  github: 'https://github.com/MEGH06',
  linkedin: 'https://www.linkedin.com/in/megh-dave-4a2227314/',
  medium: 'https://medium.com/@meghdave2006',
};

/** What he takes on. Straight from the old contact form's service list. */
export const SERVICES = [
  'AI / ML Solutions',
  'Smart Application Integration',
  'Chatbot Integration',
  'Website Revamp',
  'Data Analysis',
];

/**
 * Resume was withdrawn deliberately: a document that changes per company
 * should not be frozen as a public PDF, and a stale one actively hurts. The
 * line below keeps it a redirect rather than a dead end.
 */
export const RESUME_NOTE = 'Resume on request.';

/**
 * The public profiles, as marks.
 *
 * GitHub and LinkedIn are the two things a client actually checks before
 * replying, so they lead. Handles are shown as well as names — a visitor
 * scanning for "is this a real person with real repos" gets the answer without
 * clicking.
 *
 * Paths are single-path simple-icons glyphs, inlined rather than pulled from a
 * font or an icon package: three shapes do not justify a dependency, and an
 * icon font would be another blocking request on the critical path.
 */
export const SOCIALS = [
  {
    id: 'github',
    name: 'GitHub',
    handle: '@MEGH06',
    href: CONTACT.github,
    path: 'M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.9 18.3 5.2 18.3 5.2c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'megh-dave',
    href: CONTACT.linkedin,
    path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z',
  },
  {
    id: 'medium',
    name: 'Medium',
    handle: '@meghdave2006',
    href: CONTACT.medium,
    path: 'M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12ZM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12Z',
  },
];
