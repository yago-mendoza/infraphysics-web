// Thank-you page shown after contact form submission

import React from 'react';
import { Link } from 'react-router-dom';

export const ThanksView: React.FC = () => {
  return (
    <div className="flex flex-col animate-fade-in items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
        Message received
      </h1>
      <p className="text-gray-400 text-sm font-sans mb-10 max-w-md leading-relaxed">
        Thanks for reaching out. I'll get back to you as soon as I can.
      </p>
      <Link
        to="/home"
        className="px-6 py-2.5 bg-white/10 border border-white/10 rounded-sm text-white text-sm
                   transition-all hover:bg-white/15 hover:border-white/20"
      >
        Back to home
      </Link>
    </div>
  );
};
