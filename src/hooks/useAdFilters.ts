import { useState, useCallback, useMemo } from 'react';
import type { Ad, DateFilter, DateRange, SortState } from '../types';
import { startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, subMonths, subYears } from 'date-fns';

export function useAdFilters(ads: Ad[]) {
  const [filter, setFilter] = useState('');
  const [excludeFilter, setExcludeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [sort, setSort] = useState<SortState>({ column: 'date', direction: 'desc' });
  const [hideNoPrice, setHideNoPrice] = useState(false);
  const [showReklama5, setShowReklama5] = useState(true);
  const [showPazar3, setShowPazar3] = useState(true);
  const [showItmk, setShowItmk] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSort = useCallback((column: keyof Ad) => {
    setSort(prev => {
      if (prev.column === column) {
        if (prev.direction === 'asc') return { column, direction: 'desc' };
        if (prev.direction === 'desc') return { column: null, direction: null };
      }
      return { column, direction: 'asc' };
    });
  }, []);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const a of ads) if (a.category) cats.add(a.category);
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [ads]);

  const filtered = useMemo(() => {
    let result = ads;

    // Source filter
    if (!showReklama5) result = result.filter(a => a.source !== 'reklama5');
    if (!showPazar3) result = result.filter(a => a.source !== 'pazar3');
    if (!showItmk) result = result.filter(a => a.source !== 'itmk');

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(a => selectedCategories.includes(a.category));
    }

    // Hide no-price ads (also treat 1 MKD / 1 EUR as placeholder "no price")
    if (hideNoPrice) {
      result = result.filter(a => {
        const hasMKD = a.priceMKD !== null && a.priceMKD > 1;
        const hasEUR = a.priceEUR !== null && a.priceEUR > 1;
        return hasMKD || hasEUR;
      });
    }

    // Text filter
    if (filter.trim()) {
      const lower = filter.toLowerCase();
      result = result.filter(
        a =>
          a.title.toLowerCase().includes(lower) ||
          a.city.toLowerCase().includes(lower)
      );
    }

    // Exclude filter
    if (excludeFilter.trim()) {
      const lower = excludeFilter.toLowerCase();
      result = result.filter(
        a =>
          !a.title.toLowerCase().includes(lower) &&
          !a.city.toLowerCase().includes(lower)
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const start = startOfDay(now);
      result = result.filter(a => a.date >= start);
    } else if (dateFilter === 'week') {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      result = result.filter(a => a.date >= start);
    } else if (dateFilter === 'month') {
      const start = startOfMonth(now);
      result = result.filter(a => a.date >= start);
    } else if (dateFilter === '30days') {
      const start = startOfDay(subDays(now, 30));
      result = result.filter(a => a.date >= start);
    } else if (dateFilter === '3months') {
      const start = startOfDay(subMonths(now, 3));
      result = result.filter(a => a.date >= start);
    } else if (dateFilter === '6months') {
      const start = startOfDay(subMonths(now, 6));
      result = result.filter(a => a.date >= start);
    } else if (dateFilter === '1year') {
      const start = startOfDay(subYears(now, 1));
      result = result.filter(a => a.date >= start);
    } else if (dateFilter === 'this_year') {
      const start = startOfYear(now);
      result = result.filter(a => a.date >= start);
    } else if (dateFilter === 'custom' && dateRange.from) {
      const from = startOfDay(dateRange.from);
      const to = dateRange.to ? startOfDay(dateRange.to) : now;
      result = result.filter(a => a.date >= from && a.date <= to);
    }

    // Sort
    if (sort.column && sort.direction) {
      result = [...result].sort((a, b) => {
        const col = sort.column!;
        const aVal = a[col];
        const bVal = b[col];

        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;

        let cmp = 0;
        if (aVal instanceof Date && bVal instanceof Date) {
          cmp = aVal.getTime() - bVal.getTime();
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }

        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [ads, filter, excludeFilter, dateFilter, dateRange, sort, hideNoPrice, showReklama5, showPazar3, showItmk, selectedCategories]);

  return {
    filter,
    setFilter,
    excludeFilter,
    setExcludeFilter,
    dateFilter,
    setDateFilter,
    dateRange,
    setDateRange,
    sort,
    handleSort,
    filtered,
    hideNoPrice,
    setHideNoPrice,
    showReklama5,
    setShowReklama5,
    showPazar3,
    setShowPazar3,
    showItmk,
    setShowItmk,
    selectedCategories,
    setSelectedCategories,
    availableCategories,
  };
}
