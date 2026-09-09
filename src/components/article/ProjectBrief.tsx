import React from 'react';

// Editorial summaries of the published accounts, not live product claims.
// Rendered as the four-column strip under the cover of a project article (styles in project-page.css).
export const PROJECT_BRIEFS: Record<string, { question: string; contribution: string; decision: string; boundary: string }> = {
  '2718281': {
    question: 'Can a patient turn a medical report into a shortlist of relevant trials?',
    contribution: 'Built the matching tool at Foundation 29, with Julián Isla and Javier Logroño.',
    decision: 'Explain matches criterion by criterion and let the person review and send the outreach.',
    boundary: 'Describes the 2025 build; a closing section reports how the live product works a year on, from its public page.',
  },
  '7654321': {
    question: 'Can sparse event streams support a forecast that survives honest validation?',
    contribution: 'Built a simulation and compared a sparse model, an LSTM and a simple threshold.',
    decision: 'Split by session, retain a negative control and quantify uncertainty before trusting the model.',
    boundary: 'Modest signal in synthetic data; real-world predictive value remains unanswered.',
  },
  '3141592': {
    question: 'Could one person generate and integrate a bespoke CRM in 72 hours?',
    contribution: 'Designed and shipped the system solo for a two-person health-tech startup.',
    decision: 'Treat integration and review as part of the work, including catching destructive generated migrations.',
    boundary: 'A completed build with acknowledged holes, described as an experiment in AI-assisted engineering.',
  },
  '6184744': {
    question: 'How can years of scattered notes become a connected public body of work?',
    contribution: 'Built this site, its Markdown compiler, theme system and linked knowledge archive.',
    decision: 'Use the website itself as an engineering experiment and keep the source material in Markdown.',
    boundary: 'A working site and an evolving personal system; this account describes the build at publication.',
  },
  '1112121': {
    question: 'Could a finance tracker stay useful by being small enough to open directly?',
    contribution: 'Built a modular vanilla JavaScript dashboard in one AI-assisted session.',
    decision: 'Keep the app free of a build step and reconstruct cash-flow history from purchase records.',
    boundary: 'A completed personal dashboard; the article documents its constraints and reconstruction method.',
  },
};

export const ProjectBrief: React.FC<{ postId: string }> = ({ postId }) => {
  const brief = PROJECT_BRIEFS[postId];
  if (!brief) return null;
  const rows: [string, string][] = [['The question', brief.question], ['My part', brief.contribution], ['A key decision', brief.decision], ['Where it stands', brief.boundary]];
  return (
    <section className="pj-brief" aria-label="Project at a glance">
      <dl>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    </section>
  );
};
