import { useState, useRef, useCallback } from 'react';
import type { Ad } from '../types';
import { fetchAds } from '../services/searchService';

interface UseSearchReturn {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  lastUpdated: Date | null;
  currentPage: number;
  search: (keyword: string) => void;
  refresh: () => void;
  cancelSearch: () => void;
}

export function useSearch(): UseSearchReturn {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastKeyword, setLastKeyword] = useState('');

  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAds([]);
    setError(null);
    setLoading(true);
    setCurrentPage(0);
    setLastKeyword(keyword);

    try {
      await fetchAds(
        keyword,
        (partial, page) => {
          setAds([...partial]);
          setCurrentPage(page);
        },
        controller.signal
      );
      setLastUpdated(new Date());
    } catch (err) {
      if (!controller.signal.aborted) {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSearch = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    if (lastKeyword) runSearch(lastKeyword);
  }, [lastKeyword, runSearch]);

  return {
    ads,
    loading,
    error,
    totalCount: ads.length,
    lastUpdated,
    currentPage,
    search: runSearch,
    refresh,
    cancelSearch,
  };
}
