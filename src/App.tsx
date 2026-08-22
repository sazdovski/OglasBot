import { useState } from 'react';
import { useSearch } from './hooks/useSearch';
import { useAdFilters } from './hooks/useAdFilters';
import { useLanguage } from './hooks/useLanguage';
import { SearchBar } from './components/SearchBar';
import { FiltersBar } from './components/FiltersBar';
import { AdTable } from './components/AdTable';
import { AdTiles } from './components/AdTiles';
import { SkeletonTable, EmptyState, ErrorState, WelcomeState } from './components/States';
import { setExchangeRate, getExchangeRate, computePriceStats } from './utils/currency';
import { ITEMS_PER_PAGE } from './config/constants';

export default function App() {
  const [hasSearched, setHasSearched] = useState(false);
  const [lastKeyword, setLastKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [exchangeRate, setRate] = useState(getExchangeRate());
  const [searchKey, setSearchKey] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'tiles'>('table');

  const { language, setLanguage, t } = useLanguage();

  const { ads, loading, error, totalCount, lastUpdated, sourceProgress, search, refresh, cancelSearch, reset } = useSearch();

  const {
    filter, setFilter,
    excludeFilter, setExcludeFilter,
    dateFilter, setDateFilter,
    dateRange, setDateRange,
    sort, handleSort,
    filtered,
    hideNoPrice, setHideNoPrice,
    showReklama5, setShowReklama5,
    showPazar3, setShowPazar3,
    showItmk, setShowItmk,
    selectedCategories, setSelectedCategories,
    availableCategories,
  } = useAdFilters(ads);

  const handleSearch = (keyword: string) => {
    setHasSearched(true);
    setLastKeyword(keyword);
    setPage(1);
    setSelectedCategories([]);
    setFilter('');
    setExcludeFilter('');
    search(keyword);
  };

  const handleReset = () => {
    reset();
    setHasSearched(false);
    setLastKeyword('');
    setPage(1);
    setSearchKey(k => k + 1);
  };

  const handleExchangeRateChange = (rate: number) => {
    setExchangeRate(rate);
    setRate(rate);
    if (ads.length > 0) refresh();
  };

  const priceStats = computePriceStats(filtered);
  const paged = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const showSkeleton = loading && ads.length === 0;
  const showEmpty = !loading && hasSearched && ads.length === 0 && !error;
  const showError = !!error && !loading;
  const showWelcome = !hasSearched && !loading;
  const showTable = ads.length > 0;

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200">
      <header className="border-b border-[#21262d] bg-[#0d1117]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title={t('header.backToHome')}
          >
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-lg tracking-tight">OglasBot</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Source badges */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] bg-orange-900/50 text-orange-400 border border-orange-800 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                reklama5.mk
              </span>
              <span className="text-[10px] sm:text-[11px] bg-blue-900/50 text-blue-400 border border-blue-800 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                pazar3.mk
              </span>
              <span className="text-[10px] sm:text-[11px] bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                it.mk
              </span>
            </div>

            {/* Language switcher */}
            <div className="flex items-center rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
              <button
                onClick={() => setLanguage('mk')}
                className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                  language === 'mk'
                    ? 'bg-[#30363d] text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                title="Македонски"
              >
                МК
              </button>
              <div className="w-px h-3.5 bg-[#30363d]" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-[#30363d] text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                title="English"
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-4 sm:gap-6">
        <SearchBar
          key={searchKey}
          onSearch={handleSearch}
          onRefresh={refresh}
          onCancel={cancelSearch}
          loading={loading}
          lastUpdated={lastUpdated}
          sourceProgress={sourceProgress}
        />

        {(showTable || showSkeleton) && (
          <FiltersBar
            filter={filter}
            onFilterChange={(v) => { setFilter(v); setPage(1); }}
            excludeFilter={excludeFilter}
            onExcludeFilterChange={(v) => { setExcludeFilter(v); setPage(1); }}
            dateFilter={dateFilter}
            onDateFilterChange={(v) => { setDateFilter(v); setPage(1); }}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            totalCount={totalCount}
            filteredCount={filtered.length}
            exchangeRate={exchangeRate}
            onExchangeRateChange={handleExchangeRateChange}
            hideNoPrice={hideNoPrice}
            onHideNoPriceChange={(v) => { setHideNoPrice(v); setPage(1); }}
            showReklama5={showReklama5}
            onShowReklama5Change={(v) => { setShowReklama5(v); setPage(1); }}
            showPazar3={showPazar3}
            onShowPazar3Change={(v) => { setShowPazar3(v); setPage(1); }}
            showItmk={showItmk}
            onShowItmkChange={(v) => { setShowItmk(v); setPage(1); }}
            availableCategories={availableCategories}
            selectedCategories={selectedCategories}
            onSelectedCategoriesChange={(cats) => { setSelectedCategories(cats); setPage(1); }}
            priceStats={priceStats}
          />
        )}

        {showWelcome && <WelcomeState />}
        {showError && <ErrorState message={error!} onRetry={() => handleSearch(lastKeyword)} />}
        {showEmpty && <EmptyState keyword={lastKeyword} />}
        {showSkeleton && <SkeletonTable rows={10} />}

        {showTable && (
          <>
            {/* View mode switcher */}
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setViewMode('table')}
                title={t('view.tableView')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[#30363d] text-white'
                    : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-[#21262d]'
                }`}
              >
                {/* Table icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="3" y1="15" x2="21" y2="15"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('tiles')}
                title={t('view.tilesView')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'tiles'
                    ? 'bg-[#30363d] text-white'
                    : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-[#21262d]'
                }`}
              >
                {/* Grid icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
            </div>

            {viewMode === 'table' ? (
              <AdTable ads={paged} sort={sort} onSort={handleSort} />
            ) : (
              <AdTiles ads={paged} />
            )}

            <div className="flex justify-center items-center gap-3 flex-wrap">
              {totalPages > 1 && (
                <>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed text-sm text-gray-300 transition-colors"
                  >
                    {t('pagination.prev')}
                  </button>
                  <span className="text-gray-500 text-sm">
                    {t('pagination.page', { page, totalPages })}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed text-sm text-gray-300 transition-colors"
                  >
                    {t('pagination.next')}
                  </button>
                </>
              )}
              <select
                value={itemsPerPage}
                onChange={e => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                className="bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-sm text-gray-300 focus:outline-none"
              >
                {[10, 30, 50, 100].map(n => (
                  <option key={n} value={n}>{t('pagination.perPage', { count: n })}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {loading && ads.length > 0 && (
          <div className="text-center text-gray-500 text-sm">
            {t('view.loadedAds', { count: ads.length })}
          </div>
        )}
      </main>
    </div>
  );
}
