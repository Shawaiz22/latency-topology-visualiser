'use client';
import { useMemo } from 'react';
import { ExchangeServer } from '@/data/exchanges';
import Marker from './marker';
import { Connections } from './connections';
import CloudRegions from './cloud-regions';
import LatencyHeatmap from './latency-heatmap';

type ServerMarkersProps = {
  servers: ExchangeServer[];
  selectedId: string | null;
  onSelectServer: (id: string | null) => void;
  showConnections?: boolean;
  showRegions?: boolean;
  showHeatmap?: boolean;
};

export default function ServerMarkers({ 
  servers, 
  selectedId, 
  onSelectServer,
  showConnections = true,
  showRegions = false,
  showHeatmap = false,
}: ServerMarkersProps) {
  const handleMarkerClick = (serverId: string) => {
    onSelectServer(selectedId === serverId ? null : serverId);
  };

  const selectedServer = servers.find(s => s.id === selectedId);
  
  // Filter servers to only include those with valid coordinates
  const validServers = useMemo(() => 
    servers.filter((server: ExchangeServer) => 
      typeof server.lat === 'number' && 
      typeof server.lon === 'number' &&
      !isNaN(server.lat) && 
      !isNaN(server.lon)
    ),
    [servers]
  );

  return (
    <>
      {showConnections && selectedServer && (
        <Connections 
          servers={validServers}
          selectedId={selectedId}
        />
      )}
      {showRegions && <CloudRegions visible={showRegions} />}
      {showHeatmap && <LatencyHeatmap servers={validServers} visible={showHeatmap} />}
      {validServers.map((server) => {
        const isSelected = selectedId === server.id;
        return (
          <Marker
            key={server.id}
            server={{
              ...server,
              status: server.status || 'online',
              currentLatency: server.currentLatency || 0
            }}
            selected={isSelected}
            onClick={() => handleMarkerClick(server.id)}
          />
        );
      })}
    </>
  );
}
