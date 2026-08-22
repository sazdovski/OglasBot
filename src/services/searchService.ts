import type { Ad } from '../types';
import { fetchReklama5Ads } from './reklama5Service';
import { fetchPazar3Ads } from './pazar3Service';
import { fetchItmkAds } from './itmkService';

export type SearchSource = 'reklama5' | 'pazar3' | 'itmk';
export type SourceStatus = 'loading' | 'done' | 'error';
export interface SourceProgress {
  count: number;
  status: SourceStatus;
}
export type SourceProgressMap = Record<SearchSource, SourceProgress>;

export async function fetchAds(
  keyword: string,
  onProgress?: (ads: Ad[], page: number) => void,
  signal?: AbortSignal,
  onSourceProgress?: (source: SearchSource, progress: SourceProgress) => void
): Promise<Ad[]> {
  let combined: Ad[] = [];
  const sourceCounts: Record<SearchSource, number> = { reklama5: 0, pazar3: 0, itmk: 0 };

  const handleProgress = () => {
    // Sort by date descending for live updates
    const sorted = [...combined].sort((a, b) => b.date.getTime() - a.date.getTime());
    onProgress?.(sorted, 0);
  };

  const track = async (source: SearchSource, fetcher: () => Promise<Ad[]>): Promise<Ad[]> => {
    try {
      const ads = await fetcher();
      onSourceProgress?.(source, { count: ads.length, status: 'done' });
      return ads;
    } catch (error) {
      onSourceProgress?.(source, { count: sourceCounts[source], status: 'error' });
      throw error;
    }
  };

  const [reklama5Ads, pazar3Ads, itmkAds] = await Promise.allSettled([
    track('reklama5', () => fetchReklama5Ads(
      keyword,
      (ads) => {
        sourceCounts.reklama5 = ads.length;
        combined = [
          ...ads,
          ...combined.filter((a) => a.source !== 'reklama5'),
        ];
        onSourceProgress?.('reklama5', { count: ads.length, status: 'loading' });
        handleProgress();
      },
      signal
    )),
    track('pazar3', () => fetchPazar3Ads(
      keyword,
      (ads) => {
        sourceCounts.pazar3 = ads.length;
        combined = [
          ...combined.filter((a) => a.source !== 'pazar3'),
          ...ads,
        ];
        onSourceProgress?.('pazar3', { count: ads.length, status: 'loading' });
        handleProgress();
      },
      signal
    )),
    track('itmk', () => fetchItmkAds(
      keyword,
      (ads) => {
        sourceCounts.itmk = ads.length;
        combined = [...combined.filter((a) => a.source !== 'itmk'), ...ads];
        onSourceProgress?.('itmk', { count: ads.length, status: 'loading' });
        handleProgress();
      },
      signal
    )),
  ]);

  const finalAds: Ad[] = [];
  if (reklama5Ads.status === 'fulfilled') finalAds.push(...reklama5Ads.value);
  if (pazar3Ads.status === 'fulfilled') finalAds.push(...pazar3Ads.value);
  if (itmkAds.status === 'fulfilled') finalAds.push(...itmkAds.value);

  return finalAds.sort((a, b) => b.date.getTime() - a.date.getTime());
}
