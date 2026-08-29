/**
 * The stack, grouped by what each thing is for.
 *
 * This replaces a five-tier "how important is it" ranking. That ranking was a
 * judgement call dressed as data — it set two marks huge and in red and pushed
 * everything else down, which made the two look shouted rather than important
 * and buried the breadth underneath. Breadth is the actual selling point for
 * freelance work, so the grouping now answers the question a client has ("can
 * he do X?") instead of one nobody asked ("what is his favourite tool?").
 *
 * The AWS services are folded into Cloud & DevOps. They previously had their
 * own panel at the foot of the section, which read as an advert for Amazon
 * rather than a list of Megh's skills.
 *
 * Order within a group: most load-bearing first, so a skim of the first two or
 * three per line still tells the truth.
 */

export const GROUPS = [
  {
    id: 'ai',
    label: 'AI & Machine Learning',
    marks: [
      'Machine Learning',
      'Deep Learning',
      'Generative AI',
      'NLP',
      'Computer Vision',
      'PyTorch',
      'TensorFlow',
      'Scikit-learn',
      'Supervised Learning',
      'Transfer Learning',
      'Edge AI',
      'Semantic Retrieval',
      'Data Pipelines',
      'Model Deployment',
      'CLIP',
      'Unsloth',
    ],
  },
  {
    id: 'languages',
    label: 'Languages',
    marks: [
      'Python',
      'JavaScript',
      'TypeScript',
      'SQL',
      'C++',
      'C',
      'Swift',
      'HTML',
      'CSS',
    ],
  },
  {
    id: 'web',
    label: 'Web Development',
    marks: [
      'React',
      'Next.js',
      'Node.js',
      'Express',
      'Django',
      'FastAPI',
      'Flask',
      'Tailwind CSS',
      'Bootstrap',
      'Streamlit',
      'UI / UX Design',
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile',
    // NOTE: Swift ships to Apple's App Store, not Play Store. Still awaiting
    // confirmation of which store the shipped app is on and what built it.
    marks: ['Flutter', 'React Native', 'Swift', 'Firebase Auth'],
  },
  {
    id: 'data',
    label: 'Databases',
    marks: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'NoSQL',
      'Pinecone',
      'ChromaDB',
      'pgvector',
      'Vector DB',
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & DevOps',
    marks: [
      'AWS',
      'Bedrock',
      'Lambda',
      'DynamoDB',
      'RDS',
      'CloudWatch',
      'Docker',
      'Kubernetes',
      'CI/CD',
      'Git',
      'GitHub',
      'Vercel',
      'VPS Hosting',
      'Cloudinary',
      'MCP Servers',
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    marks: ['Jupyter', 'Selenium', 'Tableau', 'Merkle Trees'],
  },
  {
    // The old site listed these as their own category and the first rebuild
    // dropped them. They matter most to the people hiring for contract work.
    id: 'soft',
    label: 'Soft Skills',
    marks: ['Problem Solving', 'Leadership', 'Team Work', 'Communication'],
  },
];
