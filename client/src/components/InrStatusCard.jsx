import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function InrStatusCard({
  currentRate,
  change24h = 0,
  referenceCurrency = 'USD',
  referenceSymbol = '$'
}) {
  // Determine INR Status based on percentage change against reference currency
  // Note: If USD/INR goes up (+), INR is weakening. If USD/INR goes down (-), INR is strengthening.
  let inrStatus = 'Stable';
  let statusBadgeClass = 'bg-zinc-100 text-zinc-700 border-zinc-200';

  if (change24h < -0.1) {
    inrStatus = 'Strengthening';
    statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (change24h > 0.1) {
    inrStatus = 'Weakening';
    statusBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const isPositive = change24h > 0;
  const isNegative = change24h < 0;

  return (
    <div className="card-clean p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Indian Rupee
            </h2>
            <span className="text-sm font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
              ₹ INR
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-normal">
            Primary reference currency
          </p>
        </div>

        {/* Current Status Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-normal text-zinc-500">Current Status:</span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass}`}>
            {inrStatus === 'Strengthening' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {inrStatus === 'Weakening' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {inrStatus === 'Stable' && <Minus className="w-3.5 h-3.5" />}
            {inrStatus}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-5">
        <div>
          <span className="text-xs text-zinc-500 block mb-1 font-normal">
            Current Rate ({referenceSymbol}1 {referenceCurrency})
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            ₹{currentRate ? (currentRate > 10 ? currentRate.toFixed(2) : currentRate.toFixed(4)) : '--'}
          </span>
        </div>

        <div>
          <span className="text-xs text-zinc-500 block mb-1 font-normal">
            24h Movement
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-zinc-900'
            }`}>
              {isPositive ? `+${change24h}%` : `${change24h}%`}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="text-xs text-zinc-500 block mb-1 font-normal">
            Market Tone
          </span>
          <p className="text-xs text-zinc-600 font-normal leading-relaxed pt-1">
            {inrStatus === 'Stable' && `INR is trading in a steady range against ${referenceCurrency}.`}
            {inrStatus === 'Strengthening' && `INR is gaining value relative to ${referenceCurrency}.`}
            {inrStatus === 'Weakening' && `INR is softening slightly against ${referenceCurrency}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
