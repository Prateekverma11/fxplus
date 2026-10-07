import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Header from './components/Header';
import NotificationToast from './components/NotificationToast';
import BookmarksDrawer from './components/BookmarksDrawer';
import Dashboard from './pages/Dashboard';
import socketService from './services/socket';
import { fetchSystemStatus, fetchCurrencies } from './services/api';
import { useBookmarks } from './hooks/useBookmarks';

// Wrapper for /analysis/:base/:quote or /currency/:code deep linking
function AnalysisRouteWrapper({ onSelectCurrency }) {
  const { base } = useParams();
  useEffect(() => {
    if (base && base !== 'INR') {
      onSelectCurrency(base.toUpperCase());
    }
  }, [base, onSelectCurrency]);

  return <Navigate to="/" replace />;
}

export default function App() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [systemStats, setSystemStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();

  // 1. Load currencies list
  useEffect(() => {
    async function loadCurrencies() {
      try {
        const res = await fetchCurrencies();
        if (res.data && res.data.length > 0) {
          setCurrencies(res.data);
        }
      } catch (err) {
        console.warn('Currencies load warning:', err.message);
      }
    }
    loadCurrencies();
  }, []);

  // 2. Poll system status
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

  // 3. Real-time WebSocket connection
  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Rate update event
    const unsubRates = socketService.subscribe('rates:updated', (data) => {
      loadStatus();
      setRefreshTrigger(prev => prev + 1);
    });

    // Alert event
    const unsubAlerts = socketService.subscribe('alert:triggered', (data) => {
      const newNotification = {
        id: Date.now(),
        type: 'alert',
        title: `Alert: ${data.alert.baseCurrency}/${data.alert.quoteCurrency}`,
        message: data.reason || `Price threshold breached: ${data.currentRate}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);
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
      <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] flex flex-col relative">
        {/* Header with Search, Bookmarks Button, and Live Status */}
        <Header
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={setSelectedCurrency}
          isConnected={isConnected}
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  selectedCurrency={selectedCurrency}
                  onSelectCurrency={setSelectedCurrency}
                  currencies={currencies}
                  systemStats={systemStats}
                  bookmarks={bookmarks}
                  onToggleBookmark={toggleBookmark}
                  isBookmarked={isBookmarked}
                />
              }
            />
            {/* Deep link backwards compatibility */}
            <Route
              path="/analysis/:base/:quote"
              element={<AnalysisRouteWrapper onSelectCurrency={setSelectedCurrency} />}
            />
            <Route
              path="/currency/:base"
              element={<AnalysisRouteWrapper onSelectCurrency={setSelectedCurrency} />}
            />
            {/* Redirect any other removed route to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Vertical Right-Side Slide-Over Drawer */}
        <BookmarksDrawer
          isOpen={isBookmarksOpen}
          onClose={() => setIsBookmarksOpen(false)}
          bookmarks={bookmarks}
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={setSelectedCurrency}
          onToggleBookmark={toggleBookmark}
          systemStats={systemStats}
        />

        {/* Real-time Alert Notification Toast */}
        <NotificationToast
          notifications={notifications}
          onDismiss={handleDismissNotification}
        />
      </div>
    </Router>
  );
}

