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
    id: 'ecosort',
    pos: 6,
    title: 'EcoSort AI',
    field: 'Computer Vision',
    viz: 'conveyor',
    vizLabel: 'Plastic sorting · simulated',
    blurb:
      'A waste-management platform that identifies and sorts plastics by '
      + 'sight.',
    problem:
      'Plastic sorting is done by hand, at speed, by people who have to be '
      + 'right about material type — and the compliance reporting that follows '
      + 'is a second job on top of the first.',
    built:
      'Real-time detection through Roboflow and OpenCV behind a FastAPI '
      + 'service, with a Next.js dashboard carrying live statistics, '
      + 'classification confidence and a 3D simulation of the line. EPR '
      + 'reports generate from the same detections, so the compliance audit is '
      + 'a by-product of the sorting rather than separate work.',
    result: null,
    stack: ['Computer Vision', 'Roboflow', 'OpenCV', 'FastAPI', 'Next.js'],
    code: null,
    demo: null,
    featured: true,
  },
  {
    id: 'easyoffroad',
    pos: 7,
    title: 'EasyOffRoad',
    field: 'Autonomous Perception',
    viz: 'segment',
    vizLabel: 'Terrain segmentation · simulated',
    blurb:
      'Semantic segmentation for autonomous vehicles in desert and off-road '
      + 'terrain.',
    problem:
      'Off-road driving has no lane markings, no kerbs and no signage. The '
      + 'model has to read the ground itself — which of this is rock, which is '
      + 'scrub, which is drivable — from terrain that looks nearly uniform.',
    built:
      'Mask2Former on a Swin-Large backbone, classifying terrain into trees, '
      + 'rock, sky and the other off-road classes. Specialised loss handling '
      + 'for the class imbalance that desert imagery creates, and test-time '
      + 'augmentation for the cases the training set did not cover. A Next.js '
      + 'front end carries the training metrics and a 3D simulation scene.',
    result: null,
    stack: ['Mask2Former', 'Swin-Large', 'PyTorch', 'Segmentation', 'Next.js'],
    code: null,
    demo: null,
    featured: true,
  },
  {
    id: 'cybersecure',
    field: 'Cybersecurity AI',
    problem:
      'Intrusion detection has to read enormous volumes of network traffic and '
      + 'still be trusted afterwards. Detection alone is not enough: if the '
      + 'record of what was seen can be altered, the evidence is worthless.',
    built:
      'CSV and PCAP ingestion plus live Wireshark capture, with anomaly '
      + 'detection over the stream. A Merkle-tree chain makes the log tamper-'
      + 'evident, so a record cannot be quietly changed after the fact, and '
      + 'generative summaries turn detected events into something a human can '
      + 'act on rather than a wall of rows.',
    result: '>99% recall across 1M+ network logs.',
    pos: 8,
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
    field: 'Multimodal RAG',
    problem:
      'Document retrieval that only reads text loses whatever lives in the '
      + 'diagrams, and in technical documents the diagram is frequently where '
      + 'the answer is.',
    built:
      'Text and visual retrieval running together — CLIP for the visual '
      + 'representations, ChromaDB for the vectors — so an answer can draw on '
      + 'both and show the relevant figure beside it rather than describing '
      + 'something the reader cannot see.',
    pos: 9,
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
    field: 'AI Education',
    problem:
      'Study material arrives as a pile of mixed formats the night before, and '
      + 'turning it into something revisable is the work nobody has time for.',
    built:
      'Three stages over one pipeline: PanicNotes consolidates the material '
      + 'whatever format it came in, CramBot answers questions against it, and '
      + 'Quizzard generates quizzes from the same source — so the answers and '
      + 'the questions both come from the actual material.',
    viz: 'documents',
    vizLabel: 'Note consolidation · simulated',
    pos: 10,
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
    viz: 'scales',
    vizLabel: 'Legal Q&A · simulated',
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
      + 'languages was never going to run on the compute available.',
    role: 'Sole engineer — fine-tuning through on-device deployment.',
    built:
      'LoRA on a 4-bit quantised Gemma-2B, so the whole thing fits inside the '
      + 'compute a phone actually has. Guardrails hold it inside the legal '
      + 'domain and make abstention the default rather than an afterthought — '
      + 'a legal assistant that guesses is worse than one that declines. '
      + 'Inference runs locally through MLX.',
    result: null,
    stack: ['Gemma-2B', 'QLoRA', 'MLX', '4-bit quantisation', 'On-device'],
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
    viz: 'cascade',
    vizLabel: 'Risk propagation · simulated',
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
    field: 'Computer Vision',
    problem:
      'Plant disease is diagnosed by eye, which needs someone who knows what '
      + 'they are looking at standing in the field.',
    built:
      'A convolutional classifier over the PlantVillage dataset, trained to '
      + 'separate disease classes from leaf images alone.',
    result: '>99% accuracy on the PlantVillage dataset.',
    viz: 'leaf',
    vizLabel: 'Leaf detection · simulated',
    pos: 11,
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
