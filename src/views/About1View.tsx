import React from 'react';
import { Link } from 'react-router-dom';
import { AboutTopBar } from '../components/AboutTopBar';
import profile from '../data/agent-profile.json';

type PathItem = {
  name: string;
  role: string;
  date: string;
  href?: string;
  intro?: string;
  bullets?: string[];
  tags?: string;
};

const experience: PathItem[] = profile.experience;
const education: PathItem[] = profile.education;
const capabilities: string[] = profile.capabilities;

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
          {profile.positioning.summary.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <a href="https://www.linkedin.com/in/yago-mendoza" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        </div>
      </div>
    </header>

    <section className="about1-proof" aria-labelledby="about1-proof-title">
      <h2 id="about1-proof-title">In practice</h2>
      <div className="about1-proof-grid">
        {profile.proof.map(item => <p key={item.metric}><strong>{item.metric}</strong><span>{item.description}</span></p>)}
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
