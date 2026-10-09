# FXPulse — Currency Intelligence Platform

> **Disclaimer:** FXPulse is a quantitative analytics and currency intelligence platform designed for market observation, historical trend detection, and foreign exchange risk analytics. It is **NOT** a brokerage or trading execution platform.

---

## Executive Overview

**FXPulse** is a full-stack financial intelligence web application engineered to transform raw foreign exchange (FX) market quotes into actionable quantitative signals. Rather than functioning as a simplistic currency converter, FXPulse ingests reference rates from global FX providers, persists chronological market time series into an indexed database, and executes transparent mathematical analytics across multiple time horizons.

---

## System Architecture

```
                                  ┌───────────────────────────┐
                                  │   External FX Providers   │
                                  │ (ExchangeRate-API, ECB)   │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
┌──────────────────┐               ┌───────────────────────────┐
│ React + Vite UI  │ ◄─── REST ─── │ Express.js Backend Engine │
│ Tailwind + Glass │ ◄─ WebSocket ─┤  (fxService & Analytics)  │
└──────────────────┘               └─────────────┬─────────────┘
                                                │
                                                ▼
                                   ┌───────────────────────────┐
                                   │ PostgreSQL / SQLite (DB)  │
                                   │  Prisma ORM with Indexes  │
                                   └───────────────────────────┘
```

---

## Key Features

- **Live Market Telemetry**: Ingests and displays reference spot rates with clear distinction between external market timestamps (e.g. `14:30 UTC`) and system request time.
- **Provider Abstraction Layer**: Pluggable provider architecture (`ExchangeRateApiProvider`, `FrankfurterProvider`, `FxRatesApiProvider`) with automatic multi-tier fallback.
- **Quantitative Analytics Engine**:
  - **Multi-Horizon Returns**: 24H, 7D, 30D, 90D, and 1Y percentage changes.
  - **Return Volatility & Standard Deviation**: Rolling standard deviation of daily returns ($\sigma$).
  - **Moving Average Trend Detector**: Transparent rule comparing short-term 7D moving averages against 30D baselines.
  - **Statistical Anomaly / Unusual Movement Detector**: Flags movements exceeding $2.0\sigma$ ($Z\text{-score} \ge 2.0$) against historical distributions.
- **Interactive Visualizations**: High-performance Recharts area and multi-series line charts with dynamic timeframe selectors (1D, 7D, 30D, 90D, 1Y).
- **Multi-Currency Overlay Comparison**: Compare up to 6 currency pairs simultaneously with indexed percentage return normalization.
- **Real-Time Price & Volatility Alerts**: Create custom thresholds (`ABOVE`, `BELOW`, `PCT_CHANGE_GT`, `PCT_CHANGE_LT`) evaluated continuously by background cron workers and streamed via WebSocket (`Socket.IO`).
- **Resilient Fallback**: Zero downtime and zero fake data—gracefully falls back to stored database snapshots if third-party providers experience downtime.

---

## Technology Stack

### Frontend
- **React 18** (Vite build toolchain)
- **Tailwind CSS** (Clean minimalist design system)
- **Recharts** (Quantitative financial area and multi-series charts)
- **React Router 6** (Single-page app routing)
- **Lucide React** (Icon suite)
- **Socket.IO Client** (Real-time gateway subscription)
- **Axios** (REST client)

### Backend
- **Node.js & Express.js**
- **Prisma ORM** (Configured for PostgreSQL and SQLite)
- **node-cron** (Scheduled market ingestion & alert engine)
- **Socket.IO** (Real-time WebSocket event broadcaster)
- **Axios** (External API integration)

---

## Database Schema (Prisma)

```prisma
model Currency {
  id        String   @id @default(cuid())
  code      String   @unique
  name      String
  symbol    String?
  createdAt DateTime @default(now())
}

model ExchangeRate {
  id            String   @id @default(cuid())
  baseCurrency  String
  quoteCurrency String
  rate          Float
  timestamp     DateTime
  source        String
  createdAt     DateTime @default(now())

  @@index([baseCurrency])
  @@index([quoteCurrency])
  @@index([timestamp])
  @@index([baseCurrency, quoteCurrency, timestamp])
  @@unique([baseCurrency, quoteCurrency, timestamp])
}

model Alert {
  id            String    @id @default(cuid())
  userId        String    @default("user_default")
  baseCurrency  String
  quoteCurrency String
  condition     String    // "ABOVE", "BELOW", "PCT_CHANGE_GT", "PCT_CHANGE_LT"
  threshold     Float
  active        Boolean   @default(true)
  triggeredAt   DateTime?
  lastCheckedAt DateTime?
  notes         String?
  createdAt     DateTime  @default(now())
}

model SyncLog {
  id              String    @id @default(cuid())
  provider        String
  status          String    // "SUCCESS" | "FAILED"
  message         String?
  recordsCount    Int       @default(0)
  marketTimestamp DateTime?
  requestDurationMs Int?
  createdAt       DateTime  @default(now())
}
```

---

## Quantitative Methodology

1. **Percentage Return**:
   $$\text{Return}_{\Delta t} = \left(\frac{\text{Rate}_t - \text{Rate}_{t-\Delta t}}{\text{Rate}_{t-\Delta t}}\right) \times 100$$

2. **Daily Return Volatility ($\sigma$)**:
   $$\sigma = \sqrt{\frac{1}{N-1} \sum_{i=1}^N (r_i - \bar{r})^2}$$

3. **Trend Classification**:
   - **Rising**: $\text{SMA}_{7} > \text{SMA}_{30} \times 1.002$
   - **Falling**: $\text{SMA}_{7} < \text{SMA}_{30} \times 0.998$
   - **Stable**: $\text{Difference} \in [-0.2\%, +0.2\%]$

4. **Statistical Anomaly Detection**:
   $$Z\text{-Score} = \frac{|\text{Return}_{24\text{H}} - \mu_{\text{daily}}|}{\sigma_{\text{daily}}}$$
   Flagged as **Unusual Movement** when $Z \ge 2.0\sigma$.

---

## Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js** v18+ or v24+
- **npm** v9+
- (Optional) **PostgreSQL** database (default is local zero-config SQLite `dev.db`)

---

### 2. Environment Variables & API Key Setup

Configure your environment file in `server/.env`:

```env
# Database Connection URL
# For SQLite (default zero-config local): file:./dev.db
# For PostgreSQL: postgresql://username:password@localhost:5432/fxpulse?schema=public
DATABASE_URL="file:./dev.db"

# External Foreign Exchange Provider
FX_API_URL="https://open.er-api.com/v6"
FX_API_KEY="exr_live_HWi1vgDPuJ7HLsVSKScCcpSnaTQijoLY-sYOyTkU5iI"

# Server Port
PORT=5000
NODE_ENV=development

# Scheduled background data sync (Cron)
CRON_SCHEDULE="*/15 * * * *"
```

> **Where to paste your API Key:** Paste your key directly in `server/.env` under `FX_API_KEY`. The frontend communicates strictly with your backend proxy and **never** exposes the API key to client browsers.

---

### 3. Installation Commands

```bash
# 1. Install Backend Dependencies
cd server
npm install

# 2. Push Database Schema & Generate Prisma Client
npx prisma db push
npx prisma generate

# 3. Seed Database with Currencies & Ingest Real FX Data
node src/utils/seed.js

# 4. Install Frontend Dependencies
cd ../client
npm install
```

---

### 4. Running Locally

Open two terminal windows:

#### Terminal 1: Backend Server
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

#### Terminal 2: Frontend Web App
```bash
cd client
npm run dev
# Web application available at http://localhost:5173
```

---

## Testing and Verifying Real Market Data

### 1. Test Server Health & Active Provider
```bash
curl http://localhost:5000/api/status
```
**Expected response:**
```json
{
  "success": true,
  "status": "HEALTHY",
  "provider": { "name": "ExchangeRate-API", "hasKey": true },
  "stats": { "totalRateObservations": 2797, "activeAlerts": 2 }
}
```

### 2. Test Spot Exchange Rate API
```bash
curl http://localhost:5000/api/rates/latest?base=USD
```

### 3. Test Quantitative Analytics Engine
```bash
curl http://localhost:5000/api/analytics/USD/INR
```

### 4. Test Algorithmic Market Intelligence Summary
```bash
curl http://localhost:5000/api/intelligence?base=USD
```

---

## Known Limitations of External FX Providers

1. **Daily Reference Frequency**: Reference rates published by institutions such as the European Central Bank (ECB) update once daily around 16:00 CET on working business days.
2. **Weekend Interbank Illiquidity**: Spot FX interbank trading pauses between Friday 21:00 UTC and Sunday 21:00 UTC; rates over weekends reflect Friday market closing levels.
3. **Attribution Transparency**: FXPulse displays the official source timestamp (`Last market data: 14:30 UTC`) alongside the local ingestion time to guarantee complete transparency.
