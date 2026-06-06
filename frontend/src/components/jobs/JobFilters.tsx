import React from 'react';
import { useJobStore } from '@/lib/store/useJobStore';

export function JobFilters() {
  const { filters, setFilters, searchJobs } = useJobStore();

  const handleApply = () => {
    searchJobs();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">Location</label>
        <input 
          type="text"
          value={filters.location || ''}
          onChange={e => setFilters({ location: e.target.value })}
          placeholder="e.g. Remote, Dhaka"
          className="w-full bg-inset border border-panel-border rounded text-sm px-3 py-2 text-primary focus:outline-none focus:border-hud-blue transition-colors"
        />
      </div>
      
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">Job Type</label>
        <div className="flex flex-col gap-2">
          {['full-time', 'part-time', 'internship', 'contract'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="jobType" 
                value={type}
                checked={filters.jobType === type}
                onChange={() => setFilters({ jobType: type as any })}
                className="w-4 h-4 text-hud-blue bg-inset border-panel-border focus:ring-hud-blue focus:ring-1"
              />
              <span className="text-sm text-secondary capitalize">{type.replace('-', ' ')}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="jobType" 
              value=""
              checked={!filters.jobType}
              onChange={() => setFilters({ jobType: undefined })}
              className="w-4 h-4 text-hud-blue bg-inset border-panel-border focus:ring-hud-blue focus:ring-1"
            />
            <span className="text-sm text-secondary">Any</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">
          Min Fit Score: {filters.minFitScore || 0}
        </label>
        <input 
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.minFitScore || 0}
          onChange={e => setFilters({ minFitScore: parseInt(e.target.value) })}
          className="w-full accent-hud-blue"
        />
      </div>
      
      <button 
        onClick={handleApply}
        className="w-full py-2 bg-panel border border-hud-blue text-hud-blue rounded-md text-sm font-semibold hover:bg-hud-blue/10 transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
}
