import { useState, useCallback } from 'react';
import { DEBOUNCE_MS } from '../config/constants';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  onRefresh: () => void;
  onCancel: () => void;
  loading: boolean;
  lastUpdated: Date | null;
  currentPage: number;
}

export function SearchBar({ onSearch, onRefresh, onCancel, loading, lastUpdated, currentPage }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (timer) clearTimeout(timer);
    if (v.trim().length >= 2) {
      const t = setTimeout(() => onSearch(v.trim()), DEBOUNCE_MS);
      setTimer(t);
    }
  }, [timer, onSearch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (timer) clearTimeout(timer);
    if (value.trim()) onSearch(value.trim());
  }, [value, timer, onSearch]);

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔍</span>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="Search marketplace... (e.g. ipad, iphone, laptop)"
            className="w-full bg-[#161b22] border border-[#30363d] rounded-xl pl-11 pr-4 py-3.5 text-base text-gray-200
              placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
              transition-all shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-semibold text-sm transition-colors shadow-sm whitespace-nowrap"
        >
          Search
        </button>
        {loading ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-gray-300 text-sm transition-colors"
          >
            Cancel
          </button>
        ) : lastUpdated ? (
          <button
            type="button"
            onClick={onRefresh}
            className="px-5 py-3.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-gray-300 text-sm transition-colors"
            title="Refresh results"
          >
            ↺
          </button>
        ) : null}
      </form>

      {loading && (
        <div className="flex items-center gap-3 px-1">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                style={{ animation: `pulse-loading 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <span className="text-gray-500 text-sm">
            Fetching page {currentPage}...
          </span>
        </div>
      )}

      {lastUpdated && !loading && (
        <p className="text-gray-600 text-xs px-1">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
