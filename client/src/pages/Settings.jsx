import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Server, 
  Key, 
  RefreshCw, 
  Clock,
  Code
} from 'lucide-react';
import { fetchSystemStatus, triggerManualSync } from '../services/api';

export default function Settings() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [seedHistorical, setSeedHistorical] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await fetchSystemStatus();
      setStatus(res);
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await triggerManualSync({
        bases: ['USD', 'EUR', 'GBP'],
        seedHistorical,
        days: 120
      });
      setSyncFeedback({
        type: 'success',
        message: `Synchronized ${res.data?.recordsCount || 0} rates in ${res.data?.durationMs || 0}ms.`
      });
      loadStatus();
    } catch (err) {
      setSyncFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Sync operation failed.'
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-zinc-300" />
          Settings &amp; Data Pipeline
        </h2>
        <p className="text-xs text-zinc-500 font-normal mt-0.5">
          Provider configuration, database inspection, and background sync intervals.
        </p>
      </div>

      {/* Sync Feedback */}
      {syncFeedback && (
        <div
          className={`p-3.5 rounded-xl text-xs ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {syncFeedback.message}
        </div>
      )}

      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-clean p-4 space-y-1">
          <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-normal">
            <Database className="w-3.5 h-3.5 text-zinc-400" /> Stored Rates
          </span>
          <span className="text-xl font-normal text-white block">
            {status?.stats?.totalRateObservations || 0}
          </span>
          <span className="text-xs text-zinc-600 font-normal">Database records</span>
        </div>

        <div className="card-clean p-4 space-y-1">
          <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-normal">
            <Server className="w-3.5 h-3.5 text-zinc-400" /> Active Provider
          </span>
          <span className="text-base font-medium text-white block truncate">
            {status?.provider?.name || 'ExchangeRate-API'}
          </span>
          <span className="text-xs text-zinc-600 font-normal">Fallback active</span>
        </div>

        <div className="card-clean p-4 space-y-1">
          <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-normal">
            <Clock className="w-3.5 h-3.5 text-zinc-400" /> Sync Schedule
          </span>
          <span className="text-sm font-normal text-zinc-200 block pt-0.5">
            Every 15 minutes
          </span>
          <span className="text-xs text-zinc-600 font-normal">node-cron worker</span>
        </div>

        <div className="card-clean p-4 space-y-1">
          <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-normal">
            <Key className="w-3.5 h-3.5 text-zinc-400" /> Provider Key
          </span>
          <span className="text-sm font-normal text-emerald-400 block pt-0.5">
            Configured (.env)
          </span>
          <span className="text-xs text-zinc-600 font-normal">Protected server-side</span>
        </div>
      </div>

      {/* Manual Data Ingestion */}
      <section className="card-clean p-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-white">
            Manual Data Synchronization
          </h3>
          <p className="text-xs text-zinc-500 font-normal mt-0.5">
            Trigger an immediate poll of external FX endpoints to update rates and evaluate alerts.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a] space-y-3 text-xs font-normal">
          <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={seedHistorical}
              onChange={(e) => setSeedHistorical(e.target.checked)}
              className="rounded bg-[#141414] border-[#222222] text-white focus:ring-0 w-4 h-4"
            />
            <span>Also backfill full 120-day historical time-series</span>
          </label>

          <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
            <span className="text-zinc-500">
              Tracked Bases: USD, EUR, GBP
            </span>

            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Market Now'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Provider & Environment Notes */}
      <section className="card-clean p-6 space-y-4">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-zinc-300" />
          Environment Configuration Reference
        </h3>

        <div className="space-y-1.5 text-xs text-zinc-300 font-mono bg-[#0d0d0d] border border-[#1a1a1a] p-4 rounded-lg">
          <p className="text-zinc-500"># Server Environment Variables (server/.env)</p>
          <p>DATABASE_URL="file:./dev.db"</p>
          <p>FX_API_URL="https://open.er-api.com/v6"</p>
          <p>FX_API_KEY="exr_live_HWi1vgDPuJ7HLsVSKScCcpSnaTQijoLY-sYOyTkU5iI"</p>
          <p>PORT=5000</p>
          <p>CRON_SCHEDULE="*/15 * * * *"</p>
        </div>
      </section>
    </div>
  );
}
