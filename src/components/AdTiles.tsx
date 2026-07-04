import { useState } from 'react';
import type { Ad } from '../types';
import { formatMKD, formatEUR } from '../utils/currency';
import { useLanguage, formatAdDate } from '../hooks/useLanguage';

interface AdTilesProps {
  ads: Ad[];
}

function AdTile({ ad }: { ad: Ad }) {
  const [imgError, setImgError] = useState(false);
  const { t, language } = useLanguage();

  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff] transition-colors overflow-hidden"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-[#0d1117] overflow-hidden flex items-center justify-center">
        {ad.imageUrl && !imgError ? (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-4xl">🖼️</span>
        )}
        {/* Source badge */}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${
            ad.source === 'reklama5'
              ? 'bg-orange-900/90 text-orange-300'
              : 'bg-blue-900/90 text-blue-300'
          }`}
        >
          {ad.source === 'reklama5' ? 'Reklama5' : 'Pazar3'}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <p className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">
          {ad.title}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-[#21262d]">
          {(ad.priceMKD || ad.priceEUR) ? (
            <>
              {ad.priceMKD && (
                <span className="text-emerald-400 font-semibold text-sm">
                  {formatMKD(ad.priceMKD, t('table.noPrice'))}
                </span>
              )}
              {ad.priceEUR && (
                <span className="text-blue-400 font-semibold text-sm">
                  {formatEUR(ad.priceEUR, t('table.noPrice'))}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-500 text-xs">{t('table.noPrice')}</span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{ad.city || '—'}</span>
          <span>{formatAdDate(ad.date, false, language, ad.dateFormatted)}</span>
        </div>

        {ad.category && (
          <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#21262d] text-gray-400 text-xs">
            {ad.category}
          </span>
        )}
      </div>
    </a>
  );
}

export function AdTiles({ ads }: AdTilesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {ads.map((ad) => (
        <AdTile key={ad.id} ad={ad} />
      ))}
    </div>
  );
}
