import React from 'react';
import { Link } from 'react-router-dom';
import { AboutTopBar } from '../components/personal/AboutTopBar';
import { points as fieldPoints } from '../data/field-of-view.generated.json';
import { secondBrainPath } from '../config/categories';

// The same domains the home map draws, computed from the published work at build time
// (scripts/compute-field-of-view.js), ranked by coverage; each one opens its wikinote.
const territories = [...fieldPoints].filter(p => p.eligible).sort((a, b) => b.support - a.support);
// The dot keeps the colour of the quadrant the domain sits in on that map (x is coverage, y is practical
// emphasis, both 0 to 100 from the bottom-left): oxide for well-covered practical work, blue for
// well-covered essay-led work, grey for thin coverage on either side.
const quadrant = (p: { x: number; y: number }) => p.x < 50 ? 'thin' : p.y >= 50 ? 'practical' : 'essay';
const QUADRANT_LABEL = { practical: 'more coverage, projects and mechanisms', essay: 'more coverage, essay-led', thin: 'less coverage' } as const;

export const AboutView: React.FC = () => (
  <>
  <div className="animate-fade-in max-w-4xl mx-auto about-page">
    <header className="relative isolate pt-4 pb-14 md:pb-20 about-system-header">
      <AboutTopBar active="profile" />
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_15rem] gap-10 md:gap-16 items-end">
        <div>
          <h1 className="text-5xl md:text-7xl font-serif font-normal tracking-[-0.045em] leading-[0.95] text-th-heading">An engineer<br />following systems.</h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-th-secondary font-sans">I move between disciplines to find the structure underneath them: constraints, feedback, capacity, failure and the ways a system changes when reality pushes back.</p>
          {/* The coined title, defined once, where the word is first met. */}
          <p className="about-definition mt-6 max-w-xl text-sm leading-relaxed text-th-tertiary font-sans"><b>AI &amp; Industrial Engineer</b>I work below the interface: the physics, the infrastructure and the failure modes of a system, whatever it runs on.</p>
        </div>
        <figure className="relative w-40 md:w-full aspect-[4/5] order-first md:order-none">
          <span className="about-aperture hidden md:block" aria-hidden="true">
            <i className="field-aperture-disc" style={{ '--aperture': '17px' } as React.CSSProperties}><b /></i>
          </span>
          <div className="absolute inset-0 translate-x-2 translate-y-2 border" style={{ borderColor: 'color-mix(in srgb, var(--brand-oxide-strong) 68%, transparent)' }} aria-hidden="true" />
          <img src="https://avatars.githubusercontent.com/yago-mendoza" alt="Yago Mendoza" className="relative w-full h-full object-cover grayscale contrast-110 border border-th-border" />
        </figure>
      </div>
    </header>

    <section className="grid grid-cols-1 md:grid-cols-[10rem_minmax(0,1fr)] gap-5 md:gap-10 py-10 border-t border-th-border">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-th-tertiary">The point of view</h2>
      <div className="space-y-5 text-base leading-relaxed text-th-secondary font-sans">
        <p>I trained in industrial engineering, where a design eventually meets materials, energy, people, time and failure. That perspective stayed with me as my interests expanded into software, data, AI and intelligence.</p>
        <p>I am less interested in collecting domains than in understanding what transfers between them. A bottleneck in a supply chain, a control loop, a data-centre limit and a cognitive constraint are different problems—but they reward the same habit of looking for structure.</p>
        <p>Most things here exist because they became too interesting to leave alone.</p>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-[10rem_minmax(0,1fr)] gap-5 md:gap-10 py-10 border-t border-th-border">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-th-tertiary">Field of view</h2>
      <div className="flex flex-wrap gap-x-5 gap-y-3">
        {territories.map((item, index) => (
          <Link key={item.id} to={secondBrainPath(item.id)} className="about-field-chip inline-flex items-center gap-2 text-sm text-th-secondary" title={`${item.label}: ${QUADRANT_LABEL[quadrant(item)]}. Opens the wikinote.`}>
            <span className={`about-field-dot is-${quadrant(item)}`} />
            {item.label}<span className="about-list-num about-field-num">0{index + 1}</span>
          </Link>
        ))}
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-[10rem_minmax(0,1fr)] gap-5 md:gap-10 py-10 border-y border-th-border">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-th-tertiary">Working principles</h2>
      <ol className="space-y-5">
        {[
          'Look for the constraint before optimizing the surface.',
          'Make complexity traversable; do not pretend it is simple.',
          'Use models to think, then let reality correct the model.',
          'Build enough to discover what explanation alone cannot.',
          'Keep what survives curiosity; discard the rest.',
        ].map((principle, index) => (
          <li key={principle} className="grid grid-cols-[2.8rem_1fr] gap-3 text-base text-th-secondary font-sans">
            <span className="about-list-num">0{index + 1}</span><span>{principle}</span>
          </li>
        ))}
      </ol>
    </section>

    <section className="py-12 md:py-16">
      <p className="max-w-xl text-2xl md:text-3xl font-serif leading-tight text-th-heading">If you are working on a difficult system or an idea that crosses boundaries, I would probably like to hear about it.</p>
    </section>
  </div>
  </>
);
