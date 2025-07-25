// data/exchanges.ts
export interface ExchangeServer {
    name: string;
    lat: number;
    lon: number;
    provider: 'AWS' | 'GCP' | 'Azure';
  }
  
  // A handful of sample servers to start with
  export const EXCHANGE_SERVERS: ExchangeServer[] = [
    { name: 'Binance (Singapore)',    lat:  1.3521, lon: 103.8198, provider: 'AWS'   },
    { name: 'Deribit (Amsterdam)',    lat: 52.3676, lon:   4.9041, provider: 'GCP'   },
    { name: 'OKX (Frankfurt)',        lat: 50.1109, lon:   8.6821, provider: 'Azure' },
    // ↓ new Mumbai marker ↓
    { name: 'Custom Node (Mumbai)',   lat: 19.0760, lon:  72.8777, provider: 'GCP'   },
  ];
  
  