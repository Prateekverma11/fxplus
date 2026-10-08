import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Currencies
export const fetchCurrencies = async () => {
  const res = await api.get('/currencies');
  return res.data;
};

// Rates
export const fetchLatestRates = async (base = 'USD') => {
  const res = await api.get(`/rates/latest?base=${base}`);
  return res.data;
};

export const fetchPairRate = async (base, quote) => {
  const res = await api.get(`/rates/${base}/${quote}`);
  return res.data;
};

export const fetchPairHistory = async (base, quote, timeframe = '30D') => {
  const res = await api.get(`/rates/${base}/${quote}/history?timeframe=${timeframe}`);
  return res.data;
};

// Analytics & Markets
export const fetchPairAnalytics = async (base, quote) => {
  const res = await api.get(`/analytics/${base}/${quote}`);
  return res.data;
};

export const fetchTopMovers = async (base = 'USD') => {
  const res = await api.get(`/markets/movers?base=${base}`);
  return res.data;
};

export const fetchMarketIntelligence = async (base = 'USD') => {
  const res = await api.get(`/intelligence?base=${base}`);
  return res.data;
};

export const fetchComparison = async (base = 'USD', quotes = 'INR,EUR,GBP,JPY', timeframe = '30D') => {
  const res = await api.get(`/compare?base=${base}&quotes=${quotes}&timeframe=${timeframe}`);
  return res.data;
};

// Alerts
export const fetchAlerts = async (userId = 'user_default') => {
  const res = await api.get(`/alerts?userId=${userId}`);
  return res.data;
};

export const createAlert = async (payload) => {
  const res = await api.post('/alerts', payload);
  return res.data;
};

export const updateAlert = async (id, payload) => {
  const res = await api.patch(`/alerts/${id}`, payload);
  return res.data;
};

export const deleteAlert = async (id) => {
  const res = await api.delete(`/alerts/${id}`);
  return res.data;
};

// Admin & Health
export const triggerManualSync = async (payload = { bases: ['USD', 'EUR', 'GBP'], seedHistorical: false }) => {
  const res = await api.post('/admin/sync', payload);
  return res.data;
};

export const fetchSystemStatus = async () => {
  const res = await api.get('/status');
  return res.data;
};

export default api;

