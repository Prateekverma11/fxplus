import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Power, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { fetchAlerts, createAlert, updateAlert, deleteAlert } from '../services/api';

export default function Alerts({ baseCurrency = 'USD' }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formBase, setFormBase] = useState(baseCurrency);
  const [formQuote, setFormQuote] = useState('INR');
  const [formCondition, setFormCondition] = useState('ABOVE');
  const [formThreshold, setFormThreshold] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const supportedQuotes = ['INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'AED'];

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetchAlerts('user_default');
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formThreshold || isNaN(formThreshold)) {
      setFormError('Please enter a valid numeric threshold.');
      return;
    }

    try {
      setFormSubmitting(true);
      await createAlert({
        userId: 'user_default',
        baseCurrency: formBase,
        quoteCurrency: formQuote,
        condition: formCondition,
        threshold: parseFloat(formThreshold),
        notes: formNotes || `${formBase}/${formQuote} ${formCondition} ${formThreshold}`
      });

      setShowCreateModal(false);
      setFormThreshold('');
      setFormNotes('');
      loadAlerts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create alert');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (alert) => {
    try {
      await updateAlert(alert.id, { active: !alert.active });
      setAlerts(alerts.map(a => a.id === alert.id ? { ...a, active: !a.active } : a));
    } catch (err) {
      console.error('Failed to toggle alert:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const activeAlerts = alerts.filter(a => a.active);
  const triggeredAlerts = alerts.filter(a => !a.active && a.triggeredAt);

  const formatCondition = (c, val, quote) => {
    switch (c) {
      case 'ABOVE': return `Rises above > ${val} ${quote}`;
      case 'BELOW': return `Falls below < ${val} ${quote}`;
      case 'PCT_CHANGE_GT': return `24H Change exceeds > ${val}%`;
      case 'PCT_CHANGE_LT': return `24H Change drops below < ${val}%`;
      default: return `${c} ${val}`;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-zinc-300" />
            Currency Alerts
          </h2>
          <p className="text-xs text-zinc-500 font-normal mt-0.5">
            Receive automated real-time notifications when price or volatility triggers are breached.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Alert</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-clean p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-normal">Total Configured</span>
            <span className="text-xl font-normal text-white block mt-1">{alerts.length}</span>
          </div>
          <Bell className="w-4 h-4 text-zinc-400" />
        </div>

        <div className="card-clean p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-normal">Active Monitoring</span>
            <span className="text-xl font-normal text-emerald-400 block mt-1">{activeAlerts.length}</span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="card-clean p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-normal">Triggered Archive</span>
            <span className="text-xl font-normal text-amber-400 block mt-1">{triggeredAlerts.length}</span>
          </div>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
      </div>

      {/* Active Rules Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-medium text-zinc-300">
          Active Alert Rules ({activeAlerts.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-normal">Loading alerts...</div>
        ) : activeAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="card-clean card-clean-hover p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-medium text-white">
                      {alert.baseCurrency}/{alert.quoteCurrency}
                    </span>
                    <p className="text-xs text-zinc-300 mt-1 font-normal">
                      {formatCondition(alert.condition, alert.threshold, alert.quoteCurrency)}
                    </p>
                    {alert.notes && (
                      <p className="text-xs text-zinc-500 mt-1 italic font-normal">
                        "{alert.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleActive(alert)}
                    className="p-1.5 rounded-lg text-emerald-400 hover:bg-[#161616] transition-colors"
                    title="Deactivate alert"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-xs text-zinc-500 font-normal">
                  <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-clean p-8 text-center text-zinc-500 text-xs font-normal">
            No active alerts configured. Click "New Alert" to create one.
          </div>
        )}
      </section>

      {/* Triggered Alerts History */}
      {triggeredAlerts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-medium text-zinc-300">
            Triggered Alerts History
          </h3>

          <div className="card-clean divide-y divide-[#1a1a1a]">
            {triggeredAlerts.map((alert) => (
              <div key={alert.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-normal">
                <div>
                  <span className="text-sm font-medium text-white">{alert.baseCurrency}/{alert.quoteCurrency}</span>
                  <p className="text-zinc-300 mt-0.5">
                    {formatCondition(alert.condition, alert.threshold, alert.quoteCurrency)}
                  </p>
                  <p className="text-zinc-500 mt-0.5">
                    Triggered: {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleString() : 'Recent'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(alert)}
                    className="px-3 py-1.5 rounded-md bg-[#0d0d0d] hover:bg-[#161616] border border-[#222222] text-zinc-300 transition-colors"
                  >
                    Reactivate
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#222222] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
              <h3 className="text-sm font-medium text-white">Create Currency Alert</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs font-normal">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Base Currency</label>
                  <select
                    value={formBase}
                    onChange={(e) => setFormBase(e.target.value)}
                    className="w-full bg-[#0d0d0d] text-white p-2.5 rounded-lg border border-[#222222] focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Quote Currency</label>
                  <select
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    className="w-full bg-[#0d0d0d] text-white p-2.5 rounded-lg border border-[#222222] focus:outline-none"
                  >
                    {supportedQuotes.filter(q => q !== formBase).map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Trigger Condition</label>
                <select
                  value={formCondition}
                  onChange={(e) => setFormCondition(e.target.value)}
                  className="w-full bg-[#0d0d0d] text-white p-2.5 rounded-lg border border-[#222222] focus:outline-none"
                >
                  <option value="ABOVE">Rate Rises Above (&gt;)</option>
                  <option value="BELOW">Rate Falls Below (&lt;)</option>
                  <option value="PCT_CHANGE_GT">24H Change Exceeds (%)</option>
                  <option value="PCT_CHANGE_LT">24H Change Drops Below (%)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">
                  Threshold Value ({formCondition.includes('PCT') ? '%' : formQuote})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={formCondition.includes('PCT') ? "2.0" : "96.50"}
                  value={formThreshold}
                  onChange={(e) => setFormThreshold(e.target.value)}
                  className="w-full bg-[#0d0d0d] text-white p-2.5 rounded-lg border border-[#222222] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Upper resistance trigger"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#0d0d0d] text-white p-2.5 rounded-lg border border-[#222222] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1a1a1a]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] text-zinc-300 border border-[#222222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 font-medium"
                >
                  {formSubmitting ? 'Saving...' : 'Activate Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
