import { DEFAULT_MKD_TO_EUR } from '../config/constants';

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

export function formatMKD(value: number | null): string {
  if (value === null || value === 0) return 'No Price';
  return `${value.toLocaleString('mk-MK')} МКД`;
}

export function formatEUR(value: number | null): string {
  if (value === null || value === 0) return 'No Price';
  return `${Math.round(value).toLocaleString('de-DE')} €`;
}
