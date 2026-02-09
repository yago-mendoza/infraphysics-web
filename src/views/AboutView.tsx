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
                className="absolute -left-1 -top-2 text-6xl leading-none text-th-heading select-none"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="text-th-secondary text-lg md:text-xl leading-relaxed italic">
                My competitive advantage is<br className="hidden md:inline" /> that I'm having fun.
                <span className="relative inline-block w-0">
                  <span className="absolute left-0 -bottom-9 text-6xl leading-none text-th-heading select-none" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} aria-hidden="true">&rdquo;
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
              I'm into building things and making them move faster. I use AI to unlock compute, document everything I learn, and publish it here—because building in public is how I think best, and if it helps make complex topics more approachable along the way, even better.
          </p>
        </div>

        {/* The Journey */}
        <div className="mb-14">
          <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-6">The Journey</h2>

          <div className="space-y-8 max-w-2xl font-sans">
            <div>
              <h3 className="text-th-heading font-semibold mb-2">The Convergence</h3>
              <p className="text-th-secondary leading-relaxed">
                I learned to build by watching systems fail. My industrial engineering training: design from the failure point backward: find the bottleneck, then architect around it. Hardware and software aren't separate worlds to me; they're two sides of the same constraint. The critical problems live where bits meet atoms.
              </p>
              
            </div>

            <div>
              <h3 className="text-th-heading font-semibold mb-2">The Work</h3>
              <p className="text-th-secondary leading-relaxed">
              Those worlds are converging faster than anyone expected. AI, infrastructure, distributed systems. This is where I build. I'm drawn to problems where software meets physical limits. Whether it's in a hyperscale data center or a constrained edge device, I want to understand the physics, not just abstract it away.
              </p>
            </div>

            <div>
              <h3 className="text-th-heading font-semibold mb-2">The Record</h3>
              <p className="text-th-secondary leading-relaxed">
                This site is a living, interconnected record. I document the process because clear thinking requires writing it down. I'm not an expert in any of this—I'm a generalist who stacks knowledge across domains and connects the dots. This site reflects that: work in progress, not finished reference.
              </p>
            </div>
          </div>
        </div>

        {/* What I Believe */}
        <div className="mb-14">
          <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-6">What I Believe</h2>

          <div className="space-y-4 max-w-2xl font-sans">
            <div className="flex gap-3">
              <span className="text-th-tertiary shrink-0 mt-0.5">—</span>
              <p className="text-th-secondary leading-relaxed">To truly build, you have to understand the full stack—not just your slice of it. Removing black boxes, from hardware to the models running on it, is what gives you real agency over what you're building.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-th-tertiary shrink-0 mt-0.5">—</span>
              <p className="text-th-secondary leading-relaxed">The bottleneck is rarely software—it's physics. We cannot cheat thermodynamics. The real work is building infrastructure that satisfies physical constraints at scale, from data centers to edge devices. That's what actually accelerates progress.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-th-tertiary shrink-0 mt-0.5">—</span>
              <p className="text-th-secondary leading-relaxed">Intelligence should be as ubiquitous and invisible as electricity. Making compute a silent, fundamental resource—that's the infrastructure I want to build.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-th-tertiary shrink-0 mt-0.5">—</span>
              <p className="text-th-secondary leading-relaxed">Complexity is debt, not progress. The instinct to question what exists before optimizing it—to ask why before how—matters more than any specific skill.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-th-tertiary shrink-0 mt-0.5">—</span>
              <p className="text-th-secondary leading-relaxed">The patterns that scale are the ones that transfer. The same structural thinking that optimizes a supply chain can redesign a data pipeline—not because the tools overlap, but because the constraints do. I trust principles over specialization.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-th-tertiary shrink-0 mt-0.5">—</span>
              <p className="text-th-secondary leading-relaxed">In a world of infinite problems and finite time, passion is the only sustainable filter. I work on what I can't stop thinking about—because that's the only way to outlast hard problems. Obsession compounds.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-th-tertiary shrink-0 mt-0.5">—</span>
              <p className="text-th-secondary leading-relaxed">The future is bright.</p>
            </div>
          </div>
        </div>

        {/* Beyond the Stack */}
        <div className="mb-14">
          <h2 className="text-xs text-th-tertiary uppercase tracking-wider mb-6">Beyond the Stack</h2>

          <div className="space-y-6 max-w-2xl font-sans">
            <p className="text-th-secondary leading-relaxed">
              I study how organizations scale, how technologies fail, and how to make hard things feel simple. It turns out patterns surface everywhere. The best engineers I know aren't just good at code—they're good at understanding why systems exist the way they do.
            </p>
            <p className="text-th-secondary leading-relaxed">
              Outside of engineering, I try to keep things simple. I read because good writing forces clear thinking, and I write to figure out what I actually believe. Most of what I learn gets documented because patterns are easier to catch when they're on paper. Memory is terrible at version control.
            </p>
            <p className="text-th-secondary leading-relaxed">
              I lift weights, eat well, sleep enough. Boring fundamentals, but they work. The goal in all of it is the same: understand better, need less.
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
