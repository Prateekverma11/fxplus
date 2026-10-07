import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  ShieldAlert, 
  CheckCircle2
} from 'lucide-react';
import { fetchMarketIntelligence } from '../services/api';

export default function Intelligence({ baseCurrency = 'USD' }) {
  const [loading, setLoading] = useState(true);
  const [intel, setIntel] = useState(null);

  const loadIntelligence = async () => {
    try {
      setLoading(true);
      const res = await fetchMarketIntelligence(baseCurrency);
      setIntel(res.data);
    } catch (err) {
      console.error('Failed to load intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntelligence();
  }, [baseCurrency]);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-medium text-white tracking-normal flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-zinc-300" />
          Market Intelligence &amp; Analytics
        </h2>
        <p className="text-xs text-zinc-500 font-normal mt-0.5">
          Calculated trend rankings, volatility metrics, and statistical anomaly detection.
        </p>
      </div>

      {/* 1. Market Summary */}
      <section className="card-clean p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">
            Market Summary ({baseCurrency} Base)
          </h3>
          <span className="text-xs text-zinc-500 font-normal">Calculated Signals</span>
        </div>

        <p className="text-xs text-zinc-300 font-normal leading-relaxed">
          {intel?.summary || "Computing statistical variance across historical observations..."}
        </p>

        {intel?.statements && intel.statements.length > 0 && (
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {intel.statements.map((statement, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-400 bg-[#0d0d0d] border border-[#1a1a1a] p-3 rounded-lg font-normal leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                <span>{statement}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Strongest & Weakest Currencies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Strongest Currencies */}
        <section className="card-clean p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1a1a1a]">
            <h3 className="text-xs font-medium text-white flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Strongest Currencies (7-Day Return)
            </h3>
          </div>

          <div className="space-y-1.5 text-xs font-normal">
            {intel?.strongest && intel.strongest.length > 0 ? (
              intel.strongest.map((item, idx) => (
                <div key={item.pair} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 font-normal text-[11px]">#{idx + 1}</span>
                    <div>
                      <span className="text-zinc-200 font-normal">{item.pair}</span>
                      <span className="text-zinc-500 block text-[10px]">
                        Rate: {item.currentRate > 10 ? item.currentRate.toFixed(2) : item.currentRate.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-normal">+{item.change7d}%</span>
                    <span className="text-zinc-500 text-[10px] block">{item.trend}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-4">No ranking data available</p>
            )}
          </div>
        </section>

        {/* Weakest Currencies */}
        <section className="card-clean p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1a1a1a]">
            <h3 className="text-xs font-medium text-white flex items-center gap-2">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              Weakest Currencies (7-Day Return)
            </h3>
          </div>

          <div className="space-y-1.5 text-xs font-normal">
            {intel?.weakest && intel.weakest.length > 0 ? (
              intel.weakest.map((item, idx) => (
                <div key={item.pair} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 font-normal text-[11px]">#{idx + 1}</span>
                    <div>
                      <span className="text-zinc-200 font-normal">{item.pair}</span>
                      <span className="text-zinc-500 block text-[10px]">
                        Rate: {item.currentRate > 10 ? item.currentRate.toFixed(2) : item.currentRate.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-rose-400 font-normal">{item.change7d}%</span>
                    <span className="text-zinc-500 text-[10px] block">{item.trend}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-4">No ranking data available</p>
            )}
          </div>
        </section>
      </div>

      {/* 3. Highest Volatility & Anomalies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Volatility */}
        <section className="card-clean p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1a1a1a]">
            <h3 className="text-xs font-medium text-white flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Highest Volatility Index
            </h3>
          </div>

          <div className="space-y-1.5 text-xs font-normal">
            {intel?.highestVolatility && intel.highestVolatility.length > 0 ? (
              intel.highestVolatility.map((item, idx) => (
                <div key={item.pair} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 font-normal text-[11px]">#{idx + 1}</span>
                    <div>
                      <span className="text-zinc-200 font-normal">{item.pair}</span>
                      <span className="text-zinc-500 block text-[10px]">{item.category} Volatility</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-normal">{item.volatility}% σ</span>
                    <span className="text-zinc-500 text-[10px] block">Std Dev: {item.stdDev}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-4">No volatility metrics calculated</p>
            )}
          </div>
        </section>

        {/* Anomaly Detection */}
        <section className="card-clean p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1a1a1a]">
            <h3 className="text-xs font-medium text-white flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-300" />
              Statistical Anomaly Detector (Z-Score &gt; 2.0σ)
            </h3>
          </div>

          <div className="space-y-2 text-xs font-normal">
            {intel?.unusualMovements && intel.unusualMovements.length > 0 ? (
              intel.unusualMovements.map((item) => (
                <div key={item.pair} className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a] space-y-1">
                  <div className="flex items-center justify-between text-zinc-200">
                    <span className="font-medium">{item.pair}</span>
                    <span className="text-zinc-400">Z-Score: {item.zScore}σ</span>
                  </div>
                  <p className="text-zinc-500">
                    Latest 24H return of {item.change24h}% deviates from rolling daily variance.
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a] text-center space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                <p className="text-xs text-zinc-200 font-medium">No Statistical Anomalies Detected</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed max-w-sm mx-auto">
                  All active currency pairs are currently trading within the normal 2.0-sigma historical volatility corridor.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
