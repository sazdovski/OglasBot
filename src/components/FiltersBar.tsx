import { useState, useRef, useEffect, useCallback } from 'react';
import type { DateFilter, DateRange } from '../types';
import type { PriceStats } from '../utils/currency';

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: '30days', label: '30 Days' },
  { key: '3months', label: '3 Months' },
  { key: '6months', label: '6 Months' },
  { key: '1year', label: '1 Year' },
  { key: 'custom', label: 'Custom' },
];

function Divider() {
  return <div className="w-px h-5 bg-[#21262d] shrink-0" />;
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface FiltersBarProps {
  filter: string;
  onFilterChange: (v: string) => void;
  excludeFilter: string;
  onExcludeFilterChange: (v: string) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (v: DateFilter) => void;
  dateRange: DateRange;
  onDateRangeChange: (r: DateRange) => void;
  totalCount: number;
  filteredCount: number;
  exchangeRate: number;
  onExchangeRateChange: (r: number) => void;
  hideNoPrice: boolean;
  onHideNoPriceChange: (v: boolean) => void;
  showReklama5: boolean;
  onShowReklama5Change: (v: boolean) => void;
  showPazar3: boolean;
  onShowPazar3Change: (v: boolean) => void;
  availableCategories: string[];
  selectedCategories: string[];
  onSelectedCategoriesChange: (cats: string[]) => void;
  priceStats?: PriceStats | null;
}

export function FiltersBar({
  filter,
  onFilterChange,
  excludeFilter,
  onExcludeFilterChange,
  dateFilter,
  onDateFilterChange,
  dateRange,
  onDateRangeChange,
  totalCount,
  filteredCount,
  exchangeRate,
  onExchangeRateChange,
  hideNoPrice,
  onHideNoPriceChange,
  showReklama5,
  onShowReklama5Change,
  showPazar3,
  onShowPazar3Change,
  availableCategories,
  selectedCategories,
  onSelectedCategoriesChange,
  priceStats,
}: FiltersBarProps) {
  const [showRateEditor, setShowRateEditor] = useState(false);
  const [rateInput, setRateInput] = useState(String(exchangeRate));
  const rateRef = useRef<HTMLInputElement>(null);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showRateEditor) rateRef.current?.focus();
  }, [showRateEditor]);

  useEffect(() => {
    if (!catOpen) return;
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [catOpen]);

  const toggleCategory = useCallback((cat: string) => {
    onSelectedCategoriesChange(
      selectedCategories.includes(cat)
        ? selectedCategories.filter(c => c !== cat)
        : [...selectedCategories, cat]
    );
  }, [selectedCategories, onSelectedCategoriesChange]);

  return (
    <div className="rounded-xl border border-[#21262d] bg-[#0d1117] divide-y divide-[#21262d]">

      {/* ── Row 1: Controls ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:h-11 overflow-visible">

        {/* Mobile row 1 / Desktop: text filter + exclude filter */}
        <div className="flex items-center flex-1 min-w-0 border-b border-[#21262d] md:border-b-0 divide-x divide-[#21262d]">
          {/* Include filter */}
          <div className="flex items-center gap-2 flex-1 min-w-0 px-4 h-11">
            <svg className="shrink-0 text-gray-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Filter results..."
              value={filter}
              onChange={e => onFilterChange(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
            />
            {filter && (
              <button onClick={() => onFilterChange('')} className="shrink-0 text-gray-600 hover:text-gray-400 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Exclude filter */}
          <div className="flex items-center gap-2 flex-1 min-w-0 px-4 h-11"
            style={{ boxShadow: excludeFilter ? 'inset 0 0 0 1px rgba(239,68,68,0.35)' : undefined }}>
            <svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={excludeFilter ? 'rgba(239,68,68,0.7)' : 'rgb(75,85,99)'} strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              <path d="M7.5 7.5l7 7" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Excludes..."
              value={excludeFilter}
              onChange={e => onExcludeFilterChange(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm placeholder-[rgba(239,68,68,0.4)] focus:outline-none"
              style={{
                color: excludeFilter ? 'rgba(239,68,68,0.85)' : undefined,
                caretColor: 'rgba(239,68,68,0.85)',
              }}
            />
            {excludeFilter && (
              <button onClick={() => onExcludeFilterChange('')} className="shrink-0 text-red-500/50 hover:text-red-400 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile row 2 / Desktop inline: sources + category + no price */}
        <div className="flex items-center h-11 md:h-full border-b border-[#21262d] md:border-b-0 overflow-visible">
          <span className="hidden md:block w-px h-5 bg-[#21262d] shrink-0" />

          {/* Source toggles */}
          <div className="flex items-center gap-1 shrink-0 h-full px-3">
            <button
              onClick={() => onShowReklama5Change(!showReklama5)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                ${showReklama5 ? 'bg-orange-500/15 text-orange-400' : 'text-gray-600 hover:text-gray-400'}`}
            >
              Reklama5
            </button>
            <button
              onClick={() => onShowPazar3Change(!showPazar3)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                ${showPazar3 ? 'bg-blue-500/15 text-blue-400' : 'text-gray-600 hover:text-gray-400'}`}
            >
              Pazar3
            </button>
          </div>

          {/* Category multiselect */}
          {availableCategories.length > 0 && (
            <>
              <Divider />
              <div className="relative shrink-0 h-full flex items-center px-4" ref={catRef}>
              <button
                onClick={() => setCatOpen(o => !o)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap
                  ${selectedCategories.length > 0 ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h8M4 18h4" />
                </svg>
                Category
                {selectedCategories.length > 0 && (
                  <span className="bg-violet-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                    {selectedCategories.length}
                  </span>
                )}
              </button>

              {catOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl shadow-black/50 w-60 max-h-72 overflow-y-auto">
                  <div className="px-4 py-2.5 border-b border-[#21262d] flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Categories</span>
                    {selectedCategories.length > 0 && (
                      <button
                        onClick={() => onSelectedCategoriesChange([])}
                        className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {availableCategories.map(cat => {
                    const checked = selectedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#161b22] transition-colors"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                          ${checked ? 'bg-violet-600 border-violet-600' : 'border-[#30363d] bg-transparent'}`}>
                          {checked && <CheckIcon />}
                        </div>
                        <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleCategory(cat)} />
                        <span className="text-xs text-gray-300 leading-snug">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              </div>
            </>
          )}

          <Divider />

          {/* Hide no price */}
          <div className="shrink-0 h-full flex items-center px-4">
          <button
            onClick={() => onHideNoPriceChange(!hideNoPrice)}
            className={`flex items-center gap-2 text-xs font-medium transition-colors
              ${hideNoPrice ? 'text-emerald-400' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
              ${hideNoPrice ? 'bg-emerald-600 border-emerald-600' : 'border-[#30363d]'}`}>
              {hideNoPrice && <CheckIcon />}
            </div>
            No Price
          </button>
          </div>
        </div>{/* end mobile row 2 */}

        {/* Mobile row 3 / Desktop inline: exchange rate + count */}
        <div className="flex items-center h-11 md:h-full overflow-x-auto md:overflow-visible">
          <span className="hidden md:block w-px h-5 bg-[#21262d] shrink-0" />

          {/* Exchange rate */}
          <div className="shrink-0 h-full flex items-center px-4">
          {showRateEditor ? (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 text-xs">1€ =</span>
              <input
                ref={rateRef}
                type="number"
                value={rateInput}
                onChange={e => setRateInput(e.target.value)}
                onBlur={() => {
                  const val = parseFloat(rateInput);
                  if (!isNaN(val) && val > 0) onExchangeRateChange(val);
                  setShowRateEditor(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') { setRateInput(String(exchangeRate)); setShowRateEditor(false); }
                }}
                className="w-16 bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-gray-600 text-xs">МКД</span>
            </div>
          ) : (
            <button
              onClick={() => { setRateInput(String(exchangeRate)); setShowRateEditor(true); }}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors whitespace-nowrap"
              title="Click to edit exchange rate"
            >
              1€ = {exchangeRate} МКД
            </button>
          )}
        </div>

          {/* Count */}
          {totalCount > 0 && (
            <>
              <Divider />
              <div className="shrink-0 px-4 flex items-center h-full">
                <span className="text-gray-600 text-xs whitespace-nowrap tabular-nums">
                  {filteredCount === totalCount
                    ? `${totalCount} ads`
                    : `${filteredCount} / ${totalCount} ads`}
                </span>
              </div>
            </>
          )}
        </div>{/* end mobile row 3 */}
      </div>

      {/* ── Row 1b: Price stats ─────────────────────────────────── */}
      {priceStats && (
        <div className="flex items-center gap-1 px-4 h-9 overflow-x-auto">
          <span className="text-[11px] text-gray-600 uppercase tracking-wider font-medium shrink-0">Price stats (€):</span>
          <span className="mx-2 w-px h-4 bg-[#21262d] shrink-0" />
          <span className="text-xs text-gray-500 shrink-0">P10 <span className="text-gray-300 font-medium tabular-nums">{priceStats.p10} €</span></span>
          <span className="mx-2 w-px h-4 bg-[#21262d] shrink-0" />
          <span className="text-xs text-gray-500 shrink-0">Median <span className="text-white font-semibold tabular-nums">{priceStats.median} €</span></span>
          <span className="mx-2 w-px h-4 bg-[#21262d] shrink-0" />
          <span className="text-xs text-gray-500 shrink-0">P90 <span className="text-gray-300 font-medium tabular-nums">{priceStats.p90} €</span></span>
          <span className="mx-2 w-px h-4 bg-[#21262d] shrink-0" />
          <span className="text-xs text-gray-500 shrink-0">Avg <span className="text-gray-300 font-medium tabular-nums">{priceStats.trimmedMean} €</span></span>
        </div>
      )}

      {/* ── Row 2: Date filters ──────────────────────────────────── */}
      <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
        {DATE_FILTERS.map(df => (
          <button
            key={df.key}
            onClick={() => onDateFilterChange(df.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0
              ${dateFilter === df.key
                ? 'bg-[#21262d] text-white'
                : 'text-gray-600 hover:text-gray-400'}`}
          >
            {df.label}
          </button>
        ))}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 ml-2 shrink-0">
            <input
              type="date"
              value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
              onChange={e => onDateRangeChange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : null })}
              className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="text-gray-600 text-xs">—</span>
            <input
              type="date"
              value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
              onChange={e => onDateRangeChange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : null })}
              className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        )}
      </div>

    </div>
  );
}
