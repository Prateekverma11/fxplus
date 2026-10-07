import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpRight } from 'lucide-react';
import { fetchTopMovers } from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';

export default function Markets({ baseCurrency = 'USD' }) {
  const [loading, setLoading] = useState(true);
  const [pairsList, setPairsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [volatilityFilter, setVolatilityFilter] = useState('ALL');
  const [trendFilter, setTrendFilter] = useState('ALL');
  const [sortField, setSortField] = useState('pair');
  const [sortAsc, setSortAsc] = useState(true);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const res = await fetchTopMovers(baseCurrency);
      if (res && res.data && res.data.allTracked) {
        setPairsList(res.data.allTracked);
      }
    } catch (err) {
      console.error('Failed to load market pairs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, [baseCurrency]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredPairs = pairsList
    .filter((item) => {
      const matchesSearch = 
        item.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.quote.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesVolatility = 
        volatilityFilter === 'ALL' || item.volatilityCategory === volatilityFilter;

      const matchesTrend = 
        trendFilter === 'ALL' || item.trend === trendFilter;

      return matchesSearch && matchesVolatility && matchesTrend;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  const getTrendText = (trend) => {
    if (trend === 'Rising') return <span className="text-emerald-400 font-normal">↗ Rising</span>;
    if (trend === 'Falling') return <span className="text-rose-400 font-normal">↘ Falling</span>;
    return <span className="text-zinc-500 font-normal">→ Stable</span>;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-white">Foreign Exchange Markets</h2>
          <p className="text-xs text-zinc-500 font-normal mt-0.5">
            Reference spot rates, multi-period returns, and calculated volatility.
          </p>
        </div>
        <div className="text-xs text-zinc-500 font-normal">
          {filteredPairs.length} tracked pairs
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-clean p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search currency (e.g. INR, EUR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d0d0d] text-zinc-200 text-xs pl-10 pr-4 py-2 rounded-lg border border-[#222222] focus:outline-none placeholder:text-zinc-600 font-normal"
          />
        </div>

        {/* Volatility Filter */}
        <div className="flex items-center gap-2 text-xs font-normal">
          <span className="text-zinc-500">Volatility:</span>
          <select
            value={volatilityFilter}
            onChange={(e) => setVolatilityFilter(e.target.value)}
            className="bg-[#0d0d0d] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#222222] focus:outline-none"
          >
            <option value="ALL">All Volatilities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Trend Filter */}
        <div className="flex items-center gap-2 text-xs font-normal">
          <span className="text-zinc-500">Trend:</span>
          <select
            value={trendFilter}
            onChange={(e) => setTrendFilter(e.target.value)}
            className="bg-[#0d0d0d] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#222222] focus:outline-none"
          >
            <option value="ALL">All Trends</option>
            <option value="Rising">Rising</option>
            <option value="Falling">Falling</option>
            <option value="Stable">Stable</option>
          </select>
        </div>
      </div>

      {/* Markets Table */}
      <div className="card-clean overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-xs font-normal text-zinc-500">
                  <th className="py-3.5 px-6 cursor-pointer hover:text-zinc-300" onClick={() => handleSort('pair')}>
                    Currency {sortField === 'pair' && (sortAsc ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-5 cursor-pointer hover:text-zinc-300" onClick={() => handleSort('rate')}>
                    Current Rate {sortField === 'rate' && (sortAsc ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-5 cursor-pointer hover:text-zinc-300" onClick={() => handleSort('change24h')}>
                    24H Change {sortField === 'change24h' && (sortAsc ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-5 cursor-pointer hover:text-zinc-300" onClick={() => handleSort('change7d')}>
                    7D Change {sortField === 'change7d' && (sortAsc ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-5 cursor-pointer hover:text-zinc-300" onClick={() => handleSort('change30d')}>
                    30D Change {sortField === 'change30d' && (sortAsc ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-5 cursor-pointer hover:text-zinc-300" onClick={() => handleSort('volatility')}>
                    Volatility {sortField === 'volatility' && (sortAsc ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-5">Trend</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a] text-xs font-normal">
                {filteredPairs.length > 0 ? (
                  filteredPairs.map((item) => (
                    <tr
                      key={item.pair}
                      className="hover:bg-[#121212] transition-colors"
                    >
                      <td className="py-3.5 px-6 font-medium text-zinc-200">
                        <Link to={`/analysis/${item.base}/${item.quote}`} className="hover:text-white transition-colors">
                          {item.pair}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-zinc-300 font-normal">
                        {item.rate > 10 ? item.rate.toFixed(2) : item.rate.toFixed(4)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={item.change24h > 0 ? 'text-emerald-400' : item.change24h < 0 ? 'text-rose-400' : 'text-zinc-500'}>
                          {item.change24h > 0 ? `+${item.change24h}%` : `${item.change24h}%`}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={item.change7d > 0 ? 'text-emerald-400' : item.change7d < 0 ? 'text-rose-400' : 'text-zinc-500'}>
                          {item.change7d > 0 ? `+${item.change7d}%` : `${item.change7d}%`}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={item.change30d > 0 ? 'text-emerald-400' : item.change30d < 0 ? 'text-rose-400' : 'text-zinc-500'}>
                          {item.change30d > 0 ? `+${item.change30d}%` : `${item.change30d}%`}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-zinc-400">
                        {item.volatilityCategory} ({item.volatility}%)
                      </td>
                      <td className="py-3.5 px-5">
                        {getTrendText(item.trend)}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          to={`/analysis/${item.base}/${item.quote}`}
                          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors font-normal"
                        >
                          <span>Analyze</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-zinc-500 font-normal">
                      No currency pairs match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
