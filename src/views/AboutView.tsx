// About page — bio, philosophy, and CTA

import React from 'react';
import { Link } from 'react-router-dom';
import { RotatingTitle } from '../components/RotatingTitle';

export const AboutView: React.FC = () => {
  return (
    <div className="flex flex-col animate-fade-in">

      {/* Hero: Photo + Name + Rotating subtitle */}
      <section className="pb-16">
        <div className="relative mb-16 pt-4">
          {/* Photo + Quote row */}
          <div className="flex items-center gap-6 mb-6">
            {/* Photo — large, with subtle glow */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 shrink-0">
              <div className="absolute inset-0 rounded-full bg-violet-400/10 blur-2xl scale-125" />
              <img
                src="https://avatars.githubusercontent.com/yago-mendoza"
                alt="Yago Mendoza"
                className="relative w-full h-full rounded-full border border-th-border object-cover"
              />
            </div>

            {/* Quote beside photo */}
            <blockquote className="relative pl-6 pr-6">
              <span
                className="absolute -left-1 -top-2 text-6xl leading-none text-th-heading select-none font-serif"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="text-th-secondary text-lg md:text-xl leading-relaxed italic">
                My competitive advantage is<br className="hidden md:inline" /> that I'm having fun.
                <span className="relative inline-block w-0">
                  <span className="absolute left-0 -bottom-9 text-6xl leading-none text-th-heading select-none font-serif" aria-hidden="true">&rdquo;
                  </span>
                </span>
              </p>
            </blockquote>
          </div>

          {/* Name */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-th-heading mb-2">
            Yago Mendoza
          </h1>

          {/* Rotating subtitle */}
          <p className="text-base text-th-secondary h-6 mb-5">
            <RotatingTitle />
          </p>

          {/* Tagline */}
          <p className="text-th-primary leading-relaxed max-w-xl">
              I'm into building things and making them move faster. I use AI to unlock compute, document everything I learn, and publish it here—because building in public is how I think best.
          </p>
        </div>

        {/* The Journey */}
        <div className="mb-14">
          <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-6">The Journey</h2>

          <div className="space-y-8 max-w-2xl font-sans">
            <div>
              <h3 className="text-th-heading font-semibold mb-2">The Convergence</h3>
              <p className="text-th-secondary leading-relaxed">
                I started on factory floors, studying stress and failure. That industrial engineering foundation defines my code: I design software by understanding what breaks. I don't see hardware and software as separate worlds. The most critical problems—and the biggest breakthroughs—live at the boundary where bits meet atoms.
              </p>
            </div>

            <div>
              <h3 className="text-th-heading font-semibold mb-2">The Work</h3>
              <p className="text-th-secondary leading-relaxed">
                Now those worlds are converging (faster than anyone expected). AI, infrastructure, edge computing—this is where I build. I don't just write code; I study the physics of infrastructure to unlock compute. Whether it's in a hyperscale data center or a constrained edge device, if it involves the friction between software and physics, I'm interested.
              </p>
            </div>

            <div>
              <h3 className="text-th-heading font-semibold mb-2">The Record</h3>
              <p className="text-th-secondary leading-relaxed">
                This site is a living, interconnected record. I document the process because clear thinking requires writing it down.
              </p>
            </div>
          </div>
        </div>

        {/* What I Believe */}
        <div className="mb-14">
          <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-6">What I Believe</h2>

          <div className="space-y-6 max-w-2xl font-sans">
            <p className="text-th-secondary leading-relaxed">
              To truly build, it seems essential to move beyond narrow specialization and understand the entire stack. Removing black boxes—from the bare metal to the reasoning model—allows for genuine agency over the system.
            </p>
            <p className="text-th-secondary leading-relaxed">
              The rate-limiting step for progress often isn't software; it is atoms. Since we cannot cheat thermodynamics, adapting hardware to bridge the gap between digital code and the physical world appears to be the real bottleneck.
            </p>
            <p className="text-th-secondary leading-relaxed">
              Intelligence should arguably be as ubiquitous and invisible as electricity. As demand scales, building the rigorous infrastructure to make compute a silent, fundamental resource becomes the priority.
            </p>
            <p className="text-th-secondary leading-relaxed">
              Optimism is perhaps a necessary, pragmatic stance. It suggests that by solving the hard physical constraints today, we might unlock the freedom to pursue a better future tomorrow.
            </p>
            <p className="text-th-secondary leading-relaxed">
              Passion is likely the highest form of leverage against entropy. Pursuing what one is truly obsessed with isn't just a luxury; it seems to be the only efficient way to sustain the effort required to solve difficult problems.
            </p>
          </div>
        </div>

        {/* Beyond the Stack */}
        <div className="mb-14">
          <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-6">Beyond the Stack</h2>

          <div className="max-w-2xl font-sans">
            <p className="text-th-secondary leading-relaxed">
              Patterns transfer. Outside of engineering, I study organizational design, the history of technology, and the craft of making hard things simple.
            </p>
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
