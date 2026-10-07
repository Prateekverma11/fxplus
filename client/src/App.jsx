import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NotificationToast from './components/NotificationToast';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import CurrencyAnalysis from './pages/CurrencyAnalysis';
import CurrencyComparison from './pages/CurrencyComparison';
import Intelligence from './pages/Intelligence';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import socketService from './services/socket';
import { fetchSystemStatus } from './services/api';

export default function App() {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [isConnected, setIsConnected] = useState(false);
  const [systemStats, setSystemStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadStatus = async () => {
    try {
      const res = await fetchSystemStatus();
      setSystemStats({
        totalObservations: res.stats?.totalRateObservations,
        activeAlerts: res.stats?.activeAlerts,
        lastSync: res.stats?.lastSync?.timestamp,
        marketTimestamp: res.stats?.lastSync?.marketTimestamp,
        provider: res.provider?.name
      });
    } catch (err) {
      console.warn('Status poll:', err.message);
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // Setup Socket.IO real-time connection
  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Rate update event
    const unsubRates = socketService.subscribe('rates:updated', (data) => {
      console.log('[App] New rates updated from server:', data);
      loadStatus();
      setRefreshTrigger(prev => prev + 1);
    });

    // Alert triggered event
    const unsubAlerts = socketService.subscribe('alert:triggered', (data) => {
      console.log('[App] Alert triggered:', data);
      const newNotification = {
        id: Date.now(),
        type: 'alert',
        title: `Alert: ${data.alert.baseCurrency}/${data.alert.quoteCurrency}`,
        message: data.reason || `Price threshold breached: ${data.currentRate}`,
        time: new Date().toLocaleTimeString(),
        link: `/analysis/${data.alert.baseCurrency}/${data.alert.quoteCurrency}`
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
      loadStatus();
    });

    return () => {
      unsubRates();
      unsubAlerts();
      socketService.disconnect();
    };
  }, []);

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-black text-[#EDEDED]">
        {/* Left Sidebar */}
        <Sidebar isConnected={isConnected} stats={systemStats} />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            marketTimestamp={systemStats?.marketTimestamp}
            dataSource={systemStats?.provider || 'External FX Provider'}
            lastSyncTime={systemStats?.lastSync}
            baseCurrency={baseCurrency}
            onBaseChange={setBaseCurrency}
            onRefresh={() => setRefreshTrigger(t => t + 1)}
          />

          <main className="flex-1 px-8 py-6 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard baseCurrency={baseCurrency} />} />
              <Route path="/markets" element={<Markets baseCurrency={baseCurrency} />} />
              <Route path="/analysis/:base/:quote" element={<CurrencyAnalysis />} />
              <Route path="/analysis" element={<Navigate to="/analysis/USD/INR" replace />} />
              <Route path="/comparison" element={<CurrencyComparison baseCurrency={baseCurrency} />} />
              <Route path="/intelligence" element={<Intelligence baseCurrency={baseCurrency} />} />
              <Route path="/alerts" element={<Alerts baseCurrency={baseCurrency} />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Real-Time Alert Toast Stream */}
        <NotificationToast
          notifications={notifications}
          onDismiss={handleDismissNotification}
        />
      </div>
    </Router>
  );
}
