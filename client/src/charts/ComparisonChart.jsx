import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const SERIES_COLORS = [
  '#EDEDED', // Crisp White
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#A1A1AA', // Neutral Silver
  '#60A5FA', // Sky
  '#F43F5E'  // Rose
];

export default function ComparisonChart({
  data = [],
  base = 'USD',
  quotes = ['INR', 'EUR', 'GBP', 'JPY'],
  mode = 'pct'
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-zinc-500 text-xs font-normal">
        No comparison data available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a] border border-[#262626] p-3 rounded-lg shadow-xl text-xs font-normal space-y-1.5">
          <p className="text-zinc-500 border-b border-[#1a1a1a] pb-1">
            {payload[0].payload.formattedDate || label}
          </p>
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="text-white font-normal">
                {mode === 'pct' ? `${item.value > 0 ? '+' : ''}${item.value}%` : Number(item.value).toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
            stroke="#52525b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#1a1a1a' }}
            tickFormatter={(v) => mode === 'pct' ? `${v}%` : v > 10 ? v.toFixed(1) : v.toFixed(3)}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '16px', fontSize: '11px', color: '#a1a1aa' }}
            iconType="circle"
          />
          {quotes.map((quote, idx) => {
            const dataKey = mode === 'pct' ? `${base}_${quote}_pct` : `${base}_${quote}`;
            const color = SERIES_COLORS[idx % SERIES_COLORS.length];
            return (
              <Line
                key={quote}
                type="monotone"
                dataKey={dataKey}
                name={`${base}/${quote}`}
                stroke={color}
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 4 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
