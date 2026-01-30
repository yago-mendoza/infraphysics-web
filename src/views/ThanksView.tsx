// Thank-you page shown after contact form submission

import React from 'react';
import { Link } from 'react-router-dom';

export const ThanksView: React.FC = () => {
  return (
    <div className="flex flex-col animate-fade-in items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-th-heading mb-3">
        Message received
      </h1>
      <p className="text-th-secondary text-sm font-sans mb-10 max-w-md leading-relaxed">
        Thanks for reaching out. I'll get back to you as soon as I can.
      </p>
      <Link
        to="/home"
        className="px-6 py-2.5 bg-th-active border border-th-border rounded-sm text-th-heading text-sm
                   transition-all hover:bg-th-active-hover hover:border-th-border-hover"
      >
        Back to home
      </Link>
    </div>
  );
};
