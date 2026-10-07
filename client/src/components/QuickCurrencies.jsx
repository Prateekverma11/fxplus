import React from 'react';
import { Bookmark } from 'lucide-react';

export default function QuickCurrencies({
  currencies = [],
  selectedCurrency = 'USD',
  onSelectCurrency,
  ratesMap = {},
  bookmarks = [],
  onToggleBookmark
}) {
  const quickCodes = ['USD', 'EUR', 'GBP', 'JPY', 'AED', 'AUD', 'CAD', 'SGD', 'CHF'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Popular Currencies
        </h3>
        <span className="text-xs text-zinc-400 font-normal">Click to compare against INR</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {quickCodes.map((code) => {
          const isSelected = code === selectedCurrency;
          const currencyObj = currencies.find(c => c.code === code) || { code, symbol: code[0] };
          const rateInfo = ratesMap[code];
          const isBookmarked = bookmarks.includes(code);

          return (
            <div
              key={code}
              onClick={() => onSelectCurrency(code)}
              className={`relative p-3 rounded-xl text-left border transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                  : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                  {code}
                </span>
                
                {onToggleBookmark && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(code);
                    }}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this currency'}
                    className={`p-0.5 rounded transition-colors ${
                      isBookmarked
                        ? 'text-amber-500'
                        : isSelected
                        ? 'text-zinc-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                        : 'text-zinc-300 hover:text-amber-500 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Bookmark
                      className={`w-3 h-3 ${isBookmarked ? 'fill-amber-500' : ''}`}
                    />
                  </button>
                )}
              </div>
              <div className={`text-xs font-medium tracking-tight ${isSelected ? 'text-zinc-200' : 'text-zinc-600'}`}>
                {rateInfo?.rate ? `₹${rateInfo.rate > 10 ? rateInfo.rate.toFixed(2) : rateInfo.rate.toFixed(4)}` : '₹--'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

