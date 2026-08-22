import type { Ad, RawAd } from '../types';
import { eurToMkd, mkdToEur } from './currency';

const MK_MONTHS: Record<string, number> = {
  // Macedonian Cyrillic
  јан: 0, фев: 1, мар: 2, апр: 3, мај: 4, јун: 5,
  јул: 6, авг: 7, сеп: 8, окт: 9, ное: 10, дек: 11,
  // English (pazar3 uses English abbreviations)
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseMkDate(dateStr: string): Date {
  const trimmed = dateStr.trim();
  if (!trimmed) return new Date(0);

  // IT.mk exposes an ISO 8601 datetime on each listing.
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }

  const parts = trimmed.split(' ').filter(Boolean);
  if (parts.length === 0) return new Date(0);

  const now = new Date();

  // Handle "Денес HH:MM" (Today)
  if (parts[0] === 'Денес') {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (parts[1]?.includes(':')) {
      const [h, m] = parts[1].split(':').map(Number);
      d.setHours(h, m);
    }
    return d;
  }

  // Handle "Вчера HH:MM" (Yesterday)
  if (parts[0] === 'Вчера') {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (parts[1]?.includes(':')) {
      const [h, m] = parts[1].split(':').map(Number);
      d.setHours(h, m);
    }
    return d;
  }

  // Handle "DD.MM.YYYY" or "DD.MM.YYYY HH:MM"
  const dotDate = parts[0].match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotDate) {
    const day = parseInt(dotDate[1], 10);
    const month = parseInt(dotDate[2], 10) - 1;
    const year = parseInt(dotDate[3], 10);
    let hours = 0, minutes = 0;
    if (parts[1]?.includes(':')) {
      const [h, m] = parts[1].split(':').map(Number);
      if (!isNaN(h)) hours = h;
      if (!isNaN(m)) minutes = m;
    }
    const result = new Date(year, month, day, hours, minutes);
    return isNaN(result.getTime()) ? new Date(0) : result;
  }

  // Format: "22 May 14:16" or "22 мај 11:00" (no year)
  // Format: "22 May 2026 14:16" (with year)
  if (parts.length < 2) return new Date(0);

  const day = parseInt(parts[0], 10);
  if (isNaN(day)) return new Date(0);

  const monthStr = parts[1].toLowerCase();
  const month = MK_MONTHS[monthStr];
  if (month === undefined) return new Date(0);

  // Detect whether parts[2] is a year (4-digit number) or a time
  let year = now.getFullYear();
  let timeStr: string | undefined;

  if (parts[2] && /^\d{4}$/.test(parts[2])) {
    year = parseInt(parts[2], 10);
    timeStr = parts[3];
  } else {
    // No explicit year — infer: pick the most recent past occurrence of this month/day
    const candidate = new Date(now.getFullYear(), month, day);
    if (candidate > now) candidate.setFullYear(now.getFullYear() - 1);
    year = candidate.getFullYear();
    timeStr = parts[2];
  }

  let hours = 0;
  let minutes = 0;
  if (timeStr?.includes(':')) {
    const [h, m] = timeStr.split(':').map(Number);
    if (!isNaN(h)) hours = h;
    if (!isNaN(m)) minutes = m;
  }

  const result = new Date(year, month, day, hours, minutes);
  return isNaN(result.getTime()) ? new Date(0) : result;
}

export function parsePrice(raw: string): { value: number | null; currency: 'MKD' | 'EUR' | null } {
  if (!raw || raw.trim() === '') return { value: null, currency: null };

  const cleaned = raw.trim();
  const matches = Array.from(cleaned.matchAll(/([\d\s.,]+)\s*(€|МКД)/g));

  if (matches.length === 0) return { value: null, currency: null };

  const parsedValues: Array<{ value: number | null; currency: 'MKD' | 'EUR' | null }> = matches.map((match) => {
    const amount = match[1];
    const currencyToken = match[2];
    const currency: 'MKD' | 'EUR' = currencyToken === '€' ? 'EUR' : 'MKD';

    const parsed = currency === 'EUR'
      ? parseFloat(amount.replace(/\s/g, '').replace(/\./g, '').replace(',', '.'))
      : parseInt(amount.replace(/[\s.]/g, ''), 10);

    return {
      value: isNaN(parsed) || parsed <= 1 ? null : parsed,
      currency,
    };
  });

  const hasPlaceholder = parsedValues.some((entry) => entry.value === null);
  if (hasPlaceholder) {
    return { value: null, currency: null };
  }

  const firstMeaningful = parsedValues.find((entry) => entry.value !== null);
  return firstMeaningful ? firstMeaningful : { value: null, currency: null };
}

export function normalizeAd(raw: RawAd): Ad {
  const { value, currency } = parsePrice(raw.priceRaw);

  let priceMKD: number | null = null;
  let priceEUR: number | null = null;

  if (currency === 'MKD' && value !== null) {
    priceMKD = value;
    priceEUR = mkdToEur(value);
  } else if (currency === 'EUR' && value !== null) {
    priceEUR = value;
    priceMKD = eurToMkd(value);
  }

  const date = parseMkDate(raw.date);

  return {
    id: raw.adId,
    title: raw.title.trim(),
    priceMKD,
    priceEUR,
    city: raw.city.trim(),
    date,
    dateFormatted: raw.date.trim(),
    imageUrl: raw.imageUrl.startsWith('//') ? `https:${raw.imageUrl}` : raw.imageUrl,
    url: raw.url,
    source: raw.source,
    category: raw.category.trim(),
  };
}
