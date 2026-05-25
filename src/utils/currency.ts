import { DEFAULT_MKD_TO_EUR } from '../config/constants';
import type { Ad } from '../types';

let exchangeRate = DEFAULT_MKD_TO_EUR;

export function setExchangeRate(rate: number) {
  exchangeRate = rate;
}

export function getExchangeRate(): number {
  return exchangeRate;
}

export function mkdToEur(mkd: number): number {
  return Math.round(mkd / exchangeRate);
}

export function eurToMkd(eur: number): number {
  return Math.round(eur * exchangeRate);
}

export interface PriceStats {
  median: number;
  p10: number;
  p90: number;
  trimmedMean: number;
  count: number;
}

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

export function computePriceStats(ads: Ad[]): PriceStats | null {
  const prices = ads
    .map(a => a.priceEUR)
    .filter((p): p is number => p !== null && p > 0)
    .sort((a, b) => a - b);

  if (prices.length < 3) return null;

  const p10 = percentile(prices, 10);
  const p50 = percentile(prices, 50);
  const p90 = percentile(prices, 90);

  const lo = Math.floor(0.1 * (prices.length - 1));
  const hi = Math.ceil(0.9 * (prices.length - 1));
  const trimmed = prices.slice(lo, hi + 1);
  const trimmedMean = Math.round(trimmed.reduce((s, v) => s + v, 0) / trimmed.length);

  return { median: p50, p10, p90, trimmedMean, count: prices.length };
}

export function formatMKD(value: number | null): string {
  if (value === null || value === 0) return 'No Price';
  return `${value.toLocaleString('mk-MK')} МКД`;
}

export function formatEUR(value: number | null): string {
  if (value === null || value === 0) return 'No Price';
  return `${Math.round(value).toLocaleString('de-DE')} €`;
}
