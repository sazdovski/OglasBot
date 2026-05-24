# 🤖 OglasBot

A modern, dark-mode marketplace monitor for [reklama5.mk](https://reklama5.mk). Search listings, auto-paginate, filter by date, sort by price, and convert currencies — all from a clean local web app.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## One-Click from VS Code

Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac) to run the **Dev Server** task.

Or use `F5` / Run → **Launch OglasBot** to start with the browser auto-opening.

## Features

- 🔍 Keyword search with debounced auto-search
- 📋 Sortable table: title, price (MKD & EUR), date, city
- 🔄 Auto-pagination across all result pages
- 📅 Quick date filters: Today / This Week / Month / Year / Custom range
- 💱 Configurable MKD↔EUR exchange rate (click the rate pill to edit)
- 📋 Copy URL & Open ad buttons per row
- 🌐 CORS-transparent via Vite proxy
- ⚡ Live loading with page counter
- 🦴 Skeleton loading state

## Project Structure

```
src/
├── components/       # UI components
│   ├── AdTable.tsx
│   ├── FiltersBar.tsx
│   ├── SearchBar.tsx
│   └── States.tsx
├── hooks/            # React hooks
│   ├── useSearch.ts
│   └── useAdFilters.ts
├── services/         # API + HTML parsing
│   └── searchService.ts
├── utils/            # Currency + date parsing
│   ├── currency.ts
│   └── parser.ts
├── types/            # TypeScript interfaces
│   └── index.ts
└── config/           # Constants
    └── constants.ts
```

## Exchange Rate

The default rate is **1 EUR = 61.5 МКД**. Click the rate pill in the filters bar to edit it live.

## Build for Production

```bash
npm run build
npm run preview
```
