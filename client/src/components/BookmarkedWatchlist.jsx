import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, ArrowUpRight, ArrowDownRight, Minus, TrendingUp, X, Sparkles } from 'lucide-react';
import { fetchPairAnalytics } from '../services/api';

export default function BookmarkedWatchlist({
  bookmarks = [],
  currencies = [],
  selectedCurrency = 'USD',
  onSelectCurrency,
  onToggleBookmark,
  systemStats
}) {
  const [dataMap, setDataMap] = useState({});
  const [loading, setLoading] = useState(false);

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

    loadBookmarkAnalytics();

    return () => {
      isMounted = false;
    };
  }, [bookmarks, systemStats?.lastSync]);

  return (
    <div className="card-clean p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
            <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                Bookmarked Watchlist
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                {bookmarks.length} {bookmarks.length === 1 ? 'asset' : 'assets'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 font-normal">
              Your pinned foreign currencies tracked live against the Indian Rupee (INR)
            </p>
          </div>
        </div>

        {bookmarks.length > 0 && (
          <span className="text-[11px] text-zinc-400 font-normal">
            Click any row to view full charts & analysis
          </span>
        )}
      </div>

      {/* Bookmarked Content Table / Column */}
      {bookmarks.length === 0 ? (
        <div className="py-10 px-4 text-center rounded-xl bg-zinc-50/50 border border-dashed border-zinc-200 space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-zinc-800">No bookmarked currencies yet</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Click the <span className="font-semibold text-zinc-700">"Bookmark"</span> button on any currency card or choose from popular currencies below to start tracking.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['USD', 'EUR', 'GBP', 'JPY', 'AED'].map((code) => (
              <button
                key={code}
                onClick={() => onToggleBookmark(code)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-700 border border-zinc-200 hover:border-amber-400 hover:text-amber-700 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>+ Bookmark {code}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-2.5 px-3">Currency Pair</th>
                <th className="py-2.5 px-3">Rate (INR)</th>
                <th className="py-2.5 px-3">24H Change</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">Trend</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
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
                  <tr
                    key={code}
                    onClick={() => onSelectCurrency(code)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected ? 'bg-amber-50/50 hover:bg-amber-50/80 font-medium' : 'hover:bg-zinc-50'
                    }`}
                  >
                    {/* Currency Pair Column */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${
                            isSelected
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200 group-hover:bg-white group-hover:border-zinc-300'
                          }`}
                        >
                          {currencyObj.symbol || code[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-900">{code}</span>
                            <span className="text-zinc-400 font-normal">/ INR</span>
                            {isSelected && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 font-normal truncate max-w-[130px] sm:max-w-[200px]">
                            {currencyObj.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Rate Column */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-900 text-sm">
                        {metric?.rate
                          ? `₹${metric.rate > 10 ? metric.rate.toFixed(2) : metric.rate.toFixed(4)}`
                          : loading
                          ? '...'
                          : '₹--'}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-normal">per 1 {code}</span>
                    </td>

                    {/* 24H Change Column */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : isNegative
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}
                      >
                        {isPositive ? `+${change24h}%` : `${change24h}%`}
                      </span>
                    </td>

                    {/* Trend Column */}
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-xs">
                        {trend === 'Rising' || trend === 'Strengthening' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Rising
                          </span>
                        ) : trend === 'Falling' || trend === 'Weakening' ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            Falling
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-500 font-normal">
                            <Minus className="w-3.5 h-3.5" />
                            Stable
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Column */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCurrency(code);
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200"
                          title="View Chart"
                        >
                          View Chart
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(code);
                          }}
                          className="p-1.5 rounded-lg text-amber-500 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Remove bookmark"
                        >
                          <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500 group-hover:scale-105 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
