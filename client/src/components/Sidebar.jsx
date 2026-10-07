import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  LineChart, 
  BrainCircuit, 
  Bell, 
  Settings, 
  ArrowLeftRight,
  Activity
} from 'lucide-react';

export default function Sidebar({ isConnected }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Markets', path: '/markets', icon: TrendingUp },
    { name: 'Analysis', path: '/analysis/USD/INR', icon: LineChart },
    { name: 'Comparison', path: '/comparison', icon: ArrowLeftRight },
    { name: 'Intelligence', path: '/intelligence', icon: BrainCircuit },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-black flex flex-col flex-shrink-0 min-h-screen select-none border-r border-[#1a1a1a]">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <span className="text-base font-medium text-white tracking-normal">
            FX<span className="text-zinc-400 font-normal">Pulse</span>
          </span>
          <p className="text-xs text-zinc-500 font-normal">Currency Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-zinc-900 text-white font-medium border border-zinc-800'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#111111] font-normal'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Subtle Live Connection Status */}
      <div className="p-6 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-normal">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span>{isConnected ? 'Market Stream Active' : 'Connecting...'}</span>
        </div>
      </div>
    </aside>
  );
}
