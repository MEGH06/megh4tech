/**
 * Print every piece of content on the site as plain text.
 *
 *   node tools/dump-content.mjs            > content.txt
 *   node tools/dump-content.mjs --gaps     # only the things that are missing
 *
 * Reads the real modules the site renders from, so it cannot drift out of
 * date the way a hand-written inventory would. Anything marked GAP is a field
 * the site has a place for and no value in — those are the things worth
 * filling before anyone else reads the page.
 */
import { DRIVER, DRIVER_ROLES, BIO } from '../src/data/driver.js';
import { LADDER } from '../src/data/education.js';
import { RESULTS, SUMMARY, GUIDED, UNLISTED_WINS } from '../src/data/results.js';
import { ROLES, PADDOCK_PHOTO } from '../src/data/paddock.js';
import { PROJECTS } from '../src/data/projects.js';
import { RESEARCH } from '../src/data/programmes.js';
import { GROUPS } from '../src/data/skills.js';
import { CONTACT, SERVICES, RESUME_NOTE, SOCIALS } from '../src/data/contact.js';

const gapsOnly = process.argv.includes('--gaps');
const gaps = [];
const out = [];

const say = (s = '') => { if (!gapsOnly) out.push(s); };
const rule = (t) => { say(''); say('='.repeat(74)); say(t.toUpperCase()); say('='.repeat(74)); };
const sub = (t) => { say(''); say(`-- ${t} ${'-'.repeat(Math.max(0, 68 - t.length))}`); };

/** Print a field, and record it as a gap when it has no value. */
const f = (label, value, where) => {
  const empty = value === null || value === undefined || value === ''
    || (Array.isArray(value) && value.length === 0);
  if (empty) {
    gaps.push(`${where} -> ${label}`);
    say(`  ${label.padEnd(14)} GAP - nothing set`);
    return;
  }
  const text = Array.isArray(value) ? value.join(' · ') : String(value);
  const [first, ...rest] = text.match(/.{1,74}(\s|$)/g) || [text];
  say(`  ${label.padEnd(14)} ${first.trim()}`);
  rest.forEach((line) => say(`  ${' '.repeat(14)} ${line.trim()}`));
};

// ---------------------------------------------------------------- identity
rule('01 · identity');
f('Name', `${DRIVER.first} ${DRIVER.last}`, 'driver');
f('Based', DRIVER.base, 'driver');
f('Tagline', DRIVER.blurb, 'driver');
f('Role tags', DRIVER_ROLES, 'driver');
sub('Bio paragraphs');
BIO.forEach((p, i) => f(`Para ${i + 1}`, p, 'driver.BIO'));

// --------------------------------------------------------------- education
rule('02 · education');
LADDER.forEach((r) => {
  sub(r.institution || 'UNNAMED');
  f('Qualification', r.qualification, `education/${r.institution}`);
  f('Years', r.season, `education/${r.institution}`);
  f('Score', r.score ? `${r.score}${r.unit || ''}` : null, `education/${r.institution}`);
  f('Current', r.current ? 'yes' : 'no', `education/${r.institution}`);
});

// ------------------------------------------------------------ achievements
rule('03 · achievements');
say(`  Headline: ${SUMMARY.map((s) => `${s.value} ${s.label}`).join('  |  ')}`);
say(`  People guided: ${GUIDED}`);
say(`  Wins claimed but not written up: ${UNLISTED_WINS}`);
if (UNLISTED_WINS > 0) {
  gaps.push(`achievements -> ${UNLISTED_WINS} wins counted in the headline with no entry`);
}
RESULTS.forEach((r) => {
  sub(r.event || 'UNNAMED EVENT');
  f('Venue/track', r.venue, `achievement/${r.event}`);
  f('Placing', r.result, `achievement/${r.event}`);
  f('Date', r.season, `achievement/${r.event}`);
  f('Project', r.project, `achievement/${r.event}`);
  f('Description', r.blurb, `achievement/${r.event}`);
  f('Stack', r.stack, `achievement/${r.event}`);
});

// -------------------------------------------------------------- experience
rule('04 · experience');
ROLES.forEach((r) => {
  sub(`${r.title}${r.org ? ` — ${r.org}` : ''}`);
  f('Kind', r.kind, `experience/${r.title}`);
  f('Organisation', r.org, `experience/${r.title}`);
  f('Period', r.period, `experience/${r.title}`);
  f('Description', r.detail, `experience/${r.title}`);
  f('Skills', r.skills, `experience/${r.title}`);
});
sub('Photograph');
f('File', PADDOCK_PHOTO.src, 'experience/photo');
f('Caption', PADDOCK_PHOTO.caption, 'experience/photo');

// ---------------------------------------------------------------- projects
rule('05 · projects');
[...PROJECTS].sort((a, b) => a.pos - b.pos).forEach((p) => {
  sub(`${p.pos}. ${p.title}`);
  f('Field', p.field, `project/${p.title}`);
  f('One-liner', p.blurb, `project/${p.title}`);
  f('Problem', p.problem, `project/${p.title}`);
  f('My role', p.role, `project/${p.title}`);
  f('Approach', p.built, `project/${p.title}`);
  f('Outcome', p.result, `project/${p.title}`);
  f('Stack', p.stack, `project/${p.title}`);
  f('Source', p.code, `project/${p.title}`);
  f('Live', p.demo, `project/${p.title}`);
  f('Screenshot', p.shot, `project/${p.title}`);
  say(`  ${'Generated pic'.padEnd(14)} ${p.viz ? `${p.viz} — ${p.vizLabel}` : '(none)'}`);
});

// ---------------------------------------------------------------- research
rule('06 · research');
RESEARCH.forEach((r) => {
  sub(r.title);
  f('Status', r.status, `research/${r.title}`);
  f('Where', r.where, `research/${r.title}`);
  f('Description', r.blurb, `research/${r.title}`);
  f('Tags', r.tags, `research/${r.title}`);
  f('Paper link', r.paper, `research/${r.title}`);
});

// ------------------------------------------------------------------ skills
rule('07 · skills');
GROUPS.forEach((g) => {
  sub(`${g.label} (${g.marks.length})`);
  say(`  ${g.marks.join(', ')}`);
});

// ----------------------------------------------------------------- contact
rule('08 · contact');
f('Email', CONTACT.email, 'contact');
f('Phone', CONTACT.phone, 'contact');
f('Location', CONTACT.base, 'contact');
f('Resume note', RESUME_NOTE, 'contact');
sub('Services offered');
SERVICES.forEach((s) => say(`  - ${s}`));
sub('Profiles');
SOCIALS.forEach((s) => f(s.name, `${s.handle}  ${s.href}`, 'contact'));

// -------------------------------------------------------------------- gaps
out.push('');
out.push('='.repeat(74));
out.push(`GAPS — ${gaps.length} field${gaps.length === 1 ? '' : 's'} with no value`);
out.push('='.repeat(74));
gaps.forEach((g) => out.push(`  ${g}`));

console.log(out.join('\n'));
