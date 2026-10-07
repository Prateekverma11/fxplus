import prisma from './prisma.js';
import fxService from '../services/fxService.js';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
];

async function main() {
  console.log('--- Starting FXPulse Database Seed ---');

  // 1. Seed Currencies
  console.log('[1/4] Seeding Currencies...');
  for (const curr of CURRENCIES) {
    await prisma.currency.upsert({
      where: { code: curr.code },
      update: { name: curr.name, symbol: curr.symbol },
      create: curr
    });
  }
  console.log(`Seeded ${CURRENCIES.length} currencies.`);

  // 2. Seed Default User
  console.log('[2/4] Seeding Default User...');
  await prisma.user.upsert({
    where: { email: 'trader@fxpulse.io' },
    update: {},
    create: {
      email: 'trader@fxpulse.io',
      name: 'Quantitative FX Analyst',
      role: 'admin'
    }
  });

  // 3. Fetch and Seed Real Historical Data
  console.log('[3/4] Ingesting real historical rates from live FX provider (120 days)...');
  try {
    const historicalResult = await fxService.seedHistoricalRates(120);
    console.log(`Ingested ${historicalResult.totalHistorical} historical data points.`);
  } catch (err) {
    console.warn('Historical fetch notice:', err.message);
  }

  // 4. Ingest Latest Live Snapshot
  console.log('[4/4] Ingesting latest live rates snapshot from FX API...');
  try {
    const latestResult = await fxService.syncRatesToDatabase(['USD', 'EUR', 'GBP']);
    console.log(`Ingested ${latestResult.recordsCount} live rate records from ${latestResult.provider}.`);
  } catch (err) {
    console.warn('Live fetch notice:', err.message);
  }

  // 5. Sample alerts
  const sampleAlerts = [
    {
      userId: 'user_default',
      baseCurrency: 'USD',
      quoteCurrency: 'INR',
      condition: 'ABOVE',
      threshold: 92.0,
      notes: 'Alert when USD/INR breaks upper resistance',
      active: true
    },
    {
      userId: 'user_default',
      baseCurrency: 'EUR',
      quoteCurrency: 'INR',
      condition: 'PCT_CHANGE_GT',
      threshold: 1.5,
      notes: 'Alert when EUR/INR 24h change exceeds 1.5%',
      active: true
    },
    {
      userId: 'user_default',
      baseCurrency: 'GBP',
      quoteCurrency: 'INR',
      condition: 'BELOW',
      threshold: 110.0,
      notes: 'Support level floor trigger',
      active: false,
      triggeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const a of sampleAlerts) {
    const exists = await prisma.alert.findFirst({
      where: {
        baseCurrency: a.baseCurrency,
        quoteCurrency: a.quoteCurrency,
        condition: a.condition
      }
    });
    if (!exists) {
      await prisma.alert.create({ data: a });
    }
  }

  console.log('--- FXPulse Database Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
