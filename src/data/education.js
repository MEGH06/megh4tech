/**
 * Education as a career ladder.
 *
 * Ordered bottom rung first, the way a driver's career table reads on a race
 * programme. Exactly one entry may carry `current: true` — it is the only row
 * that gets weight, colour and the live marker.
 *
 * `season: null` renders an em dash rather than a guess. SSC and HSC year
 * ranges have never been stated on the site; they are pending.
 */

export const LADDER = [
  {
    id: 'ssc',
    institution: 'Dominic Savio High School',
    qualification: 'Secondary — SSC',
    season: null,
    score: '82.20',
    unit: '%',
    current: false,
  },
  {
    id: 'hsc',
    institution: 'Dixit Rd Jr College',
    qualification: 'Higher Secondary — HSC',
    season: null,
    score: '78.00',
    unit: '%',
    current: false,
  },
  {
    id: 'btech',
    institution: 'D.J. Sanghvi College of Engineering',
    // Honours track is on the resume and was missing from the site.
    qualification: 'B.Tech CSE (Data Science) + Honours in Computational Finance',
    season: '2023–2027',
    // Confirmed by Megh, current as of Aug 2026. The resume PDF still says
    // 8.89, which is a semester behind.
    score: '8.96',
    unit: 'CGPA',
    current: true,
  },
];
