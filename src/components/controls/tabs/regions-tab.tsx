import React from 'react';
import { CLOUD_REGIONS, CloudRegion } from '@/data/exchanges';

interface RegionsTabContentProps {
    showRegions: boolean;
    onToggleRegions: () => void;
}

// Extend CloudRegion with additional properties needed for UI
type UIRegion = CloudRegion & {
    continent: string;
    country: string;
};

export function RegionsTabContent({ showRegions, onToggleRegions }: RegionsTabContentProps) {
    // Convert CLOUD_REGIONS to include required UI properties
    const uiRegions = CLOUD_REGIONS.map(region => ({
        ...region,
        // Extract continent from region name (first part before first dash)
        continent: region.id.split('-')[0].toUpperCase(),
        // Extract country from region name (last part after last dash)
        country: region.id.split('-').pop()?.toUpperCase() || 'N/A'
    }));

    // Group regions by continent
    const regionsByContinent = uiRegions.reduce((acc, region) => {
        if (!acc[region.continent]) {
            acc[region.continent] = [];
        }
        acc[region.continent].push(region);
        return acc;
    }, {} as Record<string, UIRegion[]>);

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-300">Cloud Regions</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={showRegions}
                            onChange={onToggleRegions}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-sm font-medium text-gray-300">
                            {showRegions ? 'Show' : 'Hide'}
                        </span>
                    </label>
                </div>

                <div className="space-y-4">
                    {Object.entries(regionsByContinent).map(([continent, regions]) => (
                        <div key={continent} className="border border-gray-700/50 rounded-lg overflow-hidden">
                            <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700/50">
                                <h4 className="text-sm font-medium text-gray-200">{continent}</h4>
                            </div>
                            <div className="divide-y divide-gray-700/30">
                                {regions.map((region: CloudRegion) => (
                                    <div key={region.id} className="px-4 py-2 text-sm text-gray-300">
                                        <div className="flex justify-between items-center">
                                            <span>{region.name}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs px-2 py-0.5 bg-gray-700/50 rounded">
                                                    {region.id.split('-').pop()?.toUpperCase() || 'N/A'}
                                                </span>
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
