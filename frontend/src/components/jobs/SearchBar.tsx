import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useJobStore } from '@/lib/store/useJobStore';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const { query, setQuery, searchJobs, isSearching } = useJobStore();
  const [localQuery, setLocalQuery] = useState(query);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localQuery.trim() || isSearching) return;
    setQuery(localQuery);
    router.push(`/jobs?q=${encodeURIComponent(localQuery)}`);
    searchJobs();
  };

  const suggestions = [
    "ML Engineer Dhaka",
    "Remote React roles",
    "Data Science internships",
  ];

  const handleSuggestionClick = (sug: string) => {
    setLocalQuery(sug);
    setQuery(sug);
    router.push(`/jobs?q=${encodeURIComponent(sug)}`);
    setTimeout(() => { searchJobs(); }, 0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      <form onSubmit={handleSearch} className="relative">
        {/* Glow ring when focused */}
        {focused && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ boxShadow: '0 0 0 3px rgba(37,99,235,0.2)', borderRadius: '12px' }}
          />
        )}

        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Find me ML internships in Dhaka…"
          className="w-full rounded-xl pl-12 pr-28 py-3.5 text-base outline-none transition-all"
          style={{
            background: 'var(--bg-panel)',
            border: `1.5px solid ${focused ? 'var(--hud-blue)' : 'var(--border)'}`,
            color: 'var(--text-primary)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
          disabled={isSearching}
        />

        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2"
          size={18}
          style={{ color: focused ? 'var(--hud-blue)' : 'var(--text-muted)' }}
        />

        <button
          type="submit"
          disabled={!localQuery.trim() || isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, var(--hud-blue), #7c3aed)',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
          }}
        >
          Search
        </button>
      </form>

      {!isSearching && (
        <div className="flex flex-wrap items-center gap-2 justify-center">
          <Sparkles size={11} style={{ color: 'var(--text-muted)' }} />
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(sug)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--hud-blue)';
                (e.currentTarget as HTMLElement).style.color = 'var(--hud-blue)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
