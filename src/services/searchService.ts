import type { Ad } from '../types';
import { fetchReklama5Ads } from './reklama5Service';
import { fetchPazar3Ads } from './pazar3Service';

export async function fetchAds(
  keyword: string,
  onProgress?: (ads: Ad[], page: number) => void,
  signal?: AbortSignal
): Promise<Ad[]> {
  let combined: Ad[] = [];

  const handleProgress = () => {
    // Sort by date descending for live updates
    const sorted = [...combined].sort((a, b) => b.date.getTime() - a.date.getTime());
    onProgress?.(sorted, 0);
  };

  const [reklama5Ads, pazar3Ads] = await Promise.allSettled([
    fetchReklama5Ads(
      keyword,
      (ads) => {
        combined = [
          ...ads,
          ...combined.filter((a) => a.source !== 'reklama5'),
        ];
        handleProgress();
      },
      signal
    ),
    fetchPazar3Ads(
      keyword,
      (ads) => {
        combined = [
          ...combined.filter((a) => a.source !== 'pazar3'),
          ...ads,
        ];
        handleProgress();
      },
      signal
    ),
  ]);

  const finalAds: Ad[] = [];
  if (reklama5Ads.status === 'fulfilled') finalAds.push(...reklama5Ads.value);
  if (pazar3Ads.status === 'fulfilled') finalAds.push(...pazar3Ads.value);

  return finalAds.sort((a, b) => b.date.getTime() - a.date.getTime());
}

