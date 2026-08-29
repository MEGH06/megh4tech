/**
 * Live entry.
 *
 * Cut over from the old template to the F1 rebuild. The previous entry loaded
 * `index.css`, whose first line was a render-blocking Google Fonts @import
 * pulling three families — nine weights of Inter alone, and two of the three
 * families unused. Fonts are self-hosted now, latin subset only.
 *
 * `App.jsx` and `index.css` are left on disk rather than deleted, so the old
 * site can still be diffed against or restored.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Rajdhani for display, Barlow for prose, JetBrains Mono for data. Latin only.
import '@fontsource/rajdhani/latin-500.css';
import '@fontsource/rajdhani/latin-600.css';
import '@fontsource/rajdhani/latin-700.css';
// IBM Plex Sans for running text.
//
// Inter is the safe, invisible choice — which is exactly the complaint. It has
// no voice, and next to Rajdhani's condensed headings it reads as filler. Plex
// is IBM's technical face: open apertures, a slab-ish firmness, noticeably more
// present at the same size, and it carries an engineering register that suits
// the work being described. 500 is the body weight, not 400 — the extra weight
// is most of the "more visible".
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
// IBM Plex Mono for labels and data, replacing JetBrains Mono.
//
// JetBrains Mono is a light face and these labels are small, tracked wide and
// set in grey — three things that each cost legibility, compounding into text
// you have to lean in for. Plex Mono is sturdier at the same size, and it is
// the same family as the body face, so the whole type system is now one
// superfamily rather than three unrelated choices.
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-600.css';

import './styles/tokens.css';
import './styles/base.css';

import Site from './Site';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Site />
  </StrictMode>,
);
