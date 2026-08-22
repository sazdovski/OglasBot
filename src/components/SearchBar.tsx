import { useState, useCallback } from 'react';
import { DEBOUNCE_MS } from '../config/constants';
import { useLanguage } from '../hooks/useLanguage';
import type { SourceProgressMap } from '../services/searchService';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  onRefresh: () => void;
  onCancel: () => void;
  loading: boolean;
  lastUpdated: Date | null;
  sourceProgress: SourceProgressMap;
}

export function SearchBar({ onSearch, onRefresh, onCancel, loading, lastUpdated, sourceProgress }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();

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
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔍</span>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={t('search.placeholder')}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-xl pl-11 pr-4 py-3.5 text-base text-gray-200
              placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
              transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-semibold text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            {t('search.button')}
          </button>
          {loading ? (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none px-5 py-3.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-gray-300 text-sm transition-colors whitespace-nowrap"
            >
              {t('search.cancel')}
            </button>
          ) : lastUpdated ? (
            <button
              type="button"
              onClick={onRefresh}
              className="px-5 py-3.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-gray-300 text-sm transition-colors"
              title={t('search.refreshTooltip')}
            >
              ↺
            </button>
          ) : null}
        </div>
      </form>

      {(loading || lastUpdated) && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
          {([
            ['reklama5', 'Reklama5'],
            ['pazar3', 'Pazar3'],
            ['itmk', 'IT.mk'],
          ] as const).map(([source, label]) => {
            const progress = sourceProgress[source];
            return (
              <div key={source} className="flex items-center gap-2 text-sm">
                {progress.status === 'loading' ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-700 border-t-blue-400 animate-spin" />
                ) : progress.status === 'done' ? (
                  <span className="text-emerald-400 font-bold">✓</span>
                ) : (
                  <span className="text-red-400 font-bold">!</span>
                )}
                <span className="text-gray-400">
                  <span className="font-medium text-gray-300">{label}:</span>{' '}
                  {t('search.adsFound', { count: progress.count })}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {lastUpdated && !loading && (
        <p className="text-gray-600 text-xs px-1">
          {t('search.lastUpdated', { time: lastUpdated.toLocaleTimeString() })}
        </p>
      )}
    </div>
  );
}
