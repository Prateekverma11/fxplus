import React, { useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { triggerManualSync } from '../services/api';

export default function Header({ 
  marketTimestamp, 
  dataSource = 'External FX API', 
  baseCurrency = 'USD', 
  onBaseChange,
  onRefresh
}) {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await triggerManualSync({ bases: ['USD', 'EUR', 'GBP'] });
      setSyncMessage(`Updated`);
      if (onRefresh) onRefresh();
      setTimeout(() => setSyncMessage(null), 2500);
    } catch (err) {
      setSyncMessage('Failed');
      setTimeout(() => setSyncMessage(null), 2500);
    } finally {
      setSyncing(false);
    }
  };

  const formatUtcTime = (d) => {
    if (!d) return '--:-- UTC';
    const date = new Date(d);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: 'UTC',
      hour12: false 
    }) + ' UTC';
  };

  return (
    <header className="bg-black sticky top-0 z-30 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1a1a1a]">
      {/* Title */}
      <div>
        <h1 className="text-lg font-medium text-white tracking-normal">
          Currency Intelligence
        </h1>
        <p className="text-xs text-zinc-500 font-normal mt-0.5">
          Monitor currency movements, trends, and market signals.
        </p>
      </div>

      {/* Metadata & Actions */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-normal">
        {/* Market Data Timestamp */}
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>Last market data:</span>
          <span className="text-zinc-200">{formatUtcTime(marketTimestamp)}</span>
        </div>

        {/* Source */}
        <span className="text-zinc-700">&bull;</span>
        <div className="text-zinc-400">
          Source: <span className="text-zinc-200">{dataSource}</span>
        </div>

        {/* Base Currency Switcher */}
        {onBaseChange && (
          <div className="flex items-center bg-[#0d0d0d] rounded-lg p-1 border border-[#222222] ml-2">
            {['USD', 'EUR', 'GBP'].map((code) => (
              <button
                key={code}
                onClick={() => onBaseChange(code)}
                className={`px-3 py-1 rounded-md text-xs transition-colors ${
                  baseCurrency === code
                    ? 'bg-white text-black font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 font-normal'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        )}

        {/* Simple Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0d0d0d] hover:bg-[#161616] text-zinc-300 hover:text-white border border-[#222222] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-white' : 'text-zinc-500'}`} />
          <span>{syncing ? 'Syncing...' : syncMessage || 'Sync Data'}</span>
        </button>
      </div>
    </header>
  );
}
