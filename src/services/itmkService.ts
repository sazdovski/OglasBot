import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import type { Ad, RawAd } from '../types';
import { normalizeAd } from '../utils/parser';
import { ITMK_API_BASE_URL, ITMK_BASE_URL, MAX_PAGES } from '../config/constants';

function normalizeText(value: string): string {
  return value.toLocaleLowerCase('mk').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function isRelevant(title: string, description: string, keyword: string): boolean {
  const haystack = normalizeText(`${title} ${description}`);
  const tokens = normalizeText(keyword).split(/\s+/).filter((token) => token.length >= 2);
  return tokens.length === 0 || tokens.every((token) => haystack.includes(token));
}

function parseHtml(html: string, keyword: string): RawAd[] {
  const $ = cheerio.load(html);
  const results: RawAd[] = [];

  $('.structItem--listing').each((_, element) => {
    const item = $(element);
    const titleLink = item.find('.structItem-title a[data-tp-primary="on"]').first();
    const href = titleLink.attr('href') ?? '';
    const idMatch = href.match(/\.(\d+)\/?$/);
    if (!idMatch) return;

    const title = titleLink.text().replace(/\s+/g, ' ').trim();
    const description = item.find('.structItem-listingDescription').text().replace(/\s+/g, ' ').trim();
    if (!isRelevant(title, description, keyword)) return;

    const imagePath = item.find('.structItem-iconContainer > img').first().attr('src') ?? '';
    const category = item.find('.structItem-parts a[href*="/oglasnik/categories/"]').last().text().trim();
    const time = item.find('.structItem-startDate time').first();
    const priceText = item.find('.structItem-statuses .ribbon').first().text().replace(/\s+/g, ' ').trim();

    results.push({
      adId: Number(idMatch[1]),
      title,
      priceRaw: priceText.replace(/ден\.?\s*$/iu, 'МКД'),
      currency: priceText.includes('€') ? 'EUR' : priceText ? 'MKD' : null,
      city: '',
      date: time.attr('datetime') ?? time.attr('title') ?? time.text().trim(),
      imageUrl: imagePath ? new URL(imagePath, ITMK_BASE_URL).href : '',
      url: new URL(href, ITMK_BASE_URL).href,
      source: 'itmk',
      category,
    });
  });

  return results;
}

function hasNextPage(html: string): boolean {
  const $ = cheerio.load(html);
  return $('a.pageNav-jump--next').length > 0;
}

export async function fetchItmkAds(
  keyword: string,
  onProgress?: (ads: Ad[], page: number) => void,
  signal?: AbortSignal
): Promise<Ad[]> {
  const allAds: Ad[] = [];
  const seenIds = new Set<number>();

  for (let page = 1; page <= MAX_PAGES; page++) {
    if (signal?.aborted) break;

    try {
      const response = await axios.get<string>(`${ITMK_API_BASE_URL}?page=${page}`, {
        headers: { Accept: 'text/html,application/xhtml+xml' },
        signal,
        timeout: 15000,
      });
      const rawAds = parseHtml(response.data, keyword);
      for (const raw of rawAds) {
        if (!seenIds.has(raw.adId)) {
          seenIds.add(raw.adId);
          allAds.push(normalizeAd(raw));
        }
      }
      onProgress?.(allAds, page);
      if (!hasNextPage(response.data)) break;
    } catch (err) {
      if ((err as AxiosError).code === 'ERR_CANCELED') break;
      throw new Error(`IT.mk fetch failed on page ${page}: ${(err as Error).message}`, { cause: err });
    }
  }

  return allAds;
}
