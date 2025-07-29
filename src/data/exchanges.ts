export interface ExchangeServer {
  id: string;
  name: string;
  code: string;
  lat: number;
  lon: number;
  provider: 'AWS' | 'GCP' | 'Azure';
  region: string;
  lastPing?: number; // ms
  status: 'online' | 'degraded' | 'offline';
  currentLatency?: number; // Current latency in ms
  connections?: {
    targetId: string;
    latency: number;
    lastUpdated: string;
  }[];
  historicalLatency?: Array<{
    timestamp: string;
    latency: number;
    status: 'online' | 'degraded' | 'offline';
  }>;
}

export interface CloudRegion {
  id: string;
  name: string;
  provider: 'AWS' | 'GCP' | 'Azure';
  lat: number;
  lon: number;
  servers: number;
  boundaries: { lat: number; lon: number }[];
}

// Helper function to generate sample historical latency data
function generateHistoricalData(
  baseLatency: number,
  maxLatency: number,
  variance: number,
  points: number
) {
  const now = Date.now();
  const data = [];
  
  for (let i = points - 1; i >= 0; i--) {
    const timeOffset = i * 15 * 60 * 1000; // 15-minute intervals
    const timestamp = new Date(now - timeOffset).toISOString();
    
    // Add some random variation to the latency
    const variation = (Math.random() - 0.5) * variance;
    let latency = baseLatency + variation;
    
    // Ensure latency is within bounds
    latency = Math.max(1, Math.min(maxLatency, latency));
    
    // Randomly set status (mostly online, sometimes degraded, rarely offline)
    const statusRand = Math.random();
    let status: 'online' | 'degraded' | 'offline' = 'online';
    if (statusRand > 0.95) {
      status = 'offline';
      latency = maxLatency * 1.5; // Simulate timeout
    } else if (statusRand > 0.85) {
      status = 'degraded';
      latency = latency * 1.5; // Simulate high latency
    }
    
    data.push({
      timestamp,
      latency: Math.round(latency * 10) / 10, // Round to 1 decimal
      status
    });
  }
  
  return data;
}

// Helper function to generate connections between nodes
function generateConnections(sourceId: string, possibleTargets: string[], minLatency: number, maxLatency: number) {
  const numConnections = Math.floor(Math.random() * 4) + 1; // 1-4 connections
  const shuffled = [...possibleTargets].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numConnections);
  
  return selected.map(targetId => ({
    targetId,
    latency: Math.floor(Math.random() * (maxLatency - minLatency + 1)) + minLatency,
    lastUpdated: new Date().toISOString()
  }));
}

// Generate 30 exchange servers
export const EXCHANGE_SERVERS: ExchangeServer[] = [
  // Asia-Pacific
  {
    id: 'binance-sg',
    name: 'Binance',
    code: 'BINANCE',
    lat: 1.3521,
    lon: 103.8198,
    provider: 'AWS',
    region: 'ap-southeast-1',
    status: 'online',
    lastPing: 28,
    connections: [
      { targetId: 'deribit-nl', latency: 45, lastUpdated: new Date().toISOString() },
      { targetId: 'okx-de', latency: 38, lastUpdated: new Date().toISOString() },
      { targetId: 'bybit-sg', latency: 12, lastUpdated: new Date().toISOString() },
      { targetId: 'kraken-jp', latency: 52, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(28, 40, 15, 100),
  },
  {
    id: 'bybit-sg',
    name: 'Bybit',
    code: 'BYBIT',
    lat: 1.2905,
    lon: 103.8520,
    provider: 'GCP',
    region: 'asia-southeast1',
    status: 'online',
    lastPing: 25,
    connections: [
      { targetId: 'binance-sg', latency: 12, lastUpdated: new Date().toISOString() },
      { targetId: 'ftx-hk', latency: 35, lastUpdated: new Date().toISOString() },
      { targetId: 'kucoin-sg', latency: 18, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(25, 35, 10, 100),
  },
  {
    id: 'kucoin-sg',
    name: 'KuCoin',
    code: 'KUCOIN',
    lat: 1.3000,
    lon: 103.8550,
    provider: 'Azure',
    region: 'southeastasia',
    status: 'online',
    lastPing: 30,
    connections: [
      { targetId: 'bybit-sg', latency: 18, lastUpdated: new Date().toISOString() },
      { targetId: 'huobi-sg', latency: 22, lastUpdated: new Date().toISOString() },
      { targetId: 'okx-hk', latency: 28, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(30, 45, 12, 100),
  },
  {
    id: 'huobi-sg',
    name: 'Huobi',
    code: 'HUOBI',
    lat: 1.2800,
    lon: 103.8500,
    provider: 'AWS',
    region: 'ap-southeast-1',
    status: 'online',
    lastPing: 32,
    connections: [
      { targetId: 'kucoin-sg', latency: 22, lastUpdated: new Date().toISOString() },
      { targetId: 'binance-sg', latency: 15, lastUpdated: new Date().toISOString() },
      { targetId: 'bitfinex-hk', latency: 40, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(32, 50, 15, 100),
  },
  {
    id: 'okx-hk',
    name: 'OKX Hong Kong',
    code: 'OKX-HK',
    lat: 22.3193,
    lon: 114.1694,
    provider: 'GCP',
    region: 'asia-east2',
    status: 'online',
    lastPing: 35,
    connections: [
      { targetId: 'kucoin-sg', latency: 28, lastUpdated: new Date().toISOString() },
      { targetId: 'binance-sg', latency: 30, lastUpdated: new Date().toISOString() },
      { targetId: 'ftx-hk', latency: 12, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(35, 50, 18, 100),
  },
  {
    id: 'ftx-hk',
    name: 'FTX Hong Kong',
    code: 'FTX-HK',
    lat: 22.3000,
    lon: 114.1700,
    provider: 'AWS',
    region: 'ap-east-1',
    status: 'degraded',
    lastPing: 42,
    connections: [
      { targetId: 'okx-hk', latency: 12, lastUpdated: new Date().toISOString() },
      { targetId: 'bybit-sg', latency: 35, lastUpdated: new Date().toISOString() },
      { targetId: 'bitmex-hk', latency: 15, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(42, 60, 20, 100),
  },
  {
    id: 'bitmex-hk',
    name: 'BitMEX Hong Kong',
    code: 'BITMEX',
    lat: 22.3100,
    lon: 114.1750,
    provider: 'Azure',
    region: 'eastasia',
    status: 'online',
    lastPing: 38,
    connections: [
      { targetId: 'ftx-hk', latency: 15, lastUpdated: new Date().toISOString() },
      { targetId: 'deribit-nl', latency: 85, lastUpdated: new Date().toISOString() },
      { targetId: 'kraken-jp', latency: 45, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(38, 55, 15, 100),
  },
  {
    id: 'bitfinex-hk',
    name: 'Bitfinex Hong Kong',
    code: 'BITFINEX',
    lat: 22.3050,
    lon: 114.1650,
    provider: 'GCP',
    region: 'asia-east2',
    status: 'online',
    lastPing: 40,
    connections: [
      { targetId: 'huobi-sg', latency: 40, lastUpdated: new Date().toISOString() },
      { targetId: 'kraken-jp', latency: 38, lastUpdated: new Date().toISOString() },
      { targetId: 'coinbase-us', latency: 120, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(40, 60, 20, 100),
  },
  {
    id: 'kraken-jp',
    name: 'Kraken Japan',
    code: 'KRAKEN-JP',
    lat: 35.6762,
    lon: 139.6503,
    provider: 'AWS',
    region: 'ap-northeast-1',
    status: 'online',
    lastPing: 45,
    connections: [
      { targetId: 'binance-sg', latency: 52, lastUpdated: new Date().toISOString() },
      { targetId: 'bitmex-hk', latency: 45, lastUpdated: new Date().toISOString() },
      { targetId: 'bitfinex-hk', latency: 38, lastUpdated: new Date().toISOString() },
      { targetId: 'coincheck-jp', latency: 15, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(45, 65, 20, 100),
  },
  {
    id: 'coincheck-jp',
    name: 'Coincheck',
    code: 'COINCHECK',
    lat: 35.6700,
    lon: 139.6600,
    provider: 'Azure',
    region: 'japaneast',
    status: 'online',
    lastPing: 48,
    connections: [
      { targetId: 'kraken-jp', latency: 15, lastUpdated: new Date().toISOString() },
      { targetId: 'binance-sg', latency: 60, lastUpdated: new Date().toISOString() },
      { targetId: 'bitflyer-jp', latency: 20, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(48, 70, 22, 100),
  },
  {
    id: 'bitflyer-jp',
    name: 'bitFlyer',
    code: 'BITFLYER',
    lat: 35.6800,
    lon: 139.6700,
    provider: 'GCP',
    region: 'asia-northeast1',
    status: 'online',
    lastPing: 50,
    connections: [
      { targetId: 'coincheck-jp', latency: 20, lastUpdated: new Date().toISOString() },
      { targetId: 'kraken-jp', latency: 25, lastUpdated: new Date().toISOString() },
      { targetId: 'gemini-us', latency: 110, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(50, 75, 25, 100),
  },
  
  // Europe
  {
    id: 'deribit-nl',
    name: 'Deribit',
    code: 'DERIBIT',
    lat: 52.3676,
    lon: 4.9041,
    provider: 'GCP',
    region: 'europe-west4',
    status: 'online',
    lastPing: 32,
    connections: [
      { targetId: 'binance-sg', latency: 45, lastUpdated: new Date().toISOString() },
      { targetId: 'okx-de', latency: 22, lastUpdated: new Date().toISOString() },
      { targetId: 'bitmex-hk', latency: 85, lastUpdated: new Date().toISOString() },
      { targetId: 'kraken-de', latency: 18, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(32, 45, 20, 100),
  },
  {
    id: 'okx-de',
    name: 'OKX Germany',
    code: 'OKX-DE',
    lat: 50.1109,
    lon: 8.6821,
    provider: 'Azure',
    region: 'germanywestcentral',
    status: 'online',
    lastPing: 35,
    connections: [
      { targetId: 'binance-sg', latency: 38, lastUpdated: new Date().toISOString() },
      { targetId: 'deribit-nl', latency: 22, lastUpdated: new Date().toISOString() },
      { targetId: 'kraken-de', latency: 25, lastUpdated: new Date().toISOString() },
      { targetId: 'bitstamp-lu', latency: 30, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(35, 50, 25, 100),
  },
  {
    id: 'kraken-de',
    name: 'Kraken Germany',
    code: 'KRAKEN-DE',
    lat: 50.1200,
    lon: 8.6900,
    provider: 'AWS',
    region: 'eu-central-1',
    status: 'online',
    lastPing: 38,
    connections: [
      { targetId: 'deribit-nl', latency: 18, lastUpdated: new Date().toISOString() },
      { targetId: 'okx-de', latency: 25, lastUpdated: new Date().toISOString() },
      { targetId: 'bitstamp-lu', latency: 28, lastUpdated: new Date().toISOString() },
      { targetId: 'coinbase-uk', latency: 35, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(38, 55, 20, 100),
  },
  {
    id: 'bitstamp-lu',
    name: 'Bitstamp Luxembourg',
    code: 'BITSTAMP',
    lat: 49.6116,
    lon: 6.1319,
    provider: 'GCP',
    region: 'europe-west6',
    status: 'online',
    lastPing: 40,
    connections: [
      { targetId: 'okx-de', latency: 30, lastUpdated: new Date().toISOString() },
      { targetId: 'kraken-de', latency: 28, lastUpdated: new Date().toISOString() },
      { targetId: 'coinbase-uk', latency: 32, lastUpdated: new Date().toISOString() },
      { targetId: 'luno-uk', latency: 45, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(40, 60, 22, 100),
  },
  {
    id: 'coinbase-uk',
    name: 'Coinbase UK',
    code: 'COINBASE-UK',
    lat: 51.5074,
    lon: -0.1278,
    provider: 'AWS',
    region: 'eu-west-2',
    status: 'online',
    lastPing: 42,
    connections: [
      { targetId: 'kraken-de', latency: 35, lastUpdated: new Date().toISOString() },
      { targetId: 'bitstamp-lu', latency: 32, lastUpdated: new Date().toISOString() },
      { targetId: 'luno-uk', latency: 25, lastUpdated: new Date().toISOString() },
      { targetId: 'coinbase-us', latency: 65, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(42, 65, 25, 100),
  },
  {
    id: 'luno-uk',
    name: 'Luno',
    code: 'LUNO',
    lat: 51.5100,
    lon: -0.1300,
    provider: 'Azure',
    region: 'uksouth',
    status: 'online',
    lastPing: 45,
    connections: [
      { targetId: 'bitstamp-lu', latency: 45, lastUpdated: new Date().toISOString() },
      { targetId: 'coinbase-uk', latency: 25, lastUpdated: new Date().toISOString() },
      { targetId: 'binance-je', latency: 50, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(45, 70, 28, 100),
  },
  {
    id: 'binance-je',
    name: 'Binance Jersey',
    code: 'BINANCE-JE',
    lat: 49.1800,
    lon: -2.1100,
    provider: 'GCP',
    region: 'europe-west2',
    status: 'online',
    lastPing: 48,
    connections: [
      { targetId: 'luno-uk', latency: 50, lastUpdated: new Date().toISOString() },
      { targetId: 'coinbase-uk', latency: 40, lastUpdated: new Date().toISOString() },
      { targetId: 'binance-sg', latency: 90, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(48, 75, 30, 100),
  },
  
  // North America
  {
    id: 'coinbase-us',
    name: 'Coinbase US',
    code: 'COINBASE',
    lat: 37.7749,
    lon: -122.4194,
    provider: 'AWS',
    region: 'us-west-1',
    status: 'online',
    lastPing: 55,
    connections: [
      { targetId: 'bitfinex-hk', latency: 120, lastUpdated: new Date().toISOString() },
      { targetId: 'coinbase-uk', latency: 65, lastUpdated: new Date().toISOString() },
      { targetId: 'gemini-us', latency: 25, lastUpdated: new Date().toISOString() },
      { targetId: 'kraken-us', latency: 30, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(55, 80, 30, 100),
  },
  {
    id: 'gemini-us',
    name: 'Gemini',
    code: 'GEMINI',
    lat: 40.7128,
    lon: -74.0060,
    provider: 'GCP',
    region: 'us-east1',
    status: 'online',
    lastPing: 50,
    connections: [
      { targetId: 'coinbase-us', latency: 25, lastUpdated: new Date().toISOString() },
      { targetId: 'bitflyer-jp', latency: 110, lastUpdated: new Date().toISOString() },
      { targetId: 'kraken-us', latency: 28, lastUpdated: new Date().toISOString() },
      { targetId: 'ftx-us', latency: 35, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(50, 75, 25, 100),
  },
  {
    id: 'kraken-us',
    name: 'Kraken US',
    code: 'KRAKEN-US',
    lat: 47.6062,
    lon: -122.3321,
    provider: 'Azure',
    region: 'westus2',
    status: 'online',
    lastPing: 52,
    connections: [
      { targetId: 'coinbase-us', latency: 30, lastUpdated: new Date().toISOString() },
      { targetId: 'gemini-us', latency: 28, lastUpdated: new Date().toISOString() },
      { targetId: 'ftx-us', latency: 25, lastUpdated: new Date().toISOString() },
      { targetId: 'binance-us', latency: 45, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(52, 78, 28, 100),
  },
  {
    id: 'ftx-us',
    name: 'FTX US',
    code: 'FTX-US',
    lat: 25.7617,
    lon: -80.1918,
    provider: 'AWS',
    region: 'us-east-1',
    status: 'degraded',
    lastPing: 60,
    connections: [
      { targetId: 'gemini-us', latency: 35, lastUpdated: new Date().toISOString() },
      { targetId: 'kraken-us', latency: 25, lastUpdated: new Date().toISOString() },
      { targetId: 'binance-us', latency: 40, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(60, 90, 35, 100),
  },
  {
    id: 'binance-us',
    name: 'Binance US',
    code: 'BINANCE-US',
    lat: 37.3382,
    lon: -121.8863,
    provider: 'GCP',
    region: 'us-west2',
    status: 'online',
    lastPing: 58,
    connections: [
      { targetId: 'kraken-us', latency: 45, lastUpdated: new Date().toISOString() },
      { targetId: 'ftx-us', latency: 40, lastUpdated: new Date().toISOString() },
      { targetId: 'binance-sg', latency: 110, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(58, 85, 32, 100),
  },
  {
    id: 'bitmex-us',
    name: 'BitMEX US',
    code: 'BITMEX-US',
    lat: 40.7306,
    lon: -73.9352,
    provider: 'Azure',
    region: 'eastus',
    status: 'online',
    lastPing: 62,
    connections: [
      { targetId: 'gemini-us', latency: 30, lastUpdated: new Date().toISOString() },
      { targetId: 'coinbase-us', latency: 35, lastUpdated: new Date().toISOString() },
      { targetId: 'deribit-nl', latency: 75, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(62, 90, 35, 100),
  },
  
  // Other regions
  {
    id: 'luno-za',
    name: 'Luno South Africa',
    code: 'LUNO-ZA',
    lat: -33.9249,
    lon: 18.4241,
    provider: 'AWS',
    region: 'af-south-1',
    status: 'online',
    lastPing: 85,
    connections: [
      { targetId: 'coinbase-uk', latency: 95, lastUpdated: new Date().toISOString() },
      { targetId: 'binance-sg', latency: 120, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(85, 120, 40, 100),
  },
  {
    id: 'mercado-br',
    name: 'Mercado Bitcoin',
    code: 'MERCADO',
    lat: -23.5505,
    lon: -46.6333,
    provider: 'GCP',
    region: 'southamerica-east1',
    status: 'online',
    lastPing: 75,
    connections: [
      { targetId: 'coinbase-us', latency: 85, lastUpdated: new Date().toISOString() },
      { targetId: 'binance-sg', latency: 130, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(75, 110, 35, 100),
  },
  {
    id: 'custom-in',
    name: 'Custom Node',
    code: 'CUSTOM',
    lat: 19.0760,
    lon: 72.8777,
    provider: 'GCP',
    region: 'asia-south1',
    status: 'online',
    lastPing: 42,
    connections: [
      { targetId: 'binance-sg', latency: 65, lastUpdated: new Date().toISOString() },
      { targetId: 'huobi-sg', latency: 55, lastUpdated: new Date().toISOString() },
    ],
    historicalLatency: generateHistoricalData(42, 65, 30, 100),
  },
];

// 10 Cloud Regions
export const CLOUD_REGIONS: CloudRegion[] = [
  // AWS
  {
    id: 'aws-ap-southeast-1',
    name: 'AWS Asia Pacific (Singapore)',
    provider: 'AWS',
    lat: 1.3521,
    lon: 103.8198,
    servers: 42,
    boundaries: [
      { lat: 1.0, lon: 103.0 },
      { lat: 1.7, lon: 104.6 },
      { lat: 1.8, lon: 104.0 },
      { lat: 1.5, lon: 103.2 },
    ],
  },
  {
    id: 'aws-us-east-1',
    name: 'AWS US East (N. Virginia)',
    provider: 'AWS',
    lat: 38.1300,
    lon: -78.4500,
    servers: 85,
    boundaries: [
      { lat: 37.0, lon: -79.0 },
      { lat: 39.0, lon: -77.0 },
      { lat: 38.5, lon: -77.5 },
      { lat: 37.5, lon: -78.5 },
    ],
  },
  {
    id: 'aws-eu-west-1',
    name: 'AWS Europe (Ireland)',
    provider: 'AWS',
    lat: 53.3478,
    lon: -6.2597,
    servers: 58,
    boundaries: [
      { lat: 52.5, lon: -7.0 },
      { lat: 54.0, lon: -5.5 },
      { lat: 53.5, lon: -6.0 },
      { lat: 53.0, lon: -6.5 },
    ],
  },
  
  // GCP
  {
    id: 'gcp-asia-east1',
    name: 'GCP Asia East (Taiwan)',
    provider: 'GCP',
    lat: 25.0330,
    lon: 121.5654,
    servers: 35,
    boundaries: [
      { lat: 24.5, lon: 121.0 },
      { lat: 25.5, lon: 122.0 },
      { lat: 25.2, lon: 121.8 },
      { lat: 24.8, lon: 121.3 },
    ],
  },
  {
    id: 'gcp-us-central1',
    name: 'GCP US Central (Iowa)',
    provider: 'GCP',
    lat: 41.8780,
    lon: -93.0977,
    servers: 62,
    boundaries: [
      { lat: 41.0, lon: -94.0 },
      { lat: 42.5, lon: -92.5 },
      { lat: 42.0, lon: -93.0 },
      { lat: 41.5, lon: -93.5 },
    ],
  },
  {
    id: 'gcp-europe-west4',
    name: 'GCP Europe West (Netherlands)',
    provider: 'GCP',
    lat: 52.3676,
    lon: 4.9041,
    servers: 48,
    boundaries: [
      { lat: 52.0, lon: 4.0 },
      { lat: 52.7, lon: 5.5 },
      { lat: 52.5, lon: 5.0 },
      { lat: 52.2, lon: 4.5 },
    ],
  },
  
  // Azure
  {
    id: 'azure-eastus',
    name: 'Azure East US (Virginia)',
    provider: 'Azure',
    lat: 37.3719,
    lon: -79.8164,
    servers: 55,
    boundaries: [
      { lat: 36.5, lon: -80.5 },
      { lat: 38.0, lon: -79.0 },
      { lat: 37.5, lon: -79.5 },
      { lat: 37.0, lon: -80.0 },
    ],
  },
  {
    id: 'azure-southeastasia',
    name: 'Azure Southeast Asia (Singapore)',
    provider: 'Azure',
    lat: 1.3521,
    lon: 103.8198,
    servers: 40,
    boundaries: [
      { lat: 1.0, lon: 103.0 },
      { lat: 1.7, lon: 104.6 },
      { lat: 1.5, lon: 104.0 },
      { lat: 1.2, lon: 103.5 },
    ],
  },
  {
    id: 'azure-westeurope',
    name: 'Azure West Europe (Netherlands)',
    provider: 'Azure',
    lat: 52.3667,
    lon: 4.9000,
    servers: 50,
    boundaries: [
      { lat: 52.0, lon: 4.0 },
      { lat: 52.7, lon: 5.5 },
      { lat: 52.5, lon: 5.0 },
      { lat: 52.2, lon: 4.5 },
    ],
  },
  {
    id: 'azure-japaneast',
    name: 'Azure Japan East (Tokyo)',
    provider: 'Azure',
    lat: 35.6762,
    lon: 139.6503,
    servers: 38,
    boundaries: [
      { lat: 35.0, lon: 139.0 },
      { lat: 36.0, lon: 140.5 },
      { lat: 35.8, lon: 140.0 },
      { lat: 35.3, lon: 139.5 },
    ],
  },
];