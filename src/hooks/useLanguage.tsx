import React, { createContext, useContext, useState } from 'react';

export type Language = 'mk' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  mk: {
    // Header
    'header.backToHome': 'Назад на почетна',
    'header.reklama5': 'reklama5.mk',
    'header.pazar3': 'pazar3.mk',
    
    // SearchBar
    'search.placeholder': 'Пребарај огласи... (на пр. ipad, iphone, laptop)',
    'search.button': 'Пребарај',
    'search.cancel': 'Откажи',
    'search.refreshTooltip': 'Освежи ги резултатите',
    'search.loading': 'Процесирање',
    'search.adsFound': 'пронајдени {count} огласи',
    'search.lastUpdated': 'Последно ажурирано во: {time}',
    
    // FiltersBar
    'filters.placeholder': 'Филтрирај резултати...',
    'filters.excludes': 'Исклучи зборови...',
    'filters.category': 'Категорија',
    'filters.categories': 'Категории',
    'filters.clear': 'Исчисти',
    'filters.noPrice': 'Без цена',
    'filters.exchangeRateTooltip': 'Кликни за да го промениш курсот',
    'filters.adsCount': '{count} огласи',
    'filters.adsCountFiltered': '{filtered} / {total} огласи',
    'filters.priceStats': 'Статистика на цени (€):',
    'filters.priceStatsMedian': 'Медијана',
    'filters.priceStatsAvg': 'Просек',
    'filters.allTime': 'Цело време',
    'filters.today': 'Денес',
    'filters.week': 'Оваа недела',
    'filters.month': 'Овој месец',
    'filters.30days': '30 дена',
    'filters.3months': '3 месеци',
    'filters.6months': '6 месеци',
    'filters.1year': '1 година',
    'filters.custom': 'Прилагодено',
    
    // States
    'states.noResults': 'Не се пронајдени резултати',
    'states.noResultsDesc': 'Нема пронајдено огласи за „{keyword}“',
    'states.errorTitle': 'Нешто тргна наопаку',
    'states.tryAgain': 'Обиди се повторно',
    'states.welcomeTitle': 'OglasBot',
    'states.welcomeDesc': 'Пребарувајте на reklama5.mk, pazar3.mk и IT.mk истовремено.',
    'states.welcomeSub': 'Најдете кој било оглас — споредете цени, филтрирајте по датум, град или категорија, сè на едно место.',
    'states.welcomePrompt': '↑ Внесете клучен збор погоре за да започнете',
    
    // AdTable & AdTiles
    'table.title': 'Наслов',
    'table.priceMKD': 'Цена (МКД)',
    'table.priceEUR': 'Цена (€)',
    'table.date': 'Датум',
    'table.category': 'Категорија',
    'table.city': 'Град',
    'table.source': 'Извор',
    'table.copyUrl': 'Копирај линк',
    'table.noPrice': 'Нема цена',
    
    // Pagination / view controls
    'pagination.prev': '← Претходна',
    'pagination.next': 'Следна →',
    'pagination.page': 'Страница {page} од {totalPages}',
    'pagination.perPage': '{count} / страница',
    'view.tableView': 'Табеларен приказ',
    'view.tilesView': 'Приказ со плочки',
    'view.loadedAds': 'Вчитани {count} огласи досега, се преземаат повеќе...',
  },
  en: {
    // Header
    'header.backToHome': 'Back to home',
    'header.reklama5': 'reklama5.mk',
    'header.pazar3': 'pazar3.mk',
    
    // SearchBar
    'search.placeholder': 'Search marketplace... (e.g. ipad, iphone, laptop)',
    'search.button': 'Search',
    'search.cancel': 'Cancel',
    'search.refreshTooltip': 'Refresh results',
    'search.loading': 'Loading',
    'search.adsFound': '{count} ads found',
    'search.lastUpdated': 'Last updated: {time}',
    
    // FiltersBar
    'filters.placeholder': 'Filter results...',
    'filters.excludes': 'Excludes...',
    'filters.category': 'Category',
    'filters.categories': 'Categories',
    'filters.clear': 'Clear',
    'filters.noPrice': 'No Price',
    'filters.exchangeRateTooltip': 'Click to edit exchange rate',
    'filters.adsCount': '{count} ads',
    'filters.adsCountFiltered': '{filtered} / {total} ads',
    'filters.priceStats': 'Price stats (€):',
    'filters.priceStatsMedian': 'Median',
    'filters.priceStatsAvg': 'Avg',
    'filters.allTime': 'All Time',
    'filters.today': 'Today',
    'filters.week': 'This Week',
    'filters.month': 'This Month',
    'filters.30days': '30 Days',
    'filters.3months': '3 Months',
    'filters.6months': '6 Months',
    'filters.1year': '1 Year',
    'filters.custom': 'Custom',
    
    // States
    'states.noResults': 'No results found',
    'states.noResultsDesc': 'No advertisements found for "{keyword}"',
    'states.errorTitle': 'Something went wrong',
    'states.tryAgain': 'Try Again',
    'states.welcomeTitle': 'OglasBot',
    'states.welcomeDesc': 'Search across reklama5.mk, pazar3.mk, and IT.mk simultaneously.',
    'states.welcomeSub': 'Find any listing — compare prices, filter by date, city, or category, all in one place.',
    'states.welcomePrompt': '↑ Enter a keyword above to get started',
    
    // AdTable & AdTiles
    'table.title': 'Title',
    'table.priceMKD': 'Price (MKD)',
    'table.priceEUR': 'Price (€)',
    'table.date': 'Date',
    'table.category': 'Category',
    'table.city': 'City',
    'table.source': 'Source',
    'table.copyUrl': 'Copy URL',
    'table.noPrice': 'No price',
    
    // Pagination / view controls
    'pagination.prev': '← Prev',
    'pagination.next': 'Next →',
    'pagination.page': 'Page {page} of {totalPages}',
    'pagination.perPage': '{count} / page',
    'view.tableView': 'Table view',
    'view.tilesView': 'Tiles view',
    'view.loadedAds': 'Loaded {count} ads so far, fetching more...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('oglasbot_lang');
    return (saved === 'mk' || saved === 'en') ? saved : 'mk';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('oglasbot_lang', lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let text = translations[language][key] || translations['en'][key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export function formatAdDate(date: Date, includeTime: boolean, lang: Language, fallback: string = ''): string {
  try {
    if (!date || isNaN(date.getTime()) || date.getTime() === 0) return fallback;
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {})
    };
    return new Intl.DateTimeFormat(lang === 'mk' ? 'mk-MK' : 'en-US', options).format(date);
  } catch {
    return fallback;
  }
}
