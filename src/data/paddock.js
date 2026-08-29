/**
 * Experience — the things Megh does, as distinct from what he has won.
 *
 * `kind` says plainly what sort of role it is. It used to carry F1 words
 * (Stint / Steward / Academy) which renamed real work into a costume — the
 * racing theme belongs to the car and the surface, not to the facts about him.
 *
 * `pending` names what is still missing for that row so it shows up in the UI
 * instead of quietly shipping a vaguer claim than the truth.
 */

export const ROLES = [
  {
    id: 'stint',
    kind: 'Internship',
    title: 'ML Research Intern',
    org: 'IIT Bombay',
    // Full description from the previous site, not the abridged version the
    // rebuild had been using.
    // From the resume, and past tense now the role has ended. Considerably
    // more specific than the line the site was carrying.
    detail:
      'Designed an inverse Physics-Informed Neural Network (PINN) framework to '
      + 'estimate latent plant transpiration parameters from temporal '
      + 'observations, without direct parameter measurements. Integrated '
      + 'LSTM-inspired temporal encoding and TimeGAN-based perturbation to hold '
      + 'up under sparse and noisy environmental data, and ran physics-guided '
      + 'learning experiments to generalise across unseen climatic conditions.',
    // Confirmed ended December 2025.
    period: 'Jun 2025 — Dec 2025',
    skills: ['PINNs', 'Deep Learning', 'PyTorch', 'TimeGAN'],
  },
  {
    id: 'steward',
    kind: 'Judging',
    title: 'Hackathon Judge',
    org: 'Innovahack',
    // Stated, not argued. The line used to end by explaining why judging is
    // a stronger signal than competing, which is the site telling the reader
    // how impressed to be — a recruiter draws that conclusion unaided, and
    // resents being walked to it.
    detail: 'Invited to judge, scoring competing teams.',
  },
  {
    id: 'academy',
    kind: 'Mentoring',
    title: 'ML Mentor',
    org: 'DJS Compute',
    detail:
      'Mentoring juniors in Machine Learning and AI by guiding them through '
      + 'core concepts, practical projects and best practices — helping them '
      + 'understand algorithms, build hands-on applications, improve their '
      + 'research and coding, and develop confidence in real-world '
      + 'problem-solving. 200+ people guided, plus active mentoring of hackathon '
      + 'teams.',
    period: '2025 — Present',
    skills: ['ML', 'Deep Learning', 'AI'],
  },
  {
    id: 'rookie',
    kind: 'Teaching',
    title: 'ML Fundamentals',
    org: null,
    detail:
      'Teaching machine-learning basics to people entering the AI field from '
      + 'scratch.',
  },
];

/** The one photograph of Megh on the site, which is what gives it force. */
export const PADDOCK_PHOTO = {
  src: null,
  alt: 'Megh Dave judging a hackathon',
  caption: null,
  pending: 'photo file, plus event / venue / month',
};
