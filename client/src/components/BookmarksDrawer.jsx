import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, ArrowUpRight, ArrowDownRight, Minus, X, Plus, ChevronRight } from 'lucide-react';
import { fetchPairAnalytics } from '../services/api';

export default function BookmarksDrawer({
  isOpen = false,
  onClose,
  bookmarks = [],
  currencies = [],
  selectedCurrency = 'USD',
  onSelectCurrency,
  onToggleBookmark,
  systemStats
}) {
  const [dataMap, setDataMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch live metrics for bookmarked items
  useEffect(() => {
    let isMounted = true;

    async function loadBookmarkAnalytics() {
      if (!bookmarks || bookmarks.length === 0) {
        setDataMap({});
        return;
      }

      setLoading(true);
      try {
        const promises = bookmarks.map(async (code) => {
          try {
            const res = await fetchPairAnalytics(code, 'INR');
            return {
              code,
              rate: res.data?.currentRate,
              change24h: res.data?.changes?.['24H'] ?? 0,
              change7d: res.data?.changes?.['7D'] ?? 0,
              trend: res.data?.technical?.trend || 'Stable'
            };
          } catch (e) {
            return {
              code,
              rate: null,
              change24h: 0,
              change7d: 0,
              trend: 'Stable'
            };
          }
        });

        const results = await Promise.all(promises);
        if (isMounted) {
          const map = {};
          results.forEach((item) => {
            map[item.code] = item;
          });
          setDataMap(map);
        }
      } catch (err) {
        console.warn('Failed to load bookmark metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (isOpen) {
      loadBookmarkAnalytics();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, bookmarks, systemStats?.lastSync]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Slide-over Vertical Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white border-l border-zinc-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Bookmarked Currencies & Watchlist"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
              <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                  Bookmarked Watchlist
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                  {bookmarks.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-normal">
                Your saved currencies vs Indian Rupee (INR)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            aria-label="Close bookmarks drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-zinc-50/60 border border-dashed border-zinc-200 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-zinc-800">No bookmarked currencies</h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Pin currencies to quickly compare rates and monitor trends here.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Quick Add
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['USD', 'EUR', 'GBP', 'JPY', 'AED', 'AUD'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => onToggleBookmark(code)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 transition-all shadow-sm"
                    >
                      <Plus className="w-3 h-3 text-zinc-500" />
                      <span>{code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 px-1">
                <span>CURRENCY / RATE</span>
                <span>24H CHANGE / TREND</span>
              </div>

              {bookmarks.map((code) => {
                const currencyObj = currencies.find((c) => c.code === code) || {
                  code,
                  name: code === 'USD' ? 'US Dollar' : code,
                  symbol: code[0]
                };
                const metric = dataMap[code];
                const isSelected = code === selectedCurrency;
                const change24h = metric?.change24h ?? 0;
                const isPositive = change24h > 0;
                const isNegative = change24h < 0;
                const trend = metric?.trend || 'Stable';

                return (
                  <div
                    key={code}
                    onClick={() => {
                      onSelectCurrency(code);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/70 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Avatar + Code & Name */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors ${
                            isSelected
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200 group-hover:bg-white group-hover:border-zinc-300'
                          }`}
                        >
                          {currencyObj.symbol || code[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-900 text-sm">{code}</span>
                            <span className="text-zinc-400 text-xs font-normal">/ INR</span>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-zinc-900 text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 font-normal truncate max-w-[140px]">
                            {currencyObj.name}
                          </p>
                        </div>
                      </div>

                      {/* Right: Rate + 24H Change & Remove */}
                      <div className="text-right flex flex-col items-end">
                        <div className="font-bold text-zinc-900 text-sm tracking-tight">
                          {metric?.rate
                            ? `₹${metric.rate > 10 ? metric.rate.toFixed(2) : metric.rate.toFixed(4)}`
                            : loading
                            ? '...'
                            : '₹--'}
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                              isPositive
                                ? 'bg-emerald-50 text-emerald-700'
                                : isNegative
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {isPositive ? `+${change24h}%` : `${change24h}%`}
                          </span>

                          <span className="text-[10px] text-zinc-400 font-normal">
                            {trend === 'Rising' ? '↗' : trend === 'Falling' ? '↘' : '→'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row in Card: Quick Actions */}
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-zinc-400 group-hover:text-zinc-700 font-normal flex items-center gap-1">
                        <span>Click to view chart</span>
                        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(code);
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                        title="Remove from bookmarks"
                      >
                        <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500 hover:fill-rose-500 hover:text-rose-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {bookmarks.length > 0 && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-xs text-zinc-500">
            <span>{bookmarks.length} currencies pinned</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
