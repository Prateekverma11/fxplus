import React from 'react';
import { Bell, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationToast({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto bg-[#0d0d0d] border border-[#262626] rounded-xl p-4 shadow-2xl flex items-start gap-3 transform transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-300 flex items-center justify-center flex-shrink-0 border border-zinc-800">
            {n.type === 'alert' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <Bell className="w-4 h-4 text-zinc-300" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white tracking-tight">{n.title || 'Market Alert Triggered'}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{n.time}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {n.message}
            </p>
            {n.link && (
              <Link
                to={n.link}
                className="text-[11px] text-white hover:text-zinc-300 font-medium mt-1.5 inline-block underline underline-offset-2"
              >
                View Analytics &rarr;
              </Link>
            )}
          </div>

          <button
            onClick={() => onDismiss(n.id)}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
