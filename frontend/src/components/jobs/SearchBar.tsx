import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Clock } from 'lucide-react';
import { useJobStore } from '@/lib/store/useJobStore';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const { query, setQuery, searchJobs, isSearching } = useJobStore();
  const [localQuery, setLocalQuery] = useState(query);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('careerpilot_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return;
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('careerpilot_recent_searches', JSON.stringify(updated));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localQuery.trim() || isSearching) return;
    saveRecentSearch(localQuery);
    setQuery(localQuery);
    router.push(`/jobs?q=${encodeURIComponent(localQuery)}`);
    searchJobs();
  };

  const handleSuggestionClick = (sug: string) => {
    setLocalQuery(sug);
  };

  const PillButton = ({ text, onClick }: { text: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
      style={{
        background: 'var(--cp-surface)',
        border: '0.5px solid var(--cp-border)',
        color: 'var(--cp-text-secondary)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--cp-accent)';
        (e.currentTarget as HTMLElement).style.color = 'var(--cp-text-primary)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--cp-border)';
        (e.currentTarget as HTMLElement).style.color = 'var(--cp-text-secondary)';
      }}
    >
      {text}
    </button>
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      <form onSubmit={handleSearch} className="relative">
        {focused && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ boxShadow: '0 0 0 3px var(--cp-border-accent)', borderRadius: '12px' }}
          />
        )}

        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Find me ML internships in Dhaka…"
          className="w-full rounded-xl pl-12 pr-28 py-3.5 text-base outline-none transition-all bg-[var(--cp-card)] text-[var(--cp-text-primary)]"
          style={{
            border: `1.5px solid ${focused ? 'var(--cp-accent)' : 'var(--cp-border)'}`,
            boxShadow: '0 2px 8px var(--cp-border)',
          }}
          disabled={isSearching}
        />

        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2"
          size={20}
          strokeWidth={1.5}
          style={{ color: focused ? 'var(--cp-accent)' : 'var(--cp-text-muted)' }}
        />

        <button
          type="submit"
          disabled={!localQuery.trim() || isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-[8px] font-medium text-sm transition-all disabled:opacity-40"
          style={{
            background: 'var(--cp-accent)',
            color: 'var(--cp-bg)',
          }}
        >
          Search
        </button>
      </form>

      {!isSearching && (
        <div className="flex flex-col gap-2.5 mt-1">
          {recentSearches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <Clock size={14} strokeWidth={1.5} style={{ color: 'var(--cp-text-muted)' }} />
              {recentSearches.map((sug, idx) => (
                <PillButton key={`recent-${idx}`} text={sug} onClick={() => handleSuggestionClick(sug)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
