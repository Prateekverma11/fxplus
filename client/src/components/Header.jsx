import React from 'react';
import { Bookmark, Activity, User, LogOut, LogIn } from 'lucide-react';
import CurrencySearchBar from './CurrencySearchBar';

export default function Header({
  currencies = [],
  selectedCurrency = 'USD',
  onSelectCurrency,
  isConnected = true,
  bookmarks = [],
  onToggleBookmark,
  onOpenBookmarks,
  user,
  onLogout,
  onOpenAuth,
  onOpenDashboard,
  currentView = 'dashboard'
}) {
  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-30 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand & Market Status */}
        <div className="flex items-center justify-between">
          <div 
            onClick={onOpenDashboard}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-clean-xs group-hover:scale-105 transition-transform">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-zinc-900 tracking-tight">
                  FXPulse
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {isConnected ? 'Live Market' : 'Connecting'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-normal hidden sm:block">
                Indian Rupee Currency Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Search, Watchlist, and Auth Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentView === 'dashboard' && (
            <div className="flex-1 sm:w-64">
              <CurrencySearchBar
                currencies={currencies}
                selectedCurrency={selectedCurrency}
                onSelectCurrency={onSelectCurrency}
                bookmarks={bookmarks}
                onToggleBookmark={onToggleBookmark}
              />
            </div>
          )}

          {/* Watchlist Drawer Button */}
          {currentView === 'dashboard' && (
            <button
              type="button"
              onClick={onOpenBookmarks}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200/90 hover:border-zinc-300 transition-all shadow-clean-xs active:scale-[0.98]"
              title="Open Bookmarked Currencies"
            >
              <Bookmark className={`w-3.5 h-3.5 transition-colors ${bookmarks.length > 0 ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'}`} />
              <span className="hidden md:inline">Watchlist</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-zinc-200/80 text-zinc-800 tabular-nums">
                {bookmarks.length}
              </span>
            </button>
          )}

          {/* User Profile / Auth State Pill */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-zinc-50 p-1 pl-2.5 rounded-xl border border-zinc-200/80">
              <span className="text-xs font-semibold text-zinc-800 truncate max-w-[100px]">
                {user.name || user.email?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={currentView === 'auth' ? onOpenDashboard : onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-clean-xs active:scale-[0.98]"
            >
              {currentView === 'auth' ? (
                <>
                  <span>Live Dashboard</span>
                  <Activity className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}




