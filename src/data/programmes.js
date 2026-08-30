/**
 * Research.
 *
 * Four entries across three states, and the state is the point: a reader
 * should be able to tell at a glance what is finished, what has been shown,
 * and what is still running. "In progress" on everything says nothing.
 *
 * Ordered by what carries most weight rather than by date — a completed
 * project at IIT Bombay and a presented paper lead, the two live ones follow.
 */
export const RESEARCH = [
  {
    id: 'pinn',
    title: 'Inverse PINN framework for plant transpiration',
    blurb:
      'Estimating transpiration parameters from temporal observations where '
      + 'the parameters themselves cannot be measured directly. Physics-guided '
      + 'learning with LSTM temporal modelling and TimeGAN perturbation, tested '
      + 'against sparse and noisy environmental data and across climates the '
      + 'model had not seen.',
    tags: ['PINNs', 'PyTorch', 'LSTM', 'TimeGAN', 'PDEs'],
    status: 'Completed',
    where: 'IIT Bombay',
    paper: null,
  },
  {
    id: 'convnext',
    title: 'Explainable ConvNeXt ensemble for cervical cancer detection',
    blurb:
      'A ConvNeXt ensemble for early detection, built so the prediction can be '
      + 'interrogated as well as trusted. SHAP and attention-based analysis '
      + 'carry as much weight as classification accuracy, because a result a '
      + 'clinician cannot question is not one they can act on.',
    tags: ['ConvNeXt', 'XAI', 'SHAP', 'Ensembles', 'Medical imaging'],
    status: 'Presented',
    where: null,
    paper: null,
  },
  {
    id: 'federated',
    title: 'Federated learning',
    blurb:
      'Training across distributed devices without the raw data leaving them. '
      + 'A paper on the work is in progress.',
    tags: ['Federated learning', 'Distributed training', 'Privacy'],
    status: 'Ongoing',
    where: null,
    paper: null,
  },
  {
    id: 'blm',
    title: 'BLM',
    blurb: 'Active research.',
    tags: ['Research'],
    status: 'Ongoing',
    where: null,
    paper: null,
  },
];
