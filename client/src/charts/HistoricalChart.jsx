import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function HistoricalChart({
  data = [],
  pair = 'USD/INR',
  timeframe = '30D',
  onTimeframeChange
}) {
  const timeframes = ['1D', '7D', '30D', '90D', '1Y'];

  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-xs font-normal">
        No historical data available.
      </div>
    );
  }

  const rates = data.map(d => d.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const padding = (maxRate - minRate) * 0.1 || minRate * 0.01;
  const yDomain = [minRate - padding, maxRate + padding];

  const firstRate = rates[0];
  const lastRate = rates[rates.length - 1];
  const periodChange = firstRate ? (((lastRate - firstRate) / firstRate) * 100).toFixed(2) : 0;
  const isPositive = periodChange >= 0;

  const gradientId = `chartGrad_${pair.replace('/', '_')}`;
  const strokeColor = '#EDEDED';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-[#0a0a0a] border border-[#262626] px-3.5 py-2.5 rounded-lg shadow-xl text-xs font-normal">
          <p className="text-zinc-500 mb-1">{point.formattedDate || new Date(point.timestamp).toLocaleDateString()}</p>
          <div className="text-sm font-normal text-white">
            {Number(point.rate).toFixed(4)} <span className="text-xs text-zinc-500">{pair.split('/')[1]}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-5">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-white">{pair} Trajectory</h3>
            <span className={`text-xs font-normal ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? `+${periodChange}%` : `${periodChange}%`} ({timeframe})
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-normal mt-0.5">
            Range: {minRate.toFixed(4)} &ndash; {maxRate.toFixed(4)}
          </p>
        </div>

        {/* Timeframe Selector */}
        {onTimeframeChange && (
          <div className="flex items-center bg-[#0d0d0d] rounded-lg p-1 border border-[#222222]">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeframe === tf
                    ? 'bg-white text-black font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 font-normal'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.12} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              stroke="#52525b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1a1a1a' }}
              minTickGap={30}
            />
            <YAxis
              domain={yDomain}
              stroke="#52525b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1a1a1a' }}
              tickFormatter={(v) => v > 10 ? v.toFixed(2) : v.toFixed(3)}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={strokeColor}
              strokeWidth={1.75}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
