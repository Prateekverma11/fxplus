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
  ShieldCheck, 
  Zap,
  Layers,
  BarChart3
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

    // Clean simulation of auth
    setTimeout(() => {
      setLoading(false);
      const user = {
        name: authMode === 'signup' ? fullName : (email.split('@')[0] || 'FX User'),
        email,
        token: `jwt_token_${Date.now()}`,
        isGuest: false
      };
      onAuthenticate(user);
    }, 400);
  };

  const handleGuestAccess = () => {
    onExploreGuest();
  };

  return (
    <div className="py-4 sm:py-8 space-y-12">
      {/* Split Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* Left Column: Product Value & Architecture (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Header & Value Proposition */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/90 text-zinc-800 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Real-Time FX Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight leading-[1.15]">
              Institutional-grade currency tracking and foreign exchange analytics.
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed max-w-xl">
              FXPulse aggregates live reference rates from global central banks and market providers. Monitor Indian Rupee pairs, detect statistical volatility shifts, and track historical trends within a focused, high-precision environment.
            </p>
          </div>

          {/* Minimal Key Capabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-clean-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-900 tracking-tight">Market Telemetry</h3>
              <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                Ingestion of live spot rates with clear distinction between provider and local timestamps.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-clean-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-900 tracking-tight">Quantitative Analytics</h3>
              <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                Multi-horizon returns, standard deviation volatility, and statistical anomaly detection.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-clean-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                <Bookmark className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-900 tracking-tight">Personalized Watchlists</h3>
              <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                Pin frequently referenced currency pairs into an accessible side panel.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-clean-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-900 tracking-tight">WebSocket Alerts</h3>
              <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                Automated threshold monitoring and instant notifications for key currency movements.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Minimalist Auth Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="card-clean p-6 sm:p-7 space-y-5 shadow-clean-sm">
            
            {/* Form Header */}
            <div className="space-y-1 text-center">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white font-bold text-sm flex items-center justify-center mx-auto mb-2.5">
                ₹
              </div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                {authMode === 'login' ? 'Sign In to FXPulse' : 'Create an Account'}
              </h2>
              <p className="text-xs text-zinc-500 font-normal">
                {authMode === 'login'
                  ? 'Access your custom watchlists and price alerts'
                  : 'Start tracking global currencies and trend analytics'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-lg border border-zinc-200/70">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
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
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
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
            <form onSubmit={handleSubmit} className="space-y-3.5">
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
                      className="w-full pl-9 pr-3 py-2 bg-white text-zinc-900 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-400"
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
                    placeholder="user@fxpulse.com"
                    className="w-full pl-9 pr-3 py-2 bg-white text-zinc-900 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-400"
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
                      onClick={() => alert('Demo Mode: Enter any password or use Guest Access.')}
                      className="text-[11px] text-zinc-400 hover:text-zinc-700 font-normal"
                    >
                      Forgot password?
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
                    className="w-full pl-9 pr-3 py-2 bg-white text-zinc-900 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 mt-1"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-zinc-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-zinc-400 font-normal absolute">
                or
              </span>
            </div>

            {/* Direct Guest Instant Access Button */}
            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full py-2.5 px-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Activity className="w-3.5 h-3.5 text-zinc-600" />
              <span>Explore Dashboard as Guest</span>
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-normal pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
              <span>Encrypted local session management</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
