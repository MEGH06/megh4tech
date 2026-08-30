/**
 * Generate the content brief — the document Megh fills in and hands back.
 *
 *   node tools/make-brief.mjs > BRIEF.txt
 *
 * Built from the real data modules, so what it says is already on the site is
 * actually on the site. Two kinds of entry:
 *
 *   [VERIFY]  a value exists. Leave it, or write a correction under it.
 *   [FILL]    the site has a place for this and nothing in it.
 *
 * Guidance is included per field because "write a description" produces a
 * different answer from "one sentence, name the constraint, no adjectives".
 */
import { DRIVER, BIO } from '../src/data/driver.js';
import { LADDER } from '../src/data/education.js';
import { RESULTS, UNLISTED_WINS } from '../src/data/results.js';
import { ROLES, PADDOCK_PHOTO } from '../src/data/paddock.js';
import { PROJECTS } from '../src/data/projects.js';
import { RESEARCH } from '../src/data/programmes.js';
import { CONTACT, SERVICES } from '../src/data/contact.js';

const L = [];
const w = (s = '') => L.push(s);
const H1 = (t) => { w(''); w('#'.repeat(76)); w(`# ${t}`); w('#'.repeat(76)); };
const H2 = (t) => { w(''); w(`### ${t}`); w('-'.repeat(76)); };
const TIP = (t) => w(`    (${t})`);

const has = (v) => !(v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length));

/** A line to check. Shows what is there; leave blank to keep it. */
const verify = (label, value) => {
  w('');
  w(`  ${label}`);
  w(`    NOW: ${Array.isArray(value) ? value.join(' · ') : value}`);
  w('    CHANGE TO: ');
};

/** A line to fill. Nothing is there. */
const fill = (label, tip) => {
  w('');
  w(`  ${label}   [EMPTY]`);
  if (tip) TIP(tip);
  w('    >>> ');
};

const field = (label, value, tip) => (has(value) ? verify(label, value) : fill(label, tip));

// ===========================================================================
w('MEGH4TECH — CONTENT BRIEF');
w('='.repeat(76));
w('');
w('Fill this in and send the whole file back. I will write it into the site.');
w('');
w('How to use it:');
w('  NOW:        what the site says today. Leave CHANGE TO blank to keep it.');
w('  CHANGE TO:  write the replacement on that line.');
w('  [EMPTY]     nothing is set. Write after the >>>');
w('  Skip anything you do not have. An empty field is fine; a made-up one is not.');
w('');
w('Two rules that matter more than the rest:');
w('  1. Numbers beat adjectives. "99% recall on 1M logs" beats "highly accurate".');
w('  2. If you cannot back it up, leave it out. Every claim on this site should');
w('     survive someone opening the repo and checking.');

// --------------------------------------------------------------- part one
H1('PART 1 — THE THINGS THAT UNDERCUT YOU RIGHT NOW');
w('');
w('These five are worth more than everything else in this document combined,');
w('because each one is something a client can catch.');

H2('1.1  Three wins are counted but not listed');
w('');
w(`The Achievements headline says 7 WINS. Only ${RESULTS.filter((r) => r.result === 'Winner').length} are written up.`);
w(`${UNLISTED_WINS} are counted by a constant with no entry behind them. Anyone can count the rows.`);
w('');
w('For each, or tell me to drop the count to what is listed:');
for (let i = 1; i <= UNLISTED_WINS; i += 1) {
  w('');
  w(`  WIN ${i}`);
  w('    Event name:        ');
  w('    Month + year:      ');
  w('    Placing:           ');
  w('    What you built:    ');
  TIP('one or two sentences, what it does and the hard part');
  w('    Tech used:         ');
}

H2('1.2  LawTune says one thing, its repo says another');
w('');
w('The site lists:   Gemma-2B · QLoRA · Neo4j · GraphRAG · TensorRT · Unsloth');
w('plus ">99% fewer trainable parameters, ~20% lower latency, ~30% smaller footprint".');
w('');
w('The repo README describes: Gemma-2-2B, LoRA on 4-bit weights, MLX on Apple');
w('Silicon, abstention guardrails. No Neo4j, no GraphRAG, no TensorRT, no');
w('Unsloth, and no metrics at all.');
w('');
w('LawTune is one of only four projects where you link SOURCE, so it is the one');
w('a technical client will open and compare. Pick one:');
w('');
w('  [ ] A — I built those parts, they are just not pushed. I will push them.');
w('  [ ] B — Change the site to match the repo.');
w('  [ ] C — Something else: ');
w('');
w('  Where did the three numbers come from? ');
TIP('if they were measured, say how, and they can stay');

H2('1.3  There is no photograph of you anywhere');
w('');
w('Not one. Every comparable portfolio has a face on it, and a client hiring a');
w('person likes to see the person.');
w('');
w('  Send: a photo of you. Working, presenting or judging is better than posed.');
w('  Landscape if possible, 1600px wide or more.');
w('');
w(`  Currently set: ${PADDOCK_PHOTO.src || '(nothing)'}`);
w('  Caption for it: ');
TIP('where and when, e.g. "Judging at Innovahack, Mumbai, 2025"');

H2('1.4  Your resume PDF contradicts your site');
w('');
w('public/Megh_resume.pdf says "2x Hackathon Winner" and CGPA 8.93.');
w('The site says 7 wins and 8.96. It also predates Forge, LitAgent,');
w('Equilibrium and Fincognia.');
w('');
w('I have deliberately NOT linked it. Send an updated one and I will wire it in.');
w('');
w('  [ ] Updated PDF attached');
w('  [ ] Keep it unlinked for now');

H2('1.5  Repos a visitor cannot reach');
w('');
w('These projects are on the site but have no public repo under github.com/MEGH06:');
w('  Forge, Fincognia, EcoSort AI, EasyOffRoad, Equilibrium.ai');
w('');
w('  Are they private?      ');
w('  Make them public?      ');
w('  Or drop the claim?     ');
TIP('a project with no reachable code is fine — a dead SOURCE link is not');

// --------------------------------------------------------------- part two
H1('PART 2 — PROJECTS');
w('');
w('Four projects are one line and a stack list while others get a full case');
w('study. That unevenness is what you spotted. Each needs four short answers.');
w('');
w('What makes these good:');
w('  Problem   — the constraint, not the topic. "A model big enough to reason');
w('              about case law will not fit on a mid-range phone."');
w('  Approach  — the interesting decision, not a feature list.');
w('  Outcome   — a number, or leave it empty. Never an adjective.');

[...PROJECTS].sort((a, b) => a.pos - b.pos).forEach((p) => {
  H2(`${p.pos}. ${p.title}`);
  field('Field / category', p.field, 'two or three words, e.g. "Legal AI"');
  field('One-liner', p.blurb, 'one sentence a non-engineer understands');
  field('Problem', p.problem, 'what was hard, and why');
  field('Approach', p.built, 'the decisions you made');
  field('Outcome', p.result, 'a number, or leave empty');
  field('Tech used', p.stack);
  field('Source link', p.code);
  field('Live link', p.demo, p.id === 'oopsi' ? 'the old URL now 404s' : '');
  w('');
  w(`  Screenshot: ${p.shot || (p.viz ? `generated (${p.viz})` : 'NONE')}`);
  if (!p.shot) TIP('send one and it replaces the generated picture');
});

w('');
w('  ANY PROJECT MISSING FROM THIS LIST?');
TIP('FederShield/FedAura and the Airbnb Tableau dashboard are on your GitHub');
TIP('and not on the site. Worth adding? Anything else?');
w('    >>> ');

// ------------------------------------------------------------- part three
H1('PART 3 — RESEARCH');
w('');
w('Both entries have no institution and no description on the site.');
RESEARCH.forEach((r) => {
  H2(r.title);
  field('Status', r.status);
  field('Where', r.where, 'institution or lab');
  field('What it is', r.blurb, 'two or three sentences, plain language');
  field('Tags', r.tags);
  field('Paper / preprint link', r.paper, 'arXiv, DOI, or a PDF to host');
});

// -------------------------------------------------------------- part four
H1('PART 4 — ACHIEVEMENTS, EXPERIENCE, EDUCATION');

H2('Achievements — check these');
RESULTS.forEach((r) => {
  w('');
  w(`  ${r.event}${r.venue ? ` (${r.venue})` : ''}`);
  w(`    Placing: ${r.result || '?'}    Date: ${r.season || '[EMPTY]'}`);
  if (!has(r.blurb)) {
    w('    What you built: [EMPTY] >>> ');
  }
});

H2('Experience');
ROLES.forEach((r) => {
  w('');
  w(`  ${r.title}${r.org ? ` — ${r.org}` : ''}`);
  field('Period', r.period, 'month + year to month + year');
  field('Description', r.detail);
  if (r.id === 'rookie') {
    w('    Where do you teach?     ');
    w('    How many people?        ');
    w('    Format (1:1, cohort)?   ');
  }
  if (r.id === 'steward') {
    w('    Which event, and when?  ');
    w('    How many teams judged?  ');
  }
});

H2('Education');
LADDER.forEach((r) => {
  w('');
  w(`  ${r.institution} — ${r.qualification}`);
  field('Years', r.season, 'e.g. 2021–2023');
  w(`    Score: ${r.score}${r.unit || ''}`);
});

// -------------------------------------------------------------- part five
H1('PART 5 — THE COMMERCIAL PAGE');
w('');
w('The site sells freelance work. These are the things a client wants to know');
w('before writing to you, and none of them are on the page.');

H2('Contact — check these');
verify('Email', CONTACT.email);
verify('Phone', CONTACT.phone);
verify('Location', CONTACT.base);

H2('Services — check the list');
w('');
SERVICES.forEach((s) => w(`    - ${s}`));
w('');
w('  Remove any?   ');
w('  Add any?      ');

H2('Availability');
w('');
w('  Typical reply time:        ');
TIP('e.g. "within a day". Reduces the friction of writing to you.');
w('  Taking work right now?     ');
w('  Timezone:                  ');
TIP('IST (UTC+5:30) unless you say otherwise');
w('  Minimum engagement:        ');
TIP('optional. Filters out enquiries you do not want.');
w('  Rate, if you want it shown: ');
TIP('optional, and fine to leave off');

// --------------------------------------------------------------- part six
H1('PART 6 — VOICE AND DIRECTION');

H2('Your tagline');
w('');
w(`  NOW: "${DRIVER.blurb}"`);
w('');
w('  I replaced your original ("Innovating practical, scalable solutions that');
w('  make technology work effortlessly in the real world") because it described');
w('  every portfolio ever written. Keep mine, restore yours, or write a third:');
w('    >>> ');

H2('Your bio');
w('');
BIO.forEach((p, i) => { w(`  Para ${i + 1}: ${p}`); w(''); });
w('  Change anything? ');

H2('Open questions');
w('');
w('  1. Who is the site FOR — freelance clients, employers, or both?');
w('     >>> ');
w('');
w('  2. If a client remembers ONE thing, what should it be?');
w('     >>> ');
w('');
w('  3. What work do you want more of, and what do you want less of?');
w('     >>> ');
w('');
w('  4. Anything on the site you dislike that I have not already changed?');
w('     >>> ');
w('');
w('  5. Should the F1 car stay? You have not said either way, and it is 72% of');
w('     the JavaScript on the page.');
w('     >>> ');

// ------------------------------------------------------------- part seven
H1('PART 7 — FILES TO SEND');
w('');
w('  [ ] A photo of you');
w('  [ ] Updated resume PDF');
w('  [ ] Screenshots for any project showing "NONE" above');
w('  [ ] Your signature, if you want the real one in the loading animation');
TIP('needs to be a single-stroke centreline SVG, not a traced photo —');
TIP('or send a photo and I will use the sweep animation instead');
w('  [ ] Anything else you want on the site');
w('');
w('='.repeat(76));
w('END. Send the whole file back with your answers in it.');

console.log(L.join('\n'));
