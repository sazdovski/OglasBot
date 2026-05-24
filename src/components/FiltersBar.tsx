import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DateFilter, DateRange } from '../types';

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: '30days', label: 'Last 30 Days' },
  { key: '3months', label: 'Last 3 Months' },
  { key: '6months', label: 'Last 6 Months' },
  { key: '1year', label: 'Last 1 Year' },
  { key: 'custom', label: 'Custom Range' },
];

interface FiltersBarProps {
  filter: string;
  onFilterChange: (v: string) => void;
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
}

export function FiltersBar({
  filter,
  onFilterChange,
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
    <div className="flex flex-wrap gap-3 items-center">
      {/* Text filter */}
      <div className="relative flex-1" style={{ minWidth: '200px' }}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔎</span>
        <input
          type="text"
          placeholder="Filter results..."
          value={filter}
          onChange={e => onFilterChange(e.target.value)}
          className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200
            placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Category multiselect */}
      {availableCategories.length > 0 && (
        <div className="relative" ref={catRef}>
          <button
            onClick={() => setCatOpen(o => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
              ${
                selectedCategories.length > 0
                  ? 'bg-violet-900/60 text-violet-300 border border-violet-700'
                  : 'bg-[#21262d] text-gray-400 hover:text-gray-200 hover:bg-[#30363d]'
              }`}
          >
            Categories
            {selectedCategories.length > 0 && (
              <span className="bg-violet-600 text-white rounded-full px-1.5 py-0 text-[10px] font-bold">
                {selectedCategories.length}
              </span>
            )}
            <span className="text-gray-500">{catOpen ? '▲' : '▼'}</span>
          </button>
          {catOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl min-w-48 max-h-72 overflow-y-auto">
              {selectedCategories.length > 0 && (
                <div className="px-3 py-1.5 border-b border-[#30363d]">
                  <button
                    onClick={() => onSelectedCategoriesChange([])}
                    className="text-[10px] text-violet-400 hover:text-violet-200 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
              {availableCategories.map(cat => (
                <label
                  key={cat}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-[#21262d] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="accent-violet-500 w-3.5 h-3.5 rounded"
                  />
                  {cat}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Source toggles */}
      <div className="flex gap-1.5">
        <button
          onClick={() => onShowReklama5Change(!showReklama5)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
            ${showReklama5
              ? 'bg-orange-900/60 text-orange-300 border border-orange-700'
              : 'bg-[#21262d] text-gray-500 hover:bg-[#30363d]'}
          `}
        >
          Reklama5
        </button>
        <button
          onClick={() => onShowPazar3Change(!showPazar3)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
            ${showPazar3
              ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
              : 'bg-[#21262d] text-gray-500 hover:bg-[#30363d]'}
          `}
        >
          Pazar3
        </button>
      </div>

      {/* Hide no price */}
      <button
        onClick={() => onHideNoPriceChange(!hideNoPrice)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
          ${hideNoPrice
            ? 'bg-emerald-700 text-emerald-100'
            : 'bg-[#21262d] text-gray-400 hover:text-gray-200 hover:bg-[#30363d]'}
        `}
      >
        {hideNoPrice ? '✓ Hide No Price' : 'Hide No Price'}
      </button>

      {/* Date filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {DATE_FILTERS.map(df => (
          <button
            key={df.key}
            onClick={() => onDateFilterChange(df.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
              ${dateFilter === df.key
                ? 'bg-blue-600 text-white'
                : 'bg-[#21262d] text-gray-400 hover:text-gray-200 hover:bg-[#30363d]'}
            `}
          >
            {df.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {dateFilter === 'custom' && (
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
            onChange={e => onDateRangeChange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : null })}
            className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-gray-300
              focus:outline-none focus:border-blue-500 transition-colors"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="date"
            value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
            onChange={e => onDateRangeChange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : null })}
            className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-gray-300
              focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      )}

      {/* Exchange rate */}
      <div className="relative">
        {showRateEditor ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">1€ =</span>
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
              className="w-20 bg-[#161b22] border border-blue-500 rounded-lg px-2 py-1.5 text-sm text-gray-200
                focus:outline-none"
            />
            <span className="text-gray-500 text-xs">МКД</span>
          </div>
        ) : (
          <button
            onClick={() => { setRateInput(String(exchangeRate)); setShowRateEditor(true); }}
            className="px-3 py-1.5 rounded-lg bg-[#21262d] text-xs text-gray-400 hover:text-gray-200
              hover:bg-[#30363d] transition-colors whitespace-nowrap"
            title="Click to edit exchange rate"
          >
            1€ = {exchangeRate} МКД
          </button>
        )}
      </div>

      {/* Count */}
      {totalCount > 0 && (
        <span className="text-gray-500 text-xs whitespace-nowrap">
          {filteredCount === totalCount
            ? `${totalCount} ads`
            : `${filteredCount} / ${totalCount} ads`}
        </span>
      )}
    </div>
  );
}
