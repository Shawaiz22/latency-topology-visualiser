'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExchangeServer } from '@/data/exchanges';

interface LatencyTrendChartProps {
  server: ExchangeServer;
  timeRange?: '1h' | '6h' | '24h' | '7d';
  height?: number;
  onTimeRangeChange?: (range: '1h' | '6h' | '24h' | '7d') => void;
}

const formatXAxis = (tick: string) => {
  const date = new Date(tick);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function LatencyTrendChart({ 
  server, 
  timeRange = '6h', 
  height = 200,
  onTimeRangeChange
}: LatencyTrendChartProps) {
  const chartData = useMemo(() => {
    if (!server.historicalLatency) return [];
    
    // Filter data based on selected time range
    const now = Date.now();
    let cutoffTime = now;
    
    switch (timeRange) {
      case '1h':
        cutoffTime = now - 60 * 60 * 1000;
        break;
      case '6h':
        cutoffTime = now - 6 * 60 * 60 * 1000;
        break;
      case '24h':
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return server.historicalLatency
      .filter(entry => new Date(entry.timestamp) >= new Date(cutoffTime))
      .map(entry => ({
        ...entry,
        // Format for better display in tooltip
        time: new Date(entry.timestamp).toLocaleTimeString(),
        date: new Date(entry.timestamp).toLocaleDateString(),
      }));
  }, [server.historicalLatency, timeRange]);

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">No historical data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="text-sm font-medium text-gray-300">Latency Trend</h3>
        <div className="flex space-x-1">
          {['1h', '6h', '24h', '7d'].map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange?.(range as '1h' | '6h' | '24h' | '7d')}
              className={`text-xs px-2 py-1 rounded ${
                timeRange === range
                  ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              tick={{ fill: '#A0AEC0', fontSize: 12 }}
              tickMargin={8}
              axisLine={{ stroke: '#4A5568' }}
              tickLine={{ stroke: '#4A5568' }}
            />
            <YAxis
              domain={[0, 'dataMax + 20']}
              tick={{ fill: '#A0AEC0', fontSize: 12 }}
              tickMargin={8}
              width={40}
              axisLine={{ stroke: '#4A5568' }}
              tickLine={{ stroke: '#4A5568' }}
              tickFormatter={(value) => `${value}ms`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-800 p-3 border border-gray-700 rounded shadow-lg">
                      <p className="text-sm text-gray-300">{data.date}</p>
                      <p className="text-sm text-gray-300">{data.time}</p>
                      <p className="text-sm mt-1">
                        <span className="text-gray-400">Latency: </span>
                        <span className="font-medium" style={{ color: getStatusColor(data.status) }}>
                          {data.latency}ms
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-400">Status: </span>
                        <span className="font-medium" style={{ color: getStatusColor(data.status) }}>
                          {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#4299E1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#3182CE', strokeWidth: 2, fill: '#4299E1' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'online':
      return '#48BB78'; // green-500
    case 'degraded':
      return '#ECC94B'; // yellow-500
    case 'offline':
      return '#F56565'; // red-500
    default:
      return '#A0AEC0'; // gray-400
  }
}
