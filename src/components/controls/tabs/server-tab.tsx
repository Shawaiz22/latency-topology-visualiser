import React, { useMemo, useState } from 'react';
import LatencyTrendChart from '@/components/charts/latency-trend-chart';

import { ExchangeServer } from '@/data/exchanges';
import { getLatencyColor } from '../utils';

interface ServerTabContentProps {
    servers: ExchangeServer[];
    filteredServers: ExchangeServer[];
    selectedServerId: string | null;
    onSelectServer: (id: string | null) => void;
    filters: {
        providers: string[];
        status: string[];
        latencyRange: [number, number];
    };
    onProviderToggle: (provider: string) => void;
    onStatusToggle: (status: string) => void;
    onLatencyChange: (min: number, max: number) => void;
}

export function ServerTabContent({
    servers,
    filteredServers,
    selectedServerId,
    onSelectServer,
    filters,
    onProviderToggle,
    onStatusToggle,
    onLatencyChange,
}: ServerTabContentProps) {

    const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('6h');

    // Handle time range change for the latency chart
    const handleTimeRangeChange = (range: '1h' | '6h' | '24h' | '7d') => {
        setTimeRange(range);
    };

    const allProviderCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        servers.forEach(server => {
            counts[server.provider] = (counts[server.provider] || 0) + 1;
        });
        return counts;
    }, [servers]);

    const allProviders = Object.keys(allProviderCounts);

    const selectedServer = useMemo(() => {
        return servers.find(server => server.id === selectedServerId);
    }, [servers, selectedServerId]);

    return (
        <div className="space-y-4">

            {/* Filters */}
            <div className="space-y-4 pt-4 border-t border-gray-700/50">
                <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Cloud Providers</h3>
                    <div className="space-y-1">
                        {allProviders.map((provider) => {
                            const isChecked = filters.providers.includes(provider);
                            return (
                                <label key={provider} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => onProviderToggle(provider)}
                                            className="rounded border-gray-600 text-blue-500 focus:ring-blue-400"
                                        />
                                        <span className="ml-2 text-gray-300">{provider}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{allProviderCounts[provider] || 0}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Status</h3>
                    <div className="space-y-1">
                        {['online', 'degraded', 'offline'].map((status) => (
                            <label key={status} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={filters.status.includes(status)}
                                        onChange={() => onStatusToggle(status)}
                                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-400"
                                    />
                                    <span className="ml-2 text-gray-300 capitalize">{status}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">
                        Latency: {filters.latencyRange[0]}ms - {filters.latencyRange[1]}ms
                    </h3>
                    <div className="px-2">
                        <input
                            type="range"
                            min="0"
                            max="500"
                            step="10"
                            value={filters.latencyRange[1]}
                            onChange={(e) => onLatencyChange(0, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0ms</span>
                            <span>500ms</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-xs text-gray-400 mb-2">
                Showing {filteredServers.length} of {servers.length} servers
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {filteredServers.map((server) => (
                    <div
                        key={server.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedServerId === server.id
                            ? 'bg-blue-900/50 border border-blue-600/50'
                            : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent hover:border-gray-600/50'
                            }`}
                        onClick={() => onSelectServer(server.id === selectedServerId ? null : server.id)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-medium text-white">{server.name}</div>
                                <div className="text-xs text-gray-400">{server.provider} • {server.region}</div>
                            </div>
                            <div className="text-xs font-mono" style={{ color: getLatencyColor(server.currentLatency || 0) }}>
                                {server.lastPing || 0}ms
                            </div>
                        </div>
                        <div className="mt-2 flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${server.status === 'online' ? 'bg-green-500' :
                                server.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                            <span className="text-xs text-gray-400 capitalize">{server.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            {selectedServer && (
                <div className="mt-4 h-40">
                    <LatencyTrendChart
                        server={selectedServer}
                        timeRange={timeRange}
                        onTimeRangeChange={handleTimeRangeChange}
                    />
                </div>
            )}

        </div>
    );
}
