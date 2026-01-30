// About page — bio, philosophy, and CTA

import React from 'react';
import { Link } from 'react-router-dom';
import { RotatingTitle } from '../components/RotatingTitle';

const skills = [
  'systems design',
  'AI infrastructure',
  'embedded systems',
  'distributed architecture',
  'industrial engineering',
  'complexity science',
];

export const AboutView: React.FC = () => {
  return (
    <div className="flex flex-col animate-fade-in">

      {/* Hero: Photo + Name + Rotating subtitle */}
      <section className="pb-16">
        <div className="flex items-center gap-5 mb-12">
          <img
            src="https://avatars.githubusercontent.com/yago-mendoza"
            alt="Yago Mendoza"
            className="w-20 h-20 rounded-full border-2 border-th-border object-cover"
          />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-th-heading mb-1">
              Yago Mendoza
            </h1>
            <p className="text-sm text-th-secondary h-5">
              <RotatingTitle />
            </p>
          </div>
        </div>

        {/* The Journey */}
        <div className="mb-14">
          <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-6">The Journey</h2>

          <div className="space-y-8 max-w-2xl font-sans">
            <p className="text-th-secondary leading-relaxed border-l-2 border-th-border pl-5">
              I started in the physical world. Industrial engineering. Factory floors. Understanding
              how materials behave under stress, how systems fail, how processes compound. That
              foundation never left.
            </p>
            <p className="text-th-secondary leading-relaxed">
              Then came software — not as a pivot, but as the same questions asked in a different
              substrate. I learned to write code the way I learned to design processes: by studying
              what breaks.
            </p>

            <blockquote className="border-l-2 border-violet-400/40 pl-5 py-2">
              <p className="text-th-primary leading-relaxed italic">
                "The interesting problems live at the boundary between bits and atoms."
              </p>
            </blockquote>

            <p className="text-th-secondary leading-relaxed">
              Now both worlds are converging faster than anyone expected. AI infrastructure, embedded
              systems, edge computing — the boundary is where everything happens. And it's where I build.
            </p>
            <p className="text-th-secondary leading-relaxed">
              Industrial engineer turned systems builder. I use AI to unlock compute, document
              everything I learn, and publish it here — because building in public is how I think best.
            </p>
            <p className="text-th-secondary leading-relaxed">
              This site is where I document everything I learn. A living record. Interconnected,
              permanent, honest.
            </p>
          </div>
        </div>

        {/* What I Believe */}
        <div className="mb-14">
          <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-6">What I Believe</h2>

          <div className="space-y-6 max-w-2xl font-sans">
            <p className="text-th-secondary leading-relaxed">
              I tend to approach things from a physics framework — reason from first principles, then build.
            </p>
            <p className="text-th-heading leading-relaxed font-semibold text-lg">
              My competitive advantage is that I'm having fun.
            </p>
            <p className="text-th-secondary leading-relaxed">
              Without hardware, software is dead. The real breakthroughs happen where bits meet atoms.
            </p>
            <p className="text-th-secondary leading-relaxed">
              AI is not magic. It's compute — and the faster we push it to the edge, the faster everything accelerates.
            </p>
            <p className="text-th-secondary leading-relaxed">
              I'd rather be optimistic and wrong than pessimistic and right.
            </p>
            <p className="text-th-secondary leading-relaxed">
              People should pursue what they're passionate about. That will make them happier than pretty much anything else.
            </p>
          </div>
        </div>

        {/* Beyond the Stack */}
        <div className="mb-14">
          <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-6">Beyond the Stack</h2>

          <div className="max-w-2xl font-sans">
            <p className="text-th-secondary leading-relaxed mb-8">
              Outside of engineering, I think about complexity science, organizational design,
              and the craft of making hard things simple. I read broadly — thermodynamics,
              information theory, history of technology — because the patterns transfer.
            </p>

            <div className="border-t border-th-border pt-8">
              <p className="text-th-secondary leading-relaxed">
                If you're building something at the intersection of hardware and software,
                or rethinking how teams work with AI, I'd like to hear about it.
              </p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-14">
          <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-6">Skills & Interests</h2>

          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span
                key={skill}
                className="px-3 py-1 text-sm text-th-secondary border border-th-border rounded-full bg-th-surface"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-8 border-t border-th-border">
          <p className="text-th-secondary text-sm font-sans">
            Want to connect? Head to the{' '}
            <Link to="/contact" className="text-th-heading hover:text-blue-400 transition-colors underline underline-offset-4 decoration-th-border">
              contact page
            </Link>
            {' '}or find me on{' '}
            <a
              href="https://x.com/ymdatweets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-th-heading hover:text-blue-400 transition-colors underline underline-offset-4 decoration-th-border"
            >
              &#x1D54F;
            </a>.
          </p>
        </div>
      </section>
    </div>
  );
};
