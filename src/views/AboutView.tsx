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
            src="https://media.licdn.com/dms/image/v2/D4D03AQH7g1Va8BZnjg/profile-displayphoto-scale_400_400/B4DZj3J3deH4Ak-/0/1756493215681?e=1771459200&v=beta&t=94eGn8VW4rNUScGZxYeXNWvMGHaE9BJcuM1Qh4yhJjY"
            alt="Yago Mendoza"
            className="w-20 h-20 rounded-full border-2 border-white/10 object-cover"
          />
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

          <div className="space-y-8 max-w-2xl font-sans">
            <p className="text-gray-300 leading-relaxed border-l-2 border-white/10 pl-5">
              I started in the physical world — industrial engineering, factory floors, atoms.
              Understanding how materials behave under stress, how systems fail, and how processes
              compound. That foundation never left.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Then came software. Not as a career pivot, but as an expansion of the same questions:
              how do you build things that survive contact with reality? I learned to write code
              the way I learned to design processes — by studying what breaks.
            </p>

            <blockquote className="border-l-2 border-violet-400/40 pl-5 py-2">
              <p className="text-gray-200 leading-relaxed italic">
                "The interesting problems live at the boundary between bits and atoms."
              </p>
            </blockquote>

            <p className="text-gray-300 leading-relaxed">
              Now the two worlds are converging. AI infrastructure, embedded systems, distributed
              architectures — that boundary is where I build.
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

          <div className="max-w-2xl font-sans">
            <p className="text-gray-300 leading-relaxed mb-8">
              Outside of engineering, I think about complexity science, organizational design,
              and the craft of making hard things simple. I read broadly — thermodynamics,
              information theory, history of technology — because the patterns transfer.
            </p>

            <div className="border-t border-white/10 pt-8">
              <p className="text-gray-300 leading-relaxed">
                If you're building something at the intersection of hardware and software,
                or rethinking how teams work with AI, I'd like to hear about it.
              </p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-14">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-6">Skills & Interests</h2>

          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span
                key={skill}
                className="px-3 py-1 text-sm text-gray-300 border border-white/10 rounded-full bg-white/[0.02]"
              >
                {skill}
              </span>
            ))}
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
