/**
 * Projects, as case studies.
 *
 * Each entry used to be a title, one sentence and a stack list. That is a
 * screenshot caption, not a case study — a client reading it learns what the
 * thing is and nothing about whether Megh can solve their problem.
 *
 * So every project now carries four extra fields, in the order a reader
 * actually needs them:
 *
 *   problem  what was wrong, and why it was hard. Constraints belong here.
 *   role     what Megh did, specifically. "Sole engineer" is a real claim.
 *   built    the approach — the interesting decisions, not a feature list.
 *   result   measurable. A number, or nothing. Never an adjective.
 *
 * `result` is the field that does the work and the one that must never be
 * inflated: where there is no measurement it stays null and the card simply
 * does not show one, rather than dressing up "it works" as an outcome.
 *
 * `blurb` is kept as the collapsed one-liner, so the section stays scannable
 * for someone in a hurry and only expands for someone genuinely interested.
 *
 * `demo: null` where the old site had `demo: '#'`. Those rendered as live
 * links that reloaded the page; a project with no deployment says so instead.
 */

// Ordered by strength, not by date. The three with measured outcomes lead;
// a client who reads only the first card should see the best one.
export const PROJECTS = [
  {
    id: 'forge',
    pos: 1,
    title: 'Forge',
    field: 'Autonomous Engineering',
    blurb:
      'An autonomous engineering org in a box — describe what you want, and it '
      + 'builds, tests and ships it without a human in the room.',
    problem:
      'Getting software built means a team, a review process, a deploy pipeline '
      + 'and someone on call when it breaks. Every one of those is a person, and '
      + 'every one is a place the work stops while it waits for them.',
    role: 'Built it at the ChatGPT Codex Community Hackathon, where it won.',
    built:
      'A swarm of Codex agents takes a plain-English brief and builds against it '
      + 'in parallel rather than in sequence. An eval gate scores the attempts '
      + 'and kills the weak ones, so bad work never reaches the merge — then the '
      + 'best parts of the survivors are merged into a single product. It ships '
      + 'itself to a live URL, and when it breaks it heals itself.',
    result:
      'Brief to deployed URL with no human in the loop, including recovery from '
      + 'its own failures.',
    stack: ['Agent Swarm', 'Codex', 'Eval Gate', 'Self-healing', 'CI/CD'],
    code: null,
    demo: 'https://forge-surfaces-mauve.vercel.app/',
    shot: '/shots/forge.jpg',
    featured: true,
  },
  {
    id: 'cybersecure',
    pos: 6,
    title: 'CyberSecure',
    blurb:
      'Full intrusion-detection pipeline analysing 1M+ network logs with 99%+ '
      + 'recall. CSV/PCAP ingestion, real-time Wireshark capture, anomaly '
      + 'detection dashboards, a Merkle-tree chain for immutable logging, and '
      + 'GenAI threat summaries.',
    stack: ['Next.js', 'Merkle Trees', 'Scikit-learn', 'Groq'],
    code: 'https://github.com/KashishM05/redact_cybersecure',
    demo: 'https://redact-cybersecure-tau.vercel.app/',
    shot: '/cybersecure.jpg',
    featured: true,
  },
  {
    id: 'jigyasa',
    pos: 7,
    title: 'JigyasaAI',
    blurb:
      'Multimodal RAG chatbot for PDFs. Upload a document and ask questions to '
      + 'retrieve both images and text, combining visual and written context in '
      + 'one answer.',
    stack: ['Python', 'CLIP', 'ChromaDB', 'Cloudinary', 'Streamlit'],
    code: 'https://github.com/MEGH06/JigyasaAI',
    demo: 'https://jigyasaai.streamlit.app/',
    shot: '/jigyasaa.jpg',
    featured: true,
  },
  {
    id: 'oopsi',
    pos: 8,
    title: 'OopsIDidntStudy',
    blurb:
      'Last-minute study platform. PanicNotes consolidates notes from mixed '
      + 'file types, CramBot answers questions from them, and Quizzard builds '
      + 'tailored quizzes.',
    stack: ['Python', 'NLP', 'React', 'FastAPI', 'Vercel'],
    code: 'https://github.com/ketan-2905/ed_app',
    // Was https://co-code-frontend-web.vercel.app/ — now returns Vercel's
    // 404. Checked, not assumed. Restore it if the deployment comes back.
    demo: null,
    featured: false,
  },
  {
    id: 'lawtune',
    pos: 2,
    title: 'LawTune',
    field: 'Legal AI',
    blurb:
      'A legal assistant that speaks 22 Indian languages and runs offline on a '
      + 'phone.',
    problem:
      'Legal help in India is English-first, and the people who need it most '
      + 'often do not read English. A model big enough to reason about case law '
      + 'will not fit on a mid-range phone, and full fine-tuning across 22 '
      + 'languages was never going to run on free Colab compute.',
    role: 'Sole engineer — fine-tuning through on-device deployment.',
    built:
      'QLoRA on Gemma-2B with guardrails keeping it inside the legal domain. A '
      + 'Neo4j knowledge graph built from Supreme Court judgments 2016–2023, so '
      + 'retrieval follows relationships between cases rather than matching '
      + 'text. TensorRT and model compression for mobile-first inference.',
    result:
      '>99% fewer trainable parameters than full fine-tuning · ~20% lower '
      + 'response latency · ~30% smaller footprint · runs offline on device.',
    stack: ['Gemma-2B', 'QLoRA', 'Neo4j', 'GraphRAG', 'TensorRT', 'Unsloth'],
    code: 'https://github.com/MEGH06/LawTune',
    demo: null,
    featured: true,
  },
  {
    id: 'litagent',
    pos: 4,
    title: 'LitAgent',
    field: 'Agentic Research',
    blurb:
      'A multi-agent researcher that reads the literature and writes the review.',
    problem:
      'A literature review means reading hundreds of papers, tracking which '
      + 'claims contradict which, and citing all of it correctly. It is weeks '
      + 'of work, and an LLM left to do it alone hallucinates citations.',
    role: 'Built the agent architecture and the verification layer. '
      + 'Placed 2nd Runner-Up at Hackanova 5.0.',
    built:
      'Four cooperating agents — retrieval, ranking, synthesis, verification — '
      + 'over API-driven ingestion from scholarly repositories. An LLM council '
      + 'evaluation framework cross-checks claims against sources so '
      + 'contradictions surface instead of being smoothed over.',
    result:
      'Citation-aware reports grounded in retrieved sources; contradiction '
      + 'detection and hallucination reduction built into the pipeline.',
    stack: ['Multi-agent', 'RAG', 'LangChain', 'LLMs', 'Python'],
    code: null,
    demo: 'https://litagent.vercel.app/',
    shot: '/shots/litagent.jpg',
    featured: true,
  },
  {
    id: 'equilibrium',
    pos: 5,
    title: 'Equilibrium.ai',
    field: 'Financial Risk',
    blurb:
      'Systemic banking-risk modelling that updates as the news breaks.',
    problem:
      'Bank risk is not independent — one institution failing moves the others, '
      + 'and a score computed quarterly is stale by the time anyone reads it.',
    role: 'Built the forecasting and risk-propagation system end to end. '
      + 'Runner-Up in the Core ML track at Datathon 2026.',
    built:
      'A FastAPI service combining LSTM-attention forecasting, eigenvalue risk '
      + 'propagation across the institutional graph, and Nash equilibrium '
      + 'modelling. Real-time news ingestion and NLP pipelines move the scores '
      + 'as market and geopolitical events land.',
    result: 'Adopted by 200+ users globally via Hugging Face deployment.',
    stack: ['FastAPI', 'LSTM', 'NLP', 'Game Theory', 'Hugging Face'],
    code: null,
    demo: null,
    featured: true,
  },
  {
    id: 'fincognia',
    pos: 3,
    title: 'Fincognia',
    field: 'Agentic Finance',
    blurb:
      'A financial co-pilot for gig workers that acts on a cashflow problem '
      + 'before it becomes a default.',
    problem:
      'Gig income is irregular, and an EMI that bounces costs far more than the '
      + 'shortfall that caused it. The people it happens to are the least likely '
      + 'to be watching a dashboard the day it matters.',
    role: 'Built at Hackxios 2K25, where it won the Innovation Track.',
    built:
      'Liquidity forecasting over simulated cashflow scenarios, with agents that '
      + 'act on the forecast rather than reporting it — locking safety buffers '
      + 'and pausing subscriptions once the risk of a bounce crosses a threshold. '
      + 'Insurance and tax workflows sit on the same forecast.',
    result: 'Liquidity risk predicted at 85% accuracy.',
    stack: ['Agentic AI', 'Forecasting', 'Fintech', 'ML'],
    code: null,
    demo: 'https://fincogina.vercel.app/',
    shot: '/shots/fincognia.jpg',
    featured: true,
  },
  {
    id: 'potato',
    pos: 9,
    title: 'Potato Leaf Detection',
    blurb:
      'Convolutional network for plant disease classification, 99%+ accuracy '
      + 'on the PlantVillage dataset.',
    stack: ['PyTorch', 'TensorFlow', 'CNN'],
    code: 'https://github.com/MEGH06/Potato-leaf-detection',
    demo: null,
    featured: false,
  },
];
