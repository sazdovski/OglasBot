import { useLanguage } from '../hooks/useLanguage';

export function SkeletonRow() {
  return (
    <tr className="border-b border-[#21262d]">
      {[250, 120, 100, 130, 140, 90].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded" style={{ width: w * 0.6 }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 10 }: { rows?: number }) {
  const { t } = useLanguage();
  return (
    <div className="overflow-auto rounded-xl border border-[#30363d]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#161b22] border-b border-[#30363d]">
            {[t('table.title'), t('table.priceMKD'), t('table.priceEUR'), t('table.date'), t('table.city'), 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-gray-500 font-semibold text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ keyword }: { keyword: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <p className="text-gray-300 text-lg font-semibold mb-2">{t('states.noResults')}</p>
      <p className="text-gray-500 text-sm">
        {t('states.noResultsDesc', { keyword })}
      </p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-red-400 text-lg font-semibold mb-2">{t('states.errorTitle')}</p>
      <p className="text-gray-500 text-sm mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
      >
        {t('states.tryAgain')}
      </button>
    </div>
  );
}

export function WelcomeState() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
      <div className="text-6xl mb-5">🤖</div>
      <h1 className="text-gray-100 text-3xl sm:text-4xl font-bold mb-3 tracking-tight">{t('states.welcomeTitle')}</h1>
      <p className="text-gray-400 text-base sm:text-lg mb-2 max-w-md">
        {t('states.welcomeDesc').split('reklama5.mk').map((part, _i, arr) =>
          _i < arr.length - 1
            ? [part, <span key={_i} className="text-orange-400 font-medium">reklama5.mk</span>]
            : part
        ).flat().map((node) =>
          typeof node === 'string'
            ? node.split('pazar3.mk').map((p, j, a) =>
                j < a.length - 1
                  ? [p, <span key={`p${j}`} className="text-blue-400 font-medium">pazar3.mk</span>]
                  : p
              ).flat()
            : node
        ).flat().map((node, i) =>
          typeof node === 'string'
            ? node.split('IT.mk').map((part, j, parts) =>
                j < parts.length - 1
                  ? [part, <span key={`itmk-${i}-${j}`} className="text-emerald-400 font-medium">IT.mk</span>]
                  : part
              ).flat()
            : node
        ).flat()}
      </p>
      <p className="text-gray-600 text-sm max-w-sm">
        {t('states.welcomeSub')}
      </p>
      <p className="mt-8 text-gray-600 text-sm">{t('states.welcomePrompt')}</p>
    </div>
  );
}
