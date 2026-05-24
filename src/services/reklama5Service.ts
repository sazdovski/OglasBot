import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import type { Ad, RawAd } from '../types';
import { normalizeAd } from '../utils/parser';
import { API_BASE_URL, REKLAMA5_AD_BASE, MAX_PAGES } from '../config/constants';

function buildSearchUrl(keyword: string, page: number): string {
  const params = new URLSearchParams({
    q: keyword,
    city: '',
    cat: '',
    maincat: '',
    'company': '0',
    'private': '0',
    sell: '0',
    buy: '0',
    includeOld: '0',
    includeNew: '0',
    trade: '0',
    SortByPrice: '0',
    cargoReady: '0',
    DDVIncluded: '0',
    page: String(page),
    m: '1',
  });
  const raw = params.toString()
    .replace('company=0', 'company=0&company=1')
    .replace('private=0', 'private=0&private=1')
    .replace('sell=0', 'sell=0&sell=1')
    .replace('buy=0', 'buy=0&buy=1')
    .replace('includeOld=0', 'includeOld=0&includeOld=1')
    .replace('includeNew=0', 'includeNew=0&includeNew=1')
    .replace('trade=0', 'trade=0&trade=1');
  return `${API_BASE_URL}?${raw}`;
}

function parseHtml(html: string): RawAd[] {
  const $ = cheerio.load(html);
  const results: RawAd[] = [];

  $('div.ad-top-div').each((_, el) => {
    const $el = $(el);

    const adId = parseInt($el.find('[data-adid]').first().attr('data-adid') || '0', 10);
    if (!adId) return;

    const title = $el.find('.SearchAdTitle').text().trim();
    const priceRaw = $el.find('.search-ad-price').first().text().trim();

    const imageStyle = $el.find('.ad-image').first().attr('style') || '';
    const imgMatch = imageStyle.match(/background-image:url\(([^)]+)\)/);
    const imageUrl = imgMatch ? imgMatch[1].replace(/^\/\//, 'https://') : '';

    const city = $el.find('.city-span').text().replace(/\s+/g, ' ').trim();
    const category = $el.find('.ad-category-div a small').first().text().trim();

    const dateAllText = $el.find('.ad-date-div-1').text().replace(/\s+/g, ' ').trim();
    const timeMatch = dateAllText.match(/(\d{1,2}:\d{2})/);
    const timePart = timeMatch ? timeMatch[1] : '';
    const datePart = timePart
      ? dateAllText.substring(0, dateAllText.indexOf(timePart)).trim()
      : dateAllText.split(' ')[0];
    const dateStr = timePart ? `${datePart} ${timePart}` : datePart;

    const currency = priceRaw.includes('€') ? 'EUR' : priceRaw.includes('МКД') ? 'MKD' : null;

    results.push({
      adId,
      title,
      priceRaw,
      currency,
      city,
      date: dateStr,
      imageUrl,
      url: `${REKLAMA5_AD_BASE}${adId}`,
      source: 'reklama5',
      category,
    });
  });

  return results;
}

function hasNextPage(html: string): boolean {
  const $ = cheerio.load(html);
  return $('a.page-link').filter((_, el) => {
    return $(el).text().includes('Следна');
  }).length > 0;
}

export async function fetchReklama5Ads(
  keyword: string,
  onProgress?: (ads: Ad[], page: number) => void,
  signal?: AbortSignal
): Promise<Ad[]> {
  const allAds: Ad[] = [];
  const seenIds = new Set<number>();

  for (let page = 1; page <= MAX_PAGES; page++) {
    if (signal?.aborted) break;

    const url = buildSearchUrl(keyword, page);

    let html: string;
    try {
      const response = await axios.get<string>(url, {
        headers: { 'Accept': 'text/html,application/xhtml+xml' },
        signal,
        timeout: 15000,
      });
      html = response.data;
    } catch (err) {
      if ((err as AxiosError).code === 'ERR_CANCELED') break;
      throw new Error(`Reklama5 fetch failed on page ${page}: ${(err as Error).message}`);
    }

    const rawAds = parseHtml(html);
    if (rawAds.length === 0) break;

    for (const raw of rawAds) {
      if (!seenIds.has(raw.adId)) {
        seenIds.add(raw.adId);
        allAds.push(normalizeAd(raw));
      }
    }

    onProgress?.(allAds, page);

    if (!hasNextPage(html)) break;
  }

  return allAds;
}
