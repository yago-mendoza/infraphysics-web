import React from 'react';
import { Link } from 'react-router-dom';
import { AboutTopBar } from '../components/AboutTopBar';

type PathItem = {
  name: string;
  role: string;
  date: string;
  href?: string;
  intro?: string;
  bullets?: string[];
  tags?: string;
};

const experience: PathItem[] = [
  {
    name: 'Fundación 29 de Febrero',
    role: 'Applied AI Engineer',
    date: '2025 — Present',
    href: 'https://foundation29.org/es',
    intro: 'Building and operating clinical AI systems where model behavior requires measurable evidence, resilient infrastructure and human review.',
    bullets: [
      "Built the organization’s first GenAI evaluation capability for model-selection and ship/no-ship decisions.",
      'Helped improve DxGPT’s evaluated diagnostic accuracy from approximately 70% to 93%.',
      'Built and shipped TrialGPT end to end, from medical-document parsing to evaluation, UX, backend and Azure deployment.',
    ],
    tags: 'Clinical AI · Evaluation · Azure · Reliability',
  },
  {
    name: 'Leadrank',
    role: 'Product Engineer · Independent',
    date: '2026 — Present',
    intro: 'Building an AI product that turns unstructured email history into structured commercial intelligence for real-estate workflows.',
    bullets: [
      'Designed ingestion and extraction for historical and real-time email processing.',
      'Built entity resolution and matching across contacts, deals, buyer intent and properties.',
      'Validating workflows and product demand with agents in Barcelona and Madrid.',
    ],
    tags: 'Product engineering · Extraction · Entity resolution · Validation',
  },
  {
    name: 'UNE',
    role: 'AI Standards Committee · Independent',
    date: '2026',
    href: 'https://www.une.org/encuentra-tu-norma/comites-tecnicos-de-normalizacion/comite?c=CTN%2071&n=5',
    intro: 'Participated independently in Spain’s mirror committee for European and international AI standardization.',
    bullets: [
      'Contributed through UNE CTN 71/SC 42 committee meetings and standards review.',
      'Studied evaluation, bias management, dataset quality, risk and conformity-assessment workflows.',
    ],
    tags: 'AI standards · Evaluation · Risk · Conformity',
  },
  {
    name: 'Sony Europe',
    role: 'ML & Distributed Systems Engineer',
    date: '2024',
    href: 'https://www.sony.eu/',
    intro: 'Worked inside Sony Europe’s Brussels ML R&D lab across blockchain optimization, program synthesis and agent evaluation.',
    bullets: [
      'Designed execution-based agent evaluation using compilation, automated tests and network deployment.',
      'Took the research system end to end, from DSPy and LangChain experiments to orchestration and infrastructure.',
      'Operated the Hyperledger Besu network, SDK and monitoring stack; selected optimizations entered Sony’s work.',
    ],
    tags: 'DSPy · LangChain · TypeScript · Hyperledger Besu',
  },
  {
    name: 'TE Connectivity',
    role: 'Supply Chain Data & Automation Intern',
    date: '2023',
    href: 'https://www.te.com/en/home.html',
    intro: 'Applied software and data engineering to operational supply-chain processes.',
    bullets: [
      'Automated inventory, CRM and bill-of-materials reporting with Python and SQL.',
      'Built internal pipelines and reporting tools to improve data quality and planning visibility.',
    ],
    tags: 'Python · SQL · Supply chain · Automation',
  },
  {
    name: 'CIMNE',
    role: 'Safety Engineering · EU LASH FIRE',
    date: 'Earlier',
    href: 'https://www.cimne.com/vnews/2/10847/lash-fire-improving-ro-ro-ship-fire-safety',
    intro: 'Worked on safety-critical engineering within the EU-funded LASH FIRE research project.',
    bullets: ['Contributed industrial engineering analysis where technical decisions met physical safety constraints.'],
    tags: 'Safety engineering · Research · Physical systems',
  },
];

const education: PathItem[] = [
  { name: 'IIA', role: "Executive Master's · Business Intelligence & Management", date: '2024 — 2025', href: 'https://iia.es/producto/master-ejecutivo/', intro: 'Applied AI across machine learning, deep learning, NLP and computer vision, with governance and real-world industry work.', tags: 'Applied AI · Governance · NLP · Computer vision' },
  { name: 'Schneider Electric', role: 'Certificate · Agile Project Management', date: 'Dec 2024', href: 'https://www.se.com/es/es/' },
  { name: 'UPC · ETSEIB', role: 'MUEI · Industrial Engineering · IT for Industry', date: '2022 — 2024', href: 'https://etseib.upc.edu/es/futuros-estudiantes/que-estudios/master-universitario-en-ingenieria-industrial' },
  { name: 'DeepLearning.AI', role: 'Specialization · Machine Learning', date: 'Oct 2023', href: 'https://www.deeplearning.ai/specializations/machine-learning' },
  { name: 'UPC · ETSEIB', role: 'GETI · Industrial Technologies Engineering', date: '2017 — 2022', href: 'https://etseib.upc.edu/es/futuros-estudiantes/que-estudios/grado-en-ingenieria-en-tecnologias-industriales' },
  { name: 'CC Academy', role: "Master's · Blockchain Engineering", date: '2025', intro: 'Decentralized systems, smart contracts, cryptography and production infrastructure across EVM and Hyperledger ecosystems.', tags: 'Solidity · EVM · Hyperledger · Docker · Kubernetes' },
  { name: 'Independent practice', role: 'AI, software & systems', date: '2016 — Present', intro: 'A continuous self-directed curriculum built from lectures, papers, source code, technical writing and projects that had to work.', tags: 'AI · Computing · Infrastructure · Control · Distributed systems' },
];

const capabilities = [
  'AI evaluation & model selection',
  'Production deployment & reliability',
  'End-to-end product engineering',
  'Systems integration under operational constraints',
];

const PathRows: React.FC<{ rows: PathItem[] }> = ({ rows }) => (
  <div className="about1-path">
    {rows.map(item => {
      const content = <><strong>{item.name}</strong><span>{item.role}</span><i aria-hidden="true" /><time>{item.date}</time></>;
      return item.href
        ? <a key={`${item.name}-${item.role}`} href={item.href} target="_blank" rel="noreferrer">{content}</a>
        : <div key={`${item.name}-${item.role}`}>{content}</div>;
    })}
  </div>
);

export const About1View: React.FC = () => (
  <article className="about1 animate-fade-in">
    <header className="about1-hero">
      <AboutTopBar active="cv" />
      <div className="about1-intro">
        <h1>AI that survives<br />contact with<br /><em>the real world.</em></h1>
        <div>
          <p>Industrial engineer and applied AI engineer working across evaluation, deployment and systems integration.</p>
          <p>I structure ambiguous domain problems, build the system end to end and produce evidence for operational decisions.</p>
          <a href="https://www.linkedin.com/in/yago-mendoza" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        </div>
      </div>
    </header>

    <section className="about1-proof" aria-labelledby="about1-proof-title">
      <h2 id="about1-proof-title">In practice</h2>
      <div className="about1-proof-grid">
        <p><strong>70 → 93%</strong><span>DxGPT evaluated diagnostic accuracy, improved through model selection, inference optimization and safety guardrails.</span></p>
        <p><strong>≈700K</strong><span>Queries per year served by the clinical AI system supported by that evaluation capability.</span></p>
        <p><strong>0 → shipped</strong><span>TrialGPT built end to end: document parsing, clinical extraction, matching, evaluation, UX, backend and Azure deployment.</span></p>
      </div>
    </section>

    <section className="about1-experience" aria-labelledby="about1-experience-title">
      <h2 id="about1-experience-title">Experience</h2>
      <PathRows rows={experience} />
    </section>

    <section className="about1-capabilities" aria-labelledby="about1-capabilities-title">
      <h2 id="about1-capabilities-title">Core capabilities</h2>
      <ol>
        {capabilities.map((capability, index) => <li key={capability}><span>0{index + 1}</span>{capability}</li>)}
      </ol>
    </section>

    <section className="about1-experience" aria-labelledby="about1-education-title">
      <h2 id="about1-education-title">Education</h2>
      <PathRows rows={education} />
    </section>

    <section className="about1-stack-cta" aria-labelledby="about1-stack-title">
      <div>
        <h2 id="about1-stack-title">Technical stack</h2>
        <p>Tools, protocols and engineering systems used across software and physical infrastructure.</p>
      </div>
      <Link to="/about/stack">Explore all 48 tools <span aria-hidden="true">↗</span></Link>
    </section>

  </article>
);
