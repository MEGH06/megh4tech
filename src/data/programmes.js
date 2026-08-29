/**
 * Research programmes.
 *
 * Both carried over from the previous site. The research entries had a
 * "Learn More" link that never rendered because both URLs were '#'; that is
 * recorded as `paper: null` here rather than a dead control.
 */

export const RESEARCH = [
  {
    id: 'pinn',
    title: 'Transpiration estimation with a PINN-LSTM model',
    blurb:
      'Embedding physical law into the network rather than learning around it. '
      + 'The aim is precise, plant-specific transpiration under varying '
      + 'conditions, not broad generalisation — so biological process '
      + 'constraints are built into the model itself.',
    tags: ['PINNs', 'LSTM', 'PDEs'],
    status: 'In progress',
    where: 'IIT Bombay',
    paper: null,
  },
  {
    id: 'convnext',
    title: 'Explainable ConvNeXt ensemble for cervical cancer detection',
    blurb:
      'An ensemble detection system using ConvNeXt with SHAP and '
      + 'attention-driven explainability, aimed at making early detection both '
      + 'accurate and interpretable — a prediction a clinician cannot '
      + 'interrogate is not much use.',
    tags: ['ConvNeXt', 'XAI', 'SHAP', 'Ensembles'],
    status: 'In progress',
    where: null,
    paper: null,
  },
];
