/**
 * Build-time SEO content, generated from src/data.
 *
 * A Vite plugin that fills two placeholders in index.html:
 *
 *   <!--seo:jsonld-->    schema.org graph describing the person and the work
 *   <!--seo:noscript-->  a real text version of the page
 *
 * Both are generated rather than hand-written for the same reason the content
 * brief is: a hand-maintained copy of the site's own facts drifts, and a
 * structured-data block that disagrees with the visible page is worse than
 * none — Google treats the mismatch as a reason to distrust both.
 *
 * The noscript body matters more than it looks. This is a single-page app, so
 * the HTML a crawler receives before running any JavaScript contains 190
 * characters of nothing. Google renders JS and will eventually see the real
 * page; the link-preview and answer-building crawlers largely do not, and
 * those are the ones a prospective client meets first.
 *
 * noscript is the right container for it: never shown to a visitor who has
 * JavaScript, so it cannot flash; identical in substance to what the app
 * renders, so it is not a second page written for machines.
 */
import { DRIVER, DRIVER_ROLES, BIO } from '../src/data/driver.js';
import { PROJECTS } from '../src/data/projects.js';
import { RESEARCH } from '../src/data/programmes.js';
import { RESULTS } from '../src/data/results.js';
import { LADDER } from '../src/data/education.js';
import { ROLES } from '../src/data/paddock.js';
import { CONTACT, SERVICES } from '../src/data/contact.js';

const SITE = 'https://megh4tech.vercel.app/';
const NAME = `${DRIVER.first} ${DRIVER.last}`;

/** Escapes text for HTML. Everything below goes through it. */
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** A link, or plain text when there is no URL to point at. */
const link = (href, text) => (href
  ? `<a href="${esc(href)}">${esc(text)}</a>`
  : esc(text));

/* ------------------------------------------------------------- structured */

function jsonld() {
  const person = {
    '@type': 'Person',
    '@id': `${SITE}#megh`,
    name: NAME,
    givenName: DRIVER.first,
    familyName: DRIVER.last,
    url: SITE,
    image: `${SITE}og.png`,
    // The overview, trimmed to the first two paragraphs — a description here
    // is a summary, not the page.
    description: BIO.slice(0, 2).join(' '),
    jobTitle: DRIVER_ROLES,
    email: `mailto:${CONTACT.email}`,
    telephone: CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    alumniOf: LADDER.map((l) => ({
      '@type': 'EducationalOrganization',
      name: l.institution,
    })),
    knowsAbout: [...new Set([
      ...PROJECTS.flatMap((p) => p.stack || []),
      ...RESEARCH.flatMap((r) => r.tags || []),
    ])].sort(),
    makesOffer: SERVICES.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s },
    })),
    sameAs: [CONTACT.github, CONTACT.linkedin, CONTACT.medium].filter(Boolean),
  };

  // Only projects with something a reader can open become their own entity.
  // A CreativeWork with no url is a claim with nothing behind it.
  const works = PROJECTS
    .filter((p) => p.demo || p.code)
    .map((p) => ({
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE}#project-${p.id}`,
      name: p.title,
      description: p.blurb,
      url: p.demo || p.code,
      ...(p.code ? { codeRepository: p.code } : {}),
      ...(p.stack?.length ? { programmingLanguage: p.stack } : {}),
      author: { '@id': `${SITE}#megh` },
    }));

  const page = {
    '@type': 'ProfilePage',
    '@id': `${SITE}#page`,
    url: SITE,
    name: `${NAME} — AI/ML & Full Stack Engineer, Mumbai`,
    inLanguage: 'en',
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntity: { '@id': `${SITE}#megh` },
    about: { '@id': `${SITE}#megh` },
  };

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [page, person, ...works] });
}

/* ---------------------------------------------------------------- content */

function noscript() {
  const L = [];
  const w = (s) => L.push(s);

  w(`<h1>${esc(NAME)}</h1>`);
  w(`<p>${esc(DRIVER_ROLES.join(' · '))} — ${esc(DRIVER.base)}</p>`);
  w(`<p>${esc(DRIVER.blurb)}</p>`);

  w('<h2>About</h2>');
  BIO.forEach((p) => w(`<p>${esc(p)}</p>`));

  w('<h2>Projects</h2>');
  [...PROJECTS].sort((x, y) => x.pos - y.pos).forEach((p) => {
    w(`<h3>${esc(p.title)}</h3>`);
    if (p.field) w(`<p>${esc(p.field)}</p>`);
    if (p.blurb) w(`<p>${esc(p.blurb)}</p>`);
    if (p.problem) w(`<p>${esc(p.problem)}</p>`);
    if (p.built) w(`<p>${esc(p.built)}</p>`);
    if (p.result) w(`<p>${esc(p.result)}</p>`);
    if (p.stack?.length) w(`<p>Built with: ${esc(p.stack.join(', '))}</p>`);
    const links = [
      p.demo ? link(p.demo, 'Live') : '',
      p.code ? link(p.code, 'Source') : '',
    ].filter(Boolean);
    if (links.length) w(`<p>${links.join(' · ')}</p>`);
  });

  w('<h2>Research</h2>');
  RESEARCH.forEach((r) => {
    w(`<h3>${esc(r.title)}</h3>`);
    w(`<p>${esc(r.status)}${r.where ? ` — ${esc(r.where)}` : ''}</p>`);
    if (r.blurb) w(`<p>${esc(r.blurb)}</p>`);
    if (r.paper) w(`<p>${link(r.paper, 'Paper')}</p>`);
  });

  w('<h2>Achievements</h2>');
  w('<ul>');
  RESULTS.forEach((r) => w(`<li>${esc(r.event)}${r.venue ? ` — ${esc(r.venue)}` : ''}</li>`));
  w('</ul>');

  w('<h2>Experience</h2>');
  ROLES.forEach((r) => {
    w(`<h3>${esc(r.title)}${r.org ? ` — ${esc(r.org)}` : ''}</h3>`);
    if (r.period) w(`<p>${esc(r.period)}</p>`);
    if (r.detail) w(`<p>${esc(r.detail)}</p>`);
  });

  w('<h2>Education</h2>');
  w('<ul>');
  LADDER.forEach((l) => {
    const score = l.score ? ` — ${esc(l.score)}${esc(l.unit || '')}` : '';
    w(`<li>${esc(l.institution)}: ${esc(l.qualification)}${score}</li>`);
  });
  w('</ul>');

  w('<h2>Available for</h2>');
  w('<ul>');
  SERVICES.forEach((s) => w(`<li>${esc(s)}</li>`));
  w('</ul>');

  w('<h2>Contact</h2>');
  w(`<p>${link(`mailto:${CONTACT.email}`, CONTACT.email)}</p>`);
  w(`<p>${link(`tel:${CONTACT.phone.replace(/\s/g, '')}`, CONTACT.phone)}</p>`);
  w(`<p>${esc(CONTACT.base)}</p>`);
  w('<ul>');
  w(`<li>${link(CONTACT.github, 'GitHub')}</li>`);
  w(`<li>${link(CONTACT.linkedin, 'LinkedIn')}</li>`);
  w(`<li>${link(CONTACT.medium, 'Medium')}</li>`);
  w('</ul>');

  return L.join('\n    ');
}

/* ----------------------------------------------------------------- plugin */

export default function seo() {
  return {
    name: 'megh4tech-seo',
    transformIndexHtml(html) {
      const jl = `<script type="application/ld+json">${jsonld()}</script>`;
      return html
        .replace('<!--seo:jsonld-->', jl)
        .replace('<!--seo:noscript-->', noscript());
    },
  };
}

/** Also runnable directly, to inspect what would be emitted. */
if (process.argv[1] && process.argv[1].endsWith('seo.mjs')) {
  const g = JSON.parse(jsonld());
  console.log(`  graph nodes: ${g['@graph'].length}`);
  g['@graph'].forEach((n) => console.log(`    ${n['@type']}  ${n.name || n['@id']}`));
  console.log(`  knowsAbout terms: ${g['@graph'][1].knowsAbout.length}`);
  console.log(`  offers: ${g['@graph'][1].makesOffer.length}`);
  console.log(`  noscript: ${noscript().length} characters`);
}
