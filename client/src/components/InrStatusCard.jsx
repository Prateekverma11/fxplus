import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, ArrowRightLeft, TrendingUp, ShieldCheck } from 'lucide-react';

export default function InrStatusCard({
  currentRate,
  change24h = 0,
  referenceCurrency = 'USD',
  referenceSymbol = '$',
  analytics
}) {
  const [calcAmount, setCalcAmount] = useState('1');
  const [calcDirection, setCalcDirection] = useState('toINR'); // 'toINR' or 'fromINR'
  const [showConverter, setShowConverter] = useState(false);

  // INR status logic (vs reference currency)
  // If base/INR went down, INR strengthened; if base/INR went up, INR weakened.
  let inrStatus = 'Stable';
  let statusBadgeClass = 'bg-zinc-100 text-zinc-700 border-zinc-200/90';

  if (change24h < -0.05) {
    inrStatus = 'Strengthening';
    statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (change24h > 0.05) {
    inrStatus = 'Weakening';
    statusBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200/80';
  }

  const isPositive = change24h > 0;
  const isNegative = change24h < 0;

  // Day Range calculation
  const high24h = analytics?.high24h || (currentRate ? currentRate * 1.0035 : null);
  const low24h = analytics?.low24h || (currentRate ? currentRate * 0.9965 : null);
  
  let rangePercent = 50;
  if (high24h && low24h && high24h > low24h && currentRate) {
    rangePercent = Math.min(100, Math.max(0, ((currentRate - low24h) / (high24h - low24h)) * 100));
  }

  // Converter calculation
  const numAmount = parseFloat(calcAmount) || 0;
  const convertedValue = currentRate
    ? calcDirection === 'toINR'
      ? (numAmount * currentRate).toFixed(2)
      : (numAmount / currentRate).toFixed(4)
    : '0.00';

  return (
    <div className="card-clean p-5 sm:p-6 space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-clean-xs">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
                Indian Rupee Overview
              </h2>
              <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/60">
                INR
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-normal">
              Live benchmark against <span className="font-medium text-zinc-800">{referenceCurrency}</span>
            </p>
          </div>
        </div>

        {/* Status Pill & Converter Toggle Button */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass}`}>
            {inrStatus === 'Strengthening' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />}
            {inrStatus === 'Weakening' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
            {inrStatus === 'Stable' && <Minus className="w-3.5 h-3.5 text-zinc-500" />}
            <span>INR {inrStatus}</span>
          </span>

          <button
            type="button"
            onClick={() => setShowConverter(!showConverter)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              showConverter
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>{showConverter ? 'Close Calc' : 'Calculator'}</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spot Rate */}
        <div>
          <span className="text-xs text-zinc-500 block mb-1 font-normal">
            Spot Rate ({referenceSymbol}1 {referenceCurrency})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight tabular-nums">
              ₹{currentRate ? (currentRate > 10 ? currentRate.toFixed(2) : currentRate.toFixed(4)) : '--'}
            </span>
          </div>
        </div>

        {/* 24h Movement */}
        <div>
          <span className="text-xs text-zinc-500 block mb-1 font-normal">
            24h Movement
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${
              isPositive ? 'text-rose-600' : isNegative ? 'text-emerald-600' : 'text-zinc-900'
            }`}>
              {isPositive ? `+${change24h}%` : `${change24h}%`}
            </span>
            <span className="text-[11px] text-zinc-400 font-normal">
              {isPositive ? '(USD gained)' : isNegative ? '(INR gained)' : '(Steady)'}
            </span>
          </div>
        </div>

        {/* Day Range Visual Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-500 font-normal">Day Range</span>
            <span className="text-zinc-400 text-[11px] font-medium">Low - High</span>
          </div>
          
          <div className="space-y-1.5">
            <div className="relative w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
              <div
                className="absolute top-0 bottom-0 bg-zinc-900 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(8, rangePercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>₹{low24h ? low24h.toFixed(2) : '--'}</span>
              <span>₹{high24h ? high24h.toFixed(2) : '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick Converter Collapsible Box */}
      {showConverter && (
        <div className="pt-4 border-t border-zinc-100 transition-all duration-200 animate-fadeIn">
          <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500" />
                Currency Calculator
              </span>
              <button
                type="button"
                onClick={() => setCalcDirection(calcDirection === 'toINR' ? 'fromINR' : 'toINR')}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Swap ({calcDirection === 'toINR' ? `${referenceCurrency} → INR` : `INR → ${referenceCurrency}`})</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-[11px] text-zinc-500 block mb-1">
                  Amount in {calcDirection === 'toINR' ? referenceCurrency : 'INR'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">
                    {calcDirection === 'toINR' ? referenceSymbol : '₹'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-white text-zinc-900 text-sm font-semibold rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 transition-all tabular-nums"
                    placeholder="Enter amount..."
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 block mb-1">
                  Converted Output in {calcDirection === 'toINR' ? 'INR' : referenceCurrency}
                </label>
                <div className="px-3.5 py-2 bg-white rounded-lg border border-zinc-200 text-zinc-900 font-bold text-sm sm:text-base flex items-center justify-between tabular-nums shadow-clean-xs">
                  <span>
                    {calcDirection === 'toINR' ? '₹' : referenceSymbol} {convertedValue}
                  </span>
                  <span className="text-[11px] font-normal text-zinc-400">
                    @ {currentRate ? (currentRate > 10 ? currentRate.toFixed(2) : currentRate.toFixed(4)) : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

