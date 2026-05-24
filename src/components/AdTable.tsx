
import type { Ad, SortState } from '../types';
import { formatMKD, formatEUR } from '../utils/currency';
import { format, isValid } from 'date-fns';

function safeFormat(date: Date, fmt: string, fallback: string): string {
  try {
    if (!date || !isValid(date) || isNaN(date.getTime())) return fallback;
    return format(date, fmt);
  } catch {
    return fallback;
  }
}

interface Column {
  key: keyof Ad;
  label: string;
  sortable: boolean;
  render: (ad: Ad) => React.ReactNode;
  minWidth: string;
}

interface AdTableProps {
  ads: Ad[];
  sort: SortState;
  onSort: (col: keyof Ad) => void;
}

const COLUMNS: Column[] = [
  {
    key: 'title',
    label: 'Title',
    sortable: true,
    minWidth: '250px',
    render: (ad) => (
      <div className="flex items-center gap-3">
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt=""
            className="w-10 h-10 object-cover rounded-md shrink-0"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <a
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors font-medium line-clamp-2"
          title={ad.title}
        >
          {ad.title}
        </a>
      </div>
    ),
  },
  {
    key: 'priceMKD',
    label: 'Price (МКД)',
    sortable: true,
    minWidth: '120px',
    render: (ad) => (
      <span className={ad.priceMKD ? 'text-emerald-400 font-semibold' : 'text-gray-500 text-sm'}>
        {formatMKD(ad.priceMKD)}
      </span>
    ),
  },
  {
    key: 'priceEUR',
    label: 'Price (€)',
    sortable: true,
    minWidth: '100px',
    render: (ad) => (
      <span className={ad.priceEUR ? 'text-blue-400 font-semibold' : 'text-gray-500 text-sm'}>
        {formatEUR(ad.priceEUR)}
      </span>
    ),
  },
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    minWidth: '130px',
    render: (ad) => (
      <span className="text-gray-400 text-sm whitespace-nowrap">
        {safeFormat(ad.date, 'dd MMM yyyy HH:mm', ad.dateFormatted)}
      </span>
    ),
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    minWidth: '130px',
    render: (ad) => (
      ad.category
        ? <span className="inline-block px-2 py-0.5 rounded-full bg-[#21262d] text-gray-300 text-xs">{ad.category}</span>
        : <span className="text-gray-600 text-sm">—</span>
    ),
  },
  {
    key: 'city',
    label: 'City',
    sortable: true,
    minWidth: '140px',
    render: (ad) => (
      <span className="text-gray-300 text-sm">{ad.city || '—'}</span>
    ),
  },
  {
    key: 'source',
    label: 'Source',
    sortable: false,
    minWidth: '100px',
    render: (ad) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
        ad.source === 'reklama5'
          ? 'bg-orange-900 text-orange-300'
          : 'bg-blue-900 text-blue-300'
      }`}>
        {ad.source === 'reklama5' ? 'Reklama5' : 'Pazar3'}
      </span>
    ),
  },
];

function SortIcon({ column, sort }: { column: keyof Ad; sort: SortState }) {
  if (sort.column !== column) {
    return <span className="text-gray-600 ml-1">↕</span>;
  }
  return (
    <span className="text-blue-400 ml-1">
      {sort.direction === 'asc' ? '↑' : '↓'}
    </span>
  );
}

export function AdTable({ ads, sort, onSort }: AdTableProps) {
  return (
    <div className="overflow-auto rounded-xl border border-[#30363d] shadow-lg">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-[#161b22] border-b border-[#30363d]">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort(col.key)}
                className={`px-4 py-3 font-semibold text-gray-300 whitespace-nowrap select-none
                  ${col.sortable ? 'cursor-pointer hover:text-white hover:bg-[#21262d] transition-colors' : ''}
                `}
                style={{ minWidth: col.minWidth }}
              >
                {col.label}
                {col.sortable && <SortIcon column={col.key} sort={sort} />}
              </th>
            ))}
            <th className="px-4 py-3 font-semibold text-gray-300" style={{ minWidth: '50px' }}>
              
            </th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad, i) => (
            <tr
              key={ad.id}
              className={`border-b border-[#21262d] transition-colors hover:bg-[#161b22]
                ${i % 2 === 0 ? 'bg-[#0d1117]' : 'bg-[#0f141a]'}
              `}
            >
              {COLUMNS.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render(ad)}
                </td>
              ))}
              <td className="px-4 py-3">
                <button
                  onClick={() => navigator.clipboard.writeText(ad.url)}
                  className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-gray-400 hover:text-white transition-colors"
                  title="Copy URL"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
