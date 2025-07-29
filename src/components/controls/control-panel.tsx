'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ExchangeServer } from '@/data/exchanges';


import { ServerTabContent } from './tabs/server-tab';
import { RegionsTabContent } from './tabs/regions-tab';
import { SettingsTabContent } from './tabs/settings-tab';
import ThemeToggle from '../theme-toggle';

type ControlPanelProps = {
  servers: ExchangeServer[];
  filteredServers: ExchangeServer[];
  selectedServerId: string | null;
  onSelectServer: (id: string | null) => void;
  onFilterChange: (filters: {
    providers: string[];
    status: string[];
    latencyRange: [number, number];
  }) => void;
  filters: {
    providers: string[];
    status: string[];
    latencyRange: [number, number];
  }
  showConnections: boolean;
  showHeatmap: boolean;
  showRegions: boolean;
  onToggleConnections: () => void;
  onToggleHeatmap: () => void;
  onToggleRegions: () => void;
};

export default function ControlPanel({
  servers,
  filteredServers,
  selectedServerId,
  onSelectServer,
  onFilterChange,
  filters,
  showConnections,
  showHeatmap,
  showRegions,
  onToggleConnections,
  onToggleHeatmap,
  onToggleRegions,
}: ControlPanelProps) {

  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'servers' | 'regions' | 'settings'>('servers');

  // Get the currently selected server
  const selectedServer = useMemo(() => {
    return servers.find(server => server.id === selectedServerId);
  }, [servers, selectedServerId]);

  const handleProviderToggle = (provider: string) => {
    let newProviders: string[];
    if (filters.providers.includes(provider)) {
      // If the provider is currently selected, remove it
      newProviders = filters.providers.filter(p => p !== provider);
    } else {
      // If the provider is not selected, add it to the selection
      newProviders = [...filters.providers, provider];
    }

    const newFilters = { ...filters, providers: newProviders };
    onFilterChange(newFilters);
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];

    const newFilters = { ...filters, status: newStatus };
    onFilterChange(newFilters);
  };

  const handleLatencyChange = (min: number, max: number) => {
    const newFilters = {
      ...filters,
      latencyRange: [min, max] as [number, number]
    };
    onFilterChange(newFilters);
  };

  const handleExport = useCallback((format: 'json' | 'csv') => {
    // Use dynamic import to avoid SSR issues with html2canvas
    import('@/lib/export-utils').then(({ exportData }) => {
      exportData(servers, format, selectedServer?.id || null);
    });
    setIsExportOpen(false);
  }, [servers, selectedServer]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='fixed top-4 right-4 flex justify-between items-start gap-3'>
      <div className='mt-1'>
        <ThemeToggle />
      </div>
      <div className={`w-80 ${isOpen ? 'h-[calc(100vh-32px)]' : 'h-12'} flex flex-col bg-gray-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 ease-in-out z-50`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-700/50 h-12">

          <h2 className="text-lg font-medium text-gray-100 whitespace-nowrap">Control Panel</h2>
          <div className="flex items-center space-x-2">
            {isOpen && (
              <div className="relative">
                <button
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="p-1.5 rounded-md bg-gray-700/80 text-gray-200 hover:bg-gray-600/90 transition-all duration-200 flex items-center justify-center"
                  aria-label="Export data"
                  title="Export data"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>

                {isExportOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl py-1 z-50 border border-gray-700/50">
                    <div className="px-1 py-1">
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/50 rounded-md transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export as JSON
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/50 rounded-md transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export as CSV
                      </button>
                      <div className="border-t border-gray-700/50 my-1"></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-1.5 rounded-md transition-all duration-200 flex items-center justify-center ${isOpen
                ? 'bg-blue-600/90 hover:bg-blue-700 text-white'
                : 'bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 hover:text-white'
                }`}
              aria-label={isOpen ? 'Close panel' : 'Open panel'}
              title={isOpen ? 'Collapse panel' : 'Expand panel'}
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={`overflow-y-auto transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 h-[calc(100%-3rem)]' : 'opacity-0 h-0 overflow-hidden'}`}>
          {isOpen && (
            <>
              {/* Tabs */}
              <div className="flex px-4 pt-3 border-b border-gray-700/50 bg-gray-900/50">
                <button
                  className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${activeTab === 'servers'
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                    }`}
                  onClick={() => setActiveTab('servers')}
                >
                  <span className="relative z-10">Servers</span>
                  {activeTab === 'servers' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-full"></span>
                  )}
                </button>
                <button
                  className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${activeTab === 'regions'
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                    }`}
                  onClick={() => setActiveTab('regions')}
                >
                  <span className="relative z-10">Regions</span>
                  {activeTab === 'regions' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-full"></span>
                  )}
                </button>
                <button
                  className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${activeTab === 'settings'
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                    }`}
                  onClick={() => setActiveTab('settings')}
                >
                  <span className="relative z-10">Settings</span>
                  {activeTab === 'settings' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {activeTab === 'servers' && (
                  <ServerTabContent
                    servers={servers}
                    filteredServers={filteredServers}
                    selectedServerId={selectedServerId}
                    onSelectServer={onSelectServer}
                    filters={filters}
                    onProviderToggle={handleProviderToggle}
                    onStatusToggle={handleStatusToggle}
                    onLatencyChange={handleLatencyChange}
                  />
                )}

                {activeTab === 'regions' && (
                  <RegionsTabContent
                    showRegions={showRegions}
                    onToggleRegions={onToggleRegions}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsTabContent
                    showConnections={showConnections}
                    onToggleConnections={onToggleConnections}
                    showHeatmap={showHeatmap}
                    onToggleHeatmap={onToggleHeatmap}
                    showRegions={showRegions}
                    onToggleRegions={onToggleRegions}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
