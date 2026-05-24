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

  // Format: "22 мај 11:00" or "22 мај"
  if (parts.length < 2) return new Date(0);

  const day = parseInt(parts[0], 10);
  const monthStr = parts[1].toLowerCase();
  const month = MK_MONTHS[monthStr];
  if (month === undefined) return new Date(0);
  let year = now.getFullYear();

  // If month is in the future, it must be last year
  if (month > now.getMonth()) {
    year = year - 1;
  }

  let hours = 0;
  let minutes = 0;
  if (parts[2] && parts[2].includes(':')) {
    const [h, m] = parts[2].split(':').map(Number);
    hours = h;
    minutes = m;
  }

  return new Date(year, month, day, hours, minutes);
}

export function parsePrice(raw: string): { value: number | null; currency: 'MKD' | 'EUR' | null } {
  if (!raw || raw.trim() === '') return { value: null, currency: null };

  const cleaned = raw.trim();

  const eurMatch = cleaned.match(/([\d\s.,]+)\s*€/);
  if (eurMatch) {
    // Macedonian locale uses '.' as thousands separator (e.g. "37.000" = 37000)
    const value = parseFloat(eurMatch[1].replace(/\s/g, '').replace(/\./g, '').replace(',', '.'));
    return { value: isNaN(value) || value === 0 ? null : value, currency: 'EUR' };
  }

  const mkdMatch = cleaned.match(/([\d\s.,]+)\s*МКД/);
  if (mkdMatch) {
    const value = parseInt(mkdMatch[1].replace(/[\s.]/g, ''), 10);
    return { value: isNaN(value) || value === 0 ? null : value, currency: 'MKD' };
  }

  return { value: null, currency: null };
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
