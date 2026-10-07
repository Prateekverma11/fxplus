import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ 
  base = 'USD', 
  quote = 'INR', 
  rate = 0, 
  change24h = 0, 
  previousRate, 
  timestamp, 
  trend = 'Stable'
}) {
  const isPositive = change24h > 0;
  const isNeutral = change24h === 0;

  const formattedRate = typeof rate === 'number' ? (
    rate > 50 ? rate.toFixed(2) : rate > 1 ? rate.toFixed(4) : rate.toFixed(6)
  ) : rate;

  const formattedPrev = typeof previousRate === 'number' ? (
    previousRate > 50 ? previousRate.toFixed(2) : previousRate > 1 ? previousRate.toFixed(4) : previousRate.toFixed(6)
  ) : previousRate;

  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) : '--:--';

  return (
    <Link
      to={`/analysis/${base}/${quote}`}
      className="card-clean card-clean-hover p-5 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-200">
            {base}/{quote}
          </span>
          
          <div className={`flex items-center gap-1 text-xs font-normal ${
            isPositive ? 'text-emerald-400' : isNeutral ? 'text-zinc-500' : 'text-rose-400'
          }`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : isNeutral ? <Minus className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? `+${change24h}%` : `${change24h}%`}</span>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-2xl font-normal text-white tracking-tight">
            {formattedRate}
          </span>
          <span className="text-xs text-zinc-500 ml-1.5 font-normal">{quote}</span>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-[#1a1a1a] flex items-center justify-between text-xs text-zinc-500 font-normal">
        <span>Prev: <span className="text-zinc-300">{formattedPrev || '--'}</span></span>
        <span>{formattedTime}</span>
      </div>
    </Link>
  );
}
