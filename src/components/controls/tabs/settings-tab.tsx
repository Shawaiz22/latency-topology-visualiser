import ThemeToggle from '@/components/theme-toggle';
import React from 'react';

interface SettingsTabContentProps {
  showConnections: boolean;
  onToggleConnections: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  showRegions: boolean;
  onToggleRegions: () => void;
}

export function SettingsTabContent({
  showConnections,
  onToggleConnections,
  showHeatmap,
  onToggleHeatmap,
  showRegions,
  onToggleRegions,
}: SettingsTabContentProps) {
  const settings = [
    {
      id: 'connections',
      label: 'Show Connections',
      description: 'Display latency connections between servers',
      checked: showConnections,
      onChange: onToggleConnections,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'heatmap',
      label: 'Heatmap',
      description: 'Show latency heatmap overlay',
      checked: showHeatmap,
      onChange: onToggleHeatmap,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    }
  ];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-4">Display</h3>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-start">
                <div className="flex items-center h-5">
                  <div className="relative">
                    <input
                      id={setting.id}
                      name={setting.id}
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-400"
                      checked={setting.checked}
                      onChange={setting.onChange}
                    />
                  </div>
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={setting.id} className="font-medium text-gray-300 flex items-center">
                    <span className="mr-2 text-blue-400">
                      {setting.icon}
                    </span>
                    {setting.label}
                  </label>
                  <p className="text-gray-400">{setting.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-300">Dark Mode</div>
              <p className="text-xs text-gray-400">Switch between light and dark theme</p>
            </div>
            <div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-2">About</h3>
          <p className="text-xs text-gray-400 mb-4">Latency Topology Visualizer v1.0.0</p>
          <p className="text-xs text-gray-500">A 3D visualization tool for monitoring exchange server latencies.</p>
        </div>
      </div>
    </>
  );
}
