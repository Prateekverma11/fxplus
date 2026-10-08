import React, { useState } from 'react';
import { Bookmark, Sparkles, Globe } from 'lucide-react';

export default function QuickCurrencies({
  currencies = [],
  selectedCurrency = 'USD',
  onSelectCurrency,
  ratesMap = {},
  bookmarks = [],
  onToggleBookmark
}) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const currencyData = [
    { code: 'USD', name: 'US Dollar', category: 'MAJOR', symbol: '$' },
    { code: 'EUR', name: 'Euro', category: 'MAJOR', symbol: '€' },
    { code: 'GBP', name: 'British Pound', category: 'MAJOR', symbol: '£' },
    { code: 'AED', name: 'UAE Dirham', category: 'MEAST', symbol: 'د.إ' },
    { code: 'SGD', name: 'Singapore Dollar', category: 'ASIA', symbol: 'S$' },
    { code: 'JPY', name: 'Japanese Yen', category: 'ASIA', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', category: 'MAJOR', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', category: 'MAJOR', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', category: 'EUROPE', symbol: 'Fr' },
    { code: 'SAR', name: 'Saudi Riyal', category: 'MEAST', symbol: '﷼' },
    { code: 'QAR', name: 'Qatari Riyal', category: 'MEAST', symbol: 'QR' },
    { code: 'THB', name: 'Thai Baht', category: 'ASIA', symbol: '฿' },
  ];

  const categories = [
    { id: 'ALL', label: 'All Currencies' },
    { id: 'MAJOR', label: 'Majors' },
    { id: 'ASIA', label: 'Asia-Pacific' },
    { id: 'MEAST', label: 'Middle East' },
    { id: 'EUROPE', label: 'Europe' }
  ];

  const filteredCurrencies = activeCategory === 'ALL'
    ? currencyData
    : currencyData.filter(c => c.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
            Popular Global Currencies
          </h3>
          <p className="text-xs text-zinc-500 font-normal">
            Direct real-time spot rates against 1 Indian Rupee
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-zinc-900 text-white shadow-clean-xs font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {filteredCurrencies.map((curr) => {
          const code = curr.code;
          const isSelected = code === selectedCurrency;
          const rateInfo = ratesMap[code];
          const isBookmarked = bookmarks.includes(code);
          const rateVal = rateInfo?.rate;

          return (
            <div
              key={code}
              onClick={() => onSelectCurrency(code)}
              className={`relative p-3.5 rounded-xl text-left border transition-all cursor-pointer group flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-clean-sm'
                  : 'bg-white text-zinc-800 border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-50/60 shadow-clean-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {curr.symbol}
                    </span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                      {code}
                    </span>
                  </div>
                  
                  {onToggleBookmark && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(code);
                      }}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this currency'}
                      className={`p-1 rounded-md transition-all ${
                        isBookmarked
                          ? 'text-amber-500'
                          : isSelected
                          ? 'text-zinc-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                          : 'text-zinc-300 hover:text-amber-500 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`}
                      />
                    </button>
                  )}
                </div>

                <p className={`text-[11px] truncate mb-2 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {curr.name}
                </p>
              </div>

              <div className="pt-1 border-t border-zinc-100/10 flex items-baseline justify-between">
                <span className={`text-sm font-bold tracking-tight tabular-nums ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                  {rateVal ? `₹${rateVal > 10 ? rateVal.toFixed(2) : rateVal.toFixed(4)}` : '₹--'}
                </span>
                <span className={`text-[10px] font-normal ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                  / 1 {code}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


