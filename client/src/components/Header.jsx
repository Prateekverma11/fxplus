import React from 'react';
import { Bookmark } from 'lucide-react';
import CurrencySearchBar from './CurrencySearchBar';

export default function Header({
  currencies = [],
  selectedCurrency = 'USD',
  onSelectCurrency,
  isConnected = true,
  bookmarks = [],
  onToggleBookmark,
  onOpenBookmarks
}) {
  return (
    <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-zinc-900 tracking-tight">
                FXPulse
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {isConnected ? 'Live' : 'Connecting'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 font-normal hidden sm:block">
              Track the Indian Rupee against global currencies
            </p>
          </div>
        </div>

        {/* Search & Bookmarks Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="flex-1 sm:w-64">
            <CurrencySearchBar
              currencies={currencies}
              selectedCurrency={selectedCurrency}
              onSelectCurrency={onSelectCurrency}
              bookmarks={bookmarks}
              onToggleBookmark={onToggleBookmark}
            />
          </div>

          <button
            type="button"
            onClick={onOpenBookmarks}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm active:scale-95"
            title="Open Bookmarked Currencies"
          >
            <Bookmark className={`w-4 h-4 ${bookmarks.length > 0 ? 'fill-amber-500 text-amber-500' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">Bookmarks</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200/80">
              {bookmarks.length}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}


