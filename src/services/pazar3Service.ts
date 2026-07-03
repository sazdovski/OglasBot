import axios, { AxiosError } from 'axios';
import type { Ad, RawAd } from '../types';
import { normalizeAd } from '../utils/parser';
import { PAZAR3_API_BASE_URL, PAZAR3_AD_BASE, MAX_PAGES } from '../config/constants';

interface Pazar3Item {
  Id: number;
  Title: string;
  Price: string;
  Currency: string;
  HasPrice: boolean;
  Location: { Name: string };
  CreateDate: string;
  ImageDate?: string;
  AdUrl: string;
  PrimaryImage: { Url: string } | null;
  Category: { Name: string } | null;
}

interface Pazar3Response {
  Result: {
    Ads: {
      Items: Pazar3Item[];
    };
  };
}

// Macedonian Cyrillic currency labels used by pazar3
const CURRENCY_MAP: Record<string, 'MKD' | 'EUR'> = {
  'ЕУР': 'EUR',
  'EUR': 'EUR',
  'МКД': 'MKD',
  'MKD': 'MKD',
};

function buildSearchUrl(keyword: string, page: number): string {
  const params = new URLSearchParams({
    Search: keyword,
    Sort: 'DateDesc',
    Page: String(page),
    Display: 'Pictures',
    CategoryId: '0',
    LocationId: '0',
    IsOnline: 'false',
    ImagesOnly: 'false',
    IsCargoEnabled: 'false',
    NearLocation: 'False',
  });
  // Types must be repeated (multi-value param)
  const types = ['ForSale', 'ForBuy', 'ForRent', 'WantingForRent', 'WorkIsWanted', 'WorkIsGiven', 'Exchange'];
  const typesStr = types.map((t) => `Types=${t}`).join('&');
  return `${PAZAR3_API_BASE_URL}?${params.toString()}&${typesStr}`;
}

/**
 * Returns true if the ad title contains at least one significant token from the query.
 * This filters out Pazar3 premium/sponsored ads that appear regardless of the search.
 */
function isRelevant(title: string, keyword: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^\w\u0400-\u04FF\d]+/gi, ' ').trim();

  const titleNorm = normalize(title);
  const tokens = normalize(keyword)
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  if (tokens.length === 0) return true;

  return tokens.some((token) => titleNorm.includes(token));
}

function mapItem(item: Pazar3Item): RawAd {
  const currency = CURRENCY_MAP[item.Currency] ?? null;

  // Price from pazar3 comes as "33 400" (space-separated digits)
  const priceStr = item.HasPrice && item.Price ? item.Price.replace(/\s/g, '') : '';
  const priceValue = priceStr ? parseInt(priceStr, 10) : NaN;
  // pazar3 uses price=1 EUR as a placeholder for "price on request" – treat as no price
  const priceRaw = !isNaN(priceValue) && priceValue > 1
    ? (currency === 'EUR' ? `${item.Price} €` : `${item.Price} МКД`)
    : '';

  // ImageDate is "YYYYMMDD" — use it as the authoritative date source.
  // CreateDate from the search listing reflects the last refresh/bump date,
  // NOT the original creation date. Only the time component from CreateDate is reliable.
  // Example: ImageDate="20260124", CreateDate="08 Aug 23:30" → "24 Jan 2026 23:30"
  let dateStr = item.CreateDate ?? '';
  if (item.ImageDate && item.ImageDate.length >= 8) {
    const year  = item.ImageDate.substring(0, 4);
    const month = item.ImageDate.substring(4, 6);
    const day   = item.ImageDate.substring(6, 8);
    // Extract time from CreateDate if present ("DD Mon HH:MM" or "Денес HH:MM" etc.)
    const timeMatch = dateStr.match(/(\d{2}:\d{2})$/);
    const time = timeMatch ? timeMatch[1] : '';
    // Build a DD.MM.YYYY [HH:MM] string that parseMkDate already handles
    dateStr = time ? `${day}.${month}.${year} ${time}` : `${day}.${month}.${year}`;
  } else if (item.ImageDate && item.ImageDate.length >= 4) {
    // Fallback: only year is available — insert it into the CreateDate string
    const year = item.ImageDate.substring(0, 4);
    dateStr = dateStr.replace(/^(\d{1,2}\s+\w+)\s+(\d{2}:\d{2})$/, `$1 ${year} $2`);
  }

  return {
    adId: item.Id,
    title: item.Title,
    priceRaw,
    currency,
    city: item.Location?.Name ?? '',
    date: dateStr,
    imageUrl: item.PrimaryImage?.Url ?? '',
    url: `${PAZAR3_AD_BASE}${item.AdUrl}`,
    source: 'pazar3',
    category: item.Category?.Name ?? '',
  };
}

export async function fetchPazar3Ads(
  keyword: string,
  onProgress?: (ads: Ad[], page: number) => void,
  signal?: AbortSignal
): Promise<Ad[]> {
  const allAds: Ad[] = [];
  const seenIds = new Set<number>();

  for (let page = 1; page <= MAX_PAGES; page++) {
    if (signal?.aborted) break;

    const url = buildSearchUrl(keyword, page);

    let data: Pazar3Response;
    try {
      const response = await axios.get<Pazar3Response>(url, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal,
        timeout: 15000,
      });
      data = response.data;
    } catch (err) {
      if ((err as AxiosError).code === 'ERR_CANCELED') break;
      throw new Error(`Pazar3 fetch failed on page ${page}: ${(err as Error).message}`);
    }

    const items = data?.Result?.Ads?.Items ?? [];
    if (items.length === 0) break;

    for (const item of items) {
      if (!seenIds.has(item.Id) && isRelevant(item.Title, keyword)) {
        seenIds.add(item.Id);
        allAds.push(normalizeAd(mapItem(item)));
      }
    }

    onProgress?.(allAds, page);

    // pazar3 returns 50 items per page; fewer means last page
    if (items.length < 50) break;
  }

  return allAds;
}
