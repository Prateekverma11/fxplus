import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Check } from 'lucide-react';
import ComparisonChart from '../charts/ComparisonChart';
import { fetchComparison } from '../services/api';
import { ChartSkeleton } from '../components/LoadingSkeleton';

const AVAILABLE_QUOTES = ['INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'AED'];

export default function CurrencyComparison({ baseCurrency = 'USD' }) {
  const [searchParams] = useSearchParams();
  const initialQuotes = searchParams.get('quotes') 
    ? searchParams.get('quotes').split(',') 
    : ['INR', 'EUR', 'GBP', 'JPY'];

  const [selectedQuotes, setSelectedQuotes] = useState(initialQuotes);
  const [timeframe, setTimeframe] = useState('30D');
  const [mode, setMode] = useState('pct'); // 'pct' or 'raw'
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState([]);

  const toggleQuote = (quote) => {
    if (selectedQuotes.includes(quote)) {
      if (selectedQuotes.length > 1) {
        setSelectedQuotes(selectedQuotes.filter(q => q !== quote));
      }
    } else {
      if (selectedQuotes.length < 6) {
        setSelectedQuotes([...selectedQuotes, quote]);
      }
    }
  };

  const loadData = async () => {
    if (selectedQuotes.length === 0) return;
    try {
      setLoading(true);
      const res = await fetchComparison(baseCurrency, selectedQuotes.join(','), timeframe);
      setComparisonData(res.data || []);
    } catch (err) {
      console.error('Failed to load comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [baseCurrency, selectedQuotes, timeframe]);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-zinc-300" />
            Currency Pair Comparison
          </h2>
          <p className="text-xs text-zinc-500 font-normal mt-0.5">
            Compare relative performance across multiple currencies against {baseCurrency}.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-normal">
          {/* Normalization Mode Toggle */}
          <div className="flex items-center bg-[#0d0d0d] p-1 rounded-lg border border-[#222222]">
            <button
              onClick={() => setMode('pct')}
              className={`px-3 py-1 rounded-md transition-colors ${
                mode === 'pct' ? 'bg-white text-black font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              % Return
            </button>
            <button
              onClick={() => setMode('raw')}
              className={`px-3 py-1 rounded-md transition-colors ${
                mode === 'raw' ? 'bg-white text-black font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Spot Rates
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-[#0d0d0d] p-1 rounded-lg border border-[#222222]">
            {['7D', '30D', '90D', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeframe === tf ? 'bg-white text-black font-medium' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Currency Selection Badges */}
      <div className="card-clean p-5 space-y-3">
        <span className="text-xs text-zinc-400 font-normal block">
          Select currencies to compare (up to 6):
        </span>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_QUOTES.map((quote) => {
            const isSelected = selectedQuotes.includes(quote);
            return (
              <button
                key={quote}
                onClick={() => toggleQuote(quote)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-normal transition-colors ${
                  isSelected
                    ? 'bg-white text-black font-medium'
                    : 'bg-[#0d0d0d] text-zinc-400 hover:text-zinc-200 border border-[#222222]'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{baseCurrency}/{quote}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Chart Panel */}
      <div className="card-clean p-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-white">
            Performance Comparison ({timeframe})
          </h3>
          <p className="text-xs text-zinc-500 font-normal mt-0.5">
            {mode === 'pct' 
              ? 'Indexed to 0% at start of period for relative comparison' 
              : 'Nominal reference exchange rates'}
          </p>
        </div>

        {loading ? (
          <ChartSkeleton />
        ) : (
          <ComparisonChart
            data={comparisonData}
            base={baseCurrency}
            quotes={selectedQuotes}
            mode={mode}
            timeframe={timeframe}
          />
        )}
      </div>
    </div>
  );
}
