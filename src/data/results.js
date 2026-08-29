/**
 * Hackathon results.
 *
 * Seven wins. Six are now named with what was actually built; the two
 * unnamed wins are still awaiting their event names rather than being invented.
 *
 * Placings are written the way Megh writes them — Winner, Runner-Up, 2nd
 * Runner-Up — not as P2/P3 scoring codes. Nobody outside motorsport reads
 * "P3" as a placing, and this is a CV, not a classification sheet.
 *
 * `blurb` matters more than the placing. "Winner" is a claim anyone can make;
 * "85% liquidity-risk accuracy" and "Mask2Former with a Swin-Large backbone"
 * are the things a client or an interviewer can weigh.
 *
 * Ordered most recent first. Every figure in the header derives from this
 * array, so the counts cannot drift from the rows.
 *
 * NOTE: the dates as supplied ran Jan / Mar / Apr / Mar down the list, so
 * Hackniche and Hawkathon may be the wrong way round — worth a check.
 */

/**
 * People Megh has guided — mentees, hackathon teams, workshop attendees.
 *
 * This replaces a count of hackathons entered. Entries measure how often he
 * turned up; this measures what other people got out of it, which is both the
 * stronger claim and the harder one to fake.
 */
export const GUIDED = '200+';

export const RESULTS = [
  {
    round: 1,
    event: 'ChatGPT Hackathon',
    // Both names as given, rather than inventing a single official title.
    venue: 'Codex Community Hackathon',
    result: 'Winner',
    season: null,
    project: 'Forge',
    blurb:
      'An autonomous engineering org in a box. You describe what you want in '
      + 'plain English; a swarm of Codex agents builds it in parallel, an eval '
      + 'gate scores the attempts and kills the weak ones, and the best parts '
      + 'merge into a single product that ships itself to a live URL. When it '
      + 'breaks, Forge heals it with no human in the room.',
    stack: ['Agent Swarm', 'Codex', 'Eval Gate', 'Self-healing', 'CI/CD'],
  },
  {
    round: 2,
    event: 'Hackniche 4.0',
    result: 'Winner',
    season: 'Apr 2026',
    project: 'EcoSort AI',
    blurb:
      'AI waste-management platform using computer vision to identify and sort '
      + 'plastics. FastAPI backend doing real-time detection with Roboflow and '
      + 'OpenCV, Next.js dashboards with live statistics, confidence tracking '
      + 'and 3D simulation, plus EPR report generation for automated '
      + 'environmental compliance audits.',
    stack: ['Computer Vision', 'Roboflow', 'OpenCV', 'FastAPI', 'Next.js'],
  },
  {
    round: 3,
    event: 'Hawkathon 2026',
    result: 'Winner',
    season: 'Mar 2026',
    project: 'EasyOffRoad',
    blurb:
      'Autonomous-vehicle perception for semantic segmentation in desert '
      + 'terrain. Mask2Former with a Swin-Large backbone classifying trees, '
      + 'rocks, sky and other off-road classes, with specialised loss handling '
      + 'and test-time augmentation, and a Next.js front end carrying a 3D '
      + 'simulation scene and training-metrics dashboard.',
    stack: ['Mask2Former', 'Swin-Large', 'Segmentation', 'PyTorch', 'Next.js'],
  },
  {
    round: 4,
    event: 'Hackanova 5.0',
    result: '2nd Runner-Up',
    season: 'Mar 2026',
    project: 'LitAgent',
    blurb:
      'Autonomous research agent running a 15-step literature-review pipeline '
      + 'across Semantic Scholar, arXiv and PubMed — expanding citation graphs, '
      + 'parsing PDFs, detecting contradictions between studies and synthesising '
      + 'a report. Multi-agent "LLM Council" debate for peer-review style '
      + 'analysis, with a research dashboard, Chrome extension doing citation '
      + 'verification, and a mobile companion.',
    stack: ['Multi-agent', 'RAG', 'LLM Council', 'Next.js', 'Chrome Extension'],
  },
  {
    round: 5,
    event: 'Datathon 2026',
    venue: 'Core Machine Learning track',
    result: 'Runner-Up',
    season: 'Jan 2026',
    project: 'Equilibrium.ai',
    blurb:
      'Network-driven simulation of a financial system, modelling how systemic '
      + 'risk propagates between interconnected institutions. End-to-end ML '
      + 'pipeline with the mathematical modelling, data simulation and risk '
      + 'prediction, plus the backend architecture, database design and the '
      + 'LLM-powered analytical components.',
    stack: ['Systemic Risk', 'ML Pipeline', 'LLM', 'Backend'],
  },
  {
    round: 6,
    event: 'Hackxios 2K25',
    venue: 'Innovation track',
    result: 'Winner',
    season: '2025',
    project: 'Fincognia',
    blurb:
      'Autonomous agentic finance co-pilot for gig workers. Predicts liquidity '
      + 'risk at 85% accuracy, heads off EMI defaults without being asked, and '
      + 'optimises insurance and tax workflows — improving long-term credit '
      + 'health through real-time simulation.',
    stack: ['Agentic AI', 'Forecasting', 'FinTech'],
  },
  {
    round: 7,
    event: 'Co-Code Hackathon',
    venue: 'DJ Sanghvi College — hybrid',
    result: '2nd Runner-Up',
    season: '2025',
  },
  {
    round: 8,
    event: 'DJS Sanshodhan',
    venue: 'Research symposium',
    result: '2nd Runner-Up',
    season: '2025',
  },
];

/**
 * Wins that are real but not yet written up.
 *
 * These used to sit in RESULTS as three empty rows, which rendered as "Win —
 * event name to come" three times in a row. A note-to-self shown to a
 * recruiter is worse than the missing row: it says the site was published
 * unfinished, and it casts doubt on the entries that ARE complete. The count
 * stays honest as a number; when the names arrive they become real rows here
 * and this drops to zero.
 */
export const UNLISTED_WINS = 3;

/** Derived, never hand-maintained — the header cannot drift from the table. */
export const SUMMARY = [
  {
    label: 'Wins',
    value: RESULTS.filter((r) => r.result === 'Winner').length + UNLISTED_WINS,
  },
  { label: 'Podiums', value: RESULTS.length + UNLISTED_WINS },
  { label: 'People guided', value: GUIDED },
];
