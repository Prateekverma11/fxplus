import React, { useState } from 'react';
import { 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  Bookmark, 
  Bell, 
  ArrowRightLeft, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

export default function WelcomeAuth({
  onAuthenticate,
  onExploreGuest,
  currencies = [],
  ratesMap = {}
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick live rates for hero preview ticker
  const previewPairs = [
    { code: 'USD', name: 'US Dollar', symbol: '$', fallbackRate: 86.42, change: '+0.12%' },
    { code: 'EUR', name: 'Euro', symbol: '€', fallbackRate: 91.15, change: '-0.08%' },
    { code: 'GBP', name: 'British Pound', symbol: '£', fallbackRate: 108.80, change: '+0.25%' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', fallbackRate: 23.53, change: '+0.05%' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (authMode === 'signup' && !fullName) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    // Simulate clean authentication
    setTimeout(() => {
      setLoading(false);
      const user = {
        name: authMode === 'signup' ? fullName : (email.split('@')[0] || 'FX Trader'),
        email,
        token: `mock_jwt_${Date.now()}`,
        isGuest: false
      };
      onAuthenticate(user);
    }, 400);
  };

  const handleGuestAccess = () => {
    onExploreGuest();
  };

  return (
    <div className="py-2 sm:py-6 space-y-12">
      {/* Top Value Proposition & Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Product Story & Core Features (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Badge & Main Heading */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold shadow-clean-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Indian Rupee (INR) Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.15]">
              Track, analyse, and monitor foreign exchange rates with clarity.
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed max-w-xl">
              FXPulse delivers institutional-grade currency tracking designed around the Indian Rupee. 
              Get live streaming spot rates, historical trends, customized watchlists, and price alerts in a minimalist interface.
            </p>
          </div>

          {/* Live Preview Ticker Strip */}
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-clean-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
              <span className="flex items-center gap-1 text-zinc-600 font-semibold">
                <Globe className="w-3.5 h-3.5" />
                Live Spot Benchmarks
              </span>
              <span>Updated via Live FX Providers</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {previewPairs.map((p) => {
                const liveRate = ratesMap[p.code]?.rate || p.fallbackRate;
                return (
                  <div key={p.code} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">{p.code}/INR</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{p.symbol}</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-sm font-bold text-zinc-900 tabular-nums">
                        ₹{Number(liveRate).toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-semibold ${
                        p.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {p.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Minimal Key Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-clean-xs space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 tracking-tight">Real-Time Streaming</h3>
              <p className="text-xs text-zinc-500 font-normal leading-normal">
                Sub-second rate updates and WebSocket alerts for accurate spot valuation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-clean-xs space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 tracking-tight">Historical Charts</h3>
              <p className="text-xs text-zinc-500 font-normal leading-normal">
                Interactive 7D to 1Y performance timelines with high, low & volatility metrics.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-clean-xs space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 tracking-tight">Spot Calculator</h3>
              <p className="text-xs text-zinc-500 font-normal leading-normal">
                Two-way conversion calculator for instant currency exchanges.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-clean-xs space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
                <Bookmark className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 tracking-tight">Custom Watchlist</h3>
              <p className="text-xs text-zinc-500 font-normal leading-normal">
                Pin your frequent currencies into a quick slide-over intelligence drawer.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Clean Minimalist Login / Signup Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="card-clean p-6 sm:p-8 space-y-6 shadow-clean-md">
            
            {/* Form Header */}
            <div className="space-y-1 text-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white font-bold text-base flex items-center justify-center mx-auto mb-3 shadow-clean-xs">
                ₹
              </div>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                {authMode === 'login' ? 'Welcome to FXPulse' : 'Create your account'}
              </h2>
              <p className="text-xs text-zinc-500 font-normal">
                {authMode === 'login'
                  ? 'Sign in to access your watchlists and customized currency alerts'
                  : 'Start tracking global currencies and manage exchange rate notifications'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200/80">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-zinc-900 shadow-clean-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'signup'
                    ? 'bg-white text-zinc-900 shadow-clean-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-9 pr-3 py-2.5 bg-white text-zinc-900 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@fxpulse.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white text-zinc-900 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700 block">
                    Password
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => alert('Demo Mode: You can enter any password or use Guest Access!')}
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 font-normal"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-white text-zinc-900 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-all shadow-clean-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-zinc-400 font-normal absolute">
                or explore directly
              </span>
            </div>

            {/* Direct Guest Instant Access Button */}
            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full py-2.5 px-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Explore Live Dashboard as Guest</span>
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-normal">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit encrypted & secure market intelligence</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
