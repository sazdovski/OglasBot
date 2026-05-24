export type AdSource = 'reklama5' | 'pazar3';

export interface RawAd {
  adId: number;
  title: string;
  priceRaw: string;
  currency: 'MKD' | 'EUR' | null;
  city: string;
  date: string;
  imageUrl: string;
  url: string;
  source: AdSource;
  category: string;
}

export interface Ad {
  id: number;
  title: string;
  priceMKD: number | null;
  priceEUR: number | null;
  city: string;
  date: Date;
  dateFormatted: string;
  imageUrl: string;
  url: string;
  source: AdSource;
  category: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: keyof Ad | null;
  direction: SortDirection;
}

export type DateFilter = 'today' | 'week' | 'month' | '30days' | '3months' | '6months' | '1year' | 'all' | 'custom';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface SearchState {
  keyword: string;
  page: number;
  totalCount: number;
  ads: Ad[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
