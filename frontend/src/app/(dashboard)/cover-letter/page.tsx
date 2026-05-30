'use client';

import React from 'react';
import CoverLetterBuilder from '@/components/CoverLetterBuilder';

export default function CoverLetterWorkspace() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
          AI Cover Letter Generator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
          Draft tailored, high-converting letters matching specific job description vectors.
        </p>
      </div>

      <CoverLetterBuilder />
    </div>
  );
}
