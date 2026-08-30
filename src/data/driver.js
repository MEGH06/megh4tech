import { RESULTS, GUIDED } from './results.js';
import { LADDER } from './education.js';

/**
 * The driver.
 *
 * An F1 driver page is a fixed form: name broken across lines at display
 * size, nationality, discipline, a technical panel, then a season strip.
 * The form is what makes someone read as a driver — but every field in it
 * here is a real fact off Megh's own site or his own account.
 *
 * Nothing invented. No team name, no car number, no "status" — those were
 * fabricated framing and have been removed. If a field cannot be filled from
 * something true, it does not exist.
 */

export const DRIVER = {
  first: 'Megh',
  last: 'Dave',
  base: 'Mumbai, India',
  // Replaces "Innovating practical, scalable solutions that make technology
  // work effortlessly in the real world" — his line from the previous site,
  // and the most generic sentence on this one. It describes every portfolio
  // ever published, so it distinguishes nothing and a reader skips it. This
  // says the same thing in words that could only be about him.
  blurb: 'I build across the stack.',
};

/** The three disciplines, as tags. */
export const DRIVER_ROLES = [
  'AI / ML Engineer',
  'Full Stack Engineer',
  'Researcher',
  'Systems Builder',
];

/**
 * The overview, carried over word for word from the previous site.
 *
 * This is the only place on the page that says in plain language what he does
 * and how he works — everything else is tables and marks. It was missing from
 * the rebuild entirely, which left the site impressive and uninformative.
 */
export const BIO = [
  'I am pursuing a B.Tech in Computer Science and Engineering with a '
  + 'specialisation in Data Science at D.J. Sanghvi College of Engineering, '
  + 'along with an Honours in Computational Finance. My work sits at the '
  + 'intersection of AI, software engineering and research.',

  'I have built machine-learning systems, generative AI applications, RAG '
  + 'pipelines, multi-agent systems, computer vision projects, financial '
  + 'models and research tools — and the engineering around them: backend '
  + 'services, APIs, authentication, data schemas, databases, cloud services, '
  + 'Docker, Terraform and deployment. I work on the product side too, on '
  + 'application design, UX and the interfaces people actually use.',

  'Research is a large part of it. I completed a project at IIT Bombay on '
  + 'Physics-Informed Neural Networks and temporal modelling, my ConvNeXt work '
  + 'has been presented, and I am currently researching federated learning and '
  + 'writing a paper on it.',

  'A lot of the rest has come from hackathons — taking an idea and getting it '
  + 'working under a hard deadline. That has run through autonomous software '
  + 'engineering, legal AI, fintech, cybersecurity, multimodal retrieval, '
  + 'computer vision and financial risk.',

  'I like difficult problems, learning whatever the problem needs, and '
  + 'understanding a system from the idea all the way to the thing that runs.',
];

const pad = (n) => String(n).padStart(2, '0');
const wins = RESULTS.filter((r) => r.result === 'Winner').length;
const current = LADDER.find((r) => r.current);

/**
 * Four figures, every one derived rather than restated.
 *
 * These used to be hardcoded strings, which is precisely how the site ended up
 * claiming nine wins while the results table listed a different number and the
 * resume said six. Now there is one place to change each fact.
 */
export const DRIVER_STATS = [
  { value: pad(wins), label: 'Hackathons won' },
  { value: current?.score ?? '—', label: current?.unit ?? 'CGPA' },
  { value: GUIDED, label: 'People guided' },
];

/** The technical panel. Every row traceable to the existing site. */
export const DRIVER_SPEC = [
  { k: 'Discipline', v: 'AI / ML Engineer' },
  { k: 'Based', v: 'Mumbai, India' },
  { k: 'Reading', v: 'B.Tech CSE — Data Science, D.J. Sanghvi' },
  { k: 'Research', v: 'Physics-Informed Neural Networks' },
  { k: 'Currently', v: 'Research Intern, IIT Bombay', live: true },
];
