import React from 'react';
import { RadarLoader } from '../ui/RadarLoader';

export function SearchLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[500px]" role="status" aria-live="polite">
      <RadarLoader />
    </div>
  );
}
