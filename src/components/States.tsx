import React from 'react';

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
  return (
    <div className="overflow-auto rounded-xl border border-[#30363d]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#161b22] border-b border-[#30363d]">
            {['Title', 'Price (МКД)', 'Price (€)', 'Date', 'City', 'Actions'].map(h => (
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
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <p className="text-gray-300 text-lg font-semibold mb-2">No results found</p>
      <p className="text-gray-500 text-sm">
        No advertisements found for <span className="text-gray-300">"{keyword}"</span>
      </p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-red-400 text-lg font-semibold mb-2">Something went wrong</p>
      <p className="text-gray-500 text-sm mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

export function WelcomeState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-4">🤖</div>
      <p className="text-gray-200 text-2xl font-bold mb-2">OglasBot</p>
      <p className="text-gray-500 text-sm">
        Search for any item on reklama5.mk — enter a keyword above to get started
      </p>
    </div>
  );
}
