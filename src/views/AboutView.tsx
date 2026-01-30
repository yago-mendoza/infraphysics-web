// About page — bio, philosophy, and CTA

import React from 'react';
import { Link } from 'react-router-dom';
import { RotatingTitle } from '../components/RotatingTitle';

export const AboutView: React.FC = () => {
  return (
    <div className="flex flex-col animate-fade-in">

      {/* Hero: Name + Rotating subtitle */}
      <section className="pb-16">
        <div className="flex items-center gap-5 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-1">
              Yago Mendoza
            </h1>
            <p className="text-sm text-gray-400 h-5">
              <RotatingTitle />
            </p>
          </div>
        </div>

        {/* The Journey */}
        <div className="mb-14">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-6">The Journey</h2>

          <div className="space-y-7 max-w-2xl font-sans">
            <p className="text-gray-300 leading-relaxed">
              I started in the physical world — industrial engineering, factory floors, atoms.
              Understanding how materials behave under stress, how systems fail, and how processes
              compound. That foundation never left.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Then came software. Not as a career pivot, but as an expansion of the same questions:
              how do you build things that survive contact with reality? I learned to write code
              the way I learned to design processes — by studying what breaks.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Now the two worlds are converging. AI infrastructure, embedded systems, distributed
              architectures — the interesting problems live at the boundary between bits and atoms.
            </p>
            <p className="text-gray-300 leading-relaxed">
              This site is where I think out loud about all of it.
            </p>
          </div>
        </div>

        {/* What I Believe */}
        <div className="mb-14">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-6">What I Believe</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 border border-white/10 rounded-sm bg-white/[0.02]">
              <h3 className="text-white font-semibold mb-2 text-sm">Generalist Advantage</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-sans">
                The best solutions come from people who can hold multiple domains in their head
                simultaneously. Depth matters, but range compounds.
              </p>
            </div>

            <div className="p-5 border border-white/10 rounded-sm bg-white/[0.02]">
              <h3 className="text-white font-semibold mb-2 text-sm">Intelligence is a Resource</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-sans">
                With AI, intelligence becomes an infrastructure problem — something to be provisioned,
                orchestrated, and allocated rather than exclusively hired.
              </p>
            </div>

            <div className="p-5 border border-white/10 rounded-sm bg-white/[0.02]">
              <h3 className="text-white font-semibold mb-2 text-sm">Orchestration over Implementation</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-sans">
                The leverage is in knowing what to build and why, not just how. Systems thinking
                beats local optimization every time.
              </p>
            </div>
          </div>
        </div>

        {/* Beyond the Stack */}
        <div className="mb-14">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-6">Beyond the Stack</h2>

          <div className="space-y-7 max-w-2xl font-sans">
            <p className="text-gray-300 leading-relaxed">
              Outside of engineering, I think about complexity science, organizational design,
              and the craft of making hard things simple. I read broadly — thermodynamics,
              information theory, history of technology — because the patterns transfer.
            </p>
            <p className="text-gray-300 leading-relaxed">
              If you're building something at the intersection of hardware and software,
              or rethinking how teams work with AI, I'd like to hear about it.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm font-sans">
            Want to connect? Head to the{' '}
            <Link to="/contact" className="text-white hover:text-blue-400 transition-colors underline underline-offset-4 decoration-white/30">
              contact page
            </Link>
            {' '}or find me on{' '}
            <a
              href="https://x.com/ymdatweets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors underline underline-offset-4 decoration-white/30"
            >
              &#x1D54F;
            </a>.
          </p>
        </div>
      </section>
    </div>
  );
};
