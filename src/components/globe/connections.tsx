'use client';
import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { ExchangeServer, CLOUD_REGIONS } from '@/data/exchanges';
import { latLonToVector3 } from '@/lib/geo';

type ConnectionTarget = ExchangeServer | { id: string; lat: number; lon: number };

type ConnectionProps = {
  from: ConnectionTarget;
  to: ConnectionTarget;
  latency: number;
  highlighted?: boolean;
  priority?: 'high' | 'medium' | 'low';
  isRegionConnection?: boolean;
};

function getLatencyColor(latency: number, highlighted: boolean = false): string {
  if (highlighted) {
    if (latency < 50) return '#10b981'; // green-500 (brighter when selected)
    if (latency < 100) return '#f59e0b'; // amber-500 (brighter when selected)
    return '#ef4444'; // red-500 (brighter when selected)
  }
  
  // More subtle colors for non-highlighted connections
  if (latency < 50) return 'rgba(16, 185, 129, 0.6)'; // green-500/60
  if (latency < 100) return 'rgba(245, 158, 11, 0.6)'; // amber-500/60
  return 'rgba(239, 68, 68, 0.6)'; // red-500/60
}

export default function Connection({ 
  from, 
  to, 
  latency, 
  highlighted = false, 
  priority = 'medium', 
  isRegionConnection = false 
}: ConnectionProps) {
  const points = useMemo(() => {
    const start = latLonToVector3(from.lat, from.lon).multiplyScalar(1.01);
    const end = latLonToVector3(to.lat, to.lon).multiplyScalar(1.01);
    
    // For region connections, create a more pronounced arc
    if (isRegionConnection) {
      const mid = start.clone().lerp(end, 0.5);
      const normal = mid.clone().normalize();
      // Higher arc for region connections to make them stand out
      mid.add(normal.multiplyScalar(0.5));
      return [start, mid, end];
    }
    
    // For server-to-server connections, use a subtle arc
    const mid = start.clone().lerp(end, 0.5);
    const normal = mid.clone().normalize();
    mid.add(normal.multiplyScalar(0.2));
    
    return [start, mid, end];
  }, [from, to, isRegionConnection]);

  const color = isRegionConnection 
    ? highlighted ? '#7c3aed' : 'rgba(124, 58, 237, 0.6)' // Purple for region connections
    : getLatencyColor(latency, highlighted);
    
  // Adjust animation and appearance based on priority and highlight state
  const dashSize = isRegionConnection 
    ? highlighted ? 0.2 : 0.15 // Bigger dashes for region connections
    : highlighted ? 0.15 : priority === 'high' ? 0.12 : 0.1;
    
  const dashGap = isRegionConnection 
    ? 0.05 // Slightly bigger gap for region connections
    : highlighted ? 0.03 : priority === 'high' ? 0.04 : 0.05;
    
  const speed = isRegionConnection 
    ? 1.0 // Faster animation for region connections
    : highlighted ? 0.8 : priority === 'high' ? 0.7 : 0.5;
    
  const lineWidth = isRegionConnection 
    ? highlighted ? 2.5 : 2.0 // Thicker lines for region connections
    : highlighted ? 2 : priority === 'high' ? 1.5 : 1;
    
  const opacity = isRegionConnection 
    ? highlighted ? 1.0 : 0.8 // More opaque for region connections
    : highlighted ? 0.9 : priority === 'high' ? 0.7 : 0.5;
  
  return (
    <>
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        dashed
        dashSize={dashSize}
        dashScale={dashSize + dashGap}
        dashOffset={-performance.now() * 0.001 * speed}
        transparent
        opacity={opacity}
        renderOrder={highlighted ? 1 : 0}
        depthTest={!highlighted}
      />
      {highlighted && (
        <Line
          points={points}
          color={color}
          lineWidth={lineWidth * 3}
          transparent
          opacity={0.2}
          renderOrder={0}
        />
      )}
    </>
  );
}

type ConnectionsProps = {
  servers: ExchangeServer[];
  selectedId?: string | null;
};

export function Connections({ servers, selectedId }: ConnectionsProps) {
  // Get all cloud regions
  const cloudRegions = useMemo(() => {
    return servers.flatMap(server => 
      (server.regionConnections || []).map(conn => ({
        ...CLOUD_REGIONS.find(r => r.id === conn.regionId)!,
        connectionLatency: conn.latency,
        connectionLastUpdated: conn.lastUpdated
      }))
    ).filter((region, index, self) => 
      index === self.findIndex(r => r.id === region.id)
    );
  }, [servers]);

  // Filter and process connections
  const { connections, highlightedConnections } = useMemo(() => {
    const result = {
      connections: [] as { 
        from: ConnectionTarget; 
        to: ConnectionTarget; 
        latency: number;
        isRegionConnection: boolean;
      }[],
      highlightedConnections: new Set<string>(),
      regionConnections: new Set<string>()
    };
    const added = new Set<string>();
    
    // First pass: collect all server-to-server connections
    servers.forEach((server) => {
      server.connections?.forEach((conn) => {
        const target = servers.find((s) => s.id === conn.targetId);
        if (target) {
          // Create a unique key for the connection to avoid duplicates
          const key = [server.id, target.id].sort().join('_');
          if (!added.has(key)) {
            added.add(key);
            const connection = {
              from: server,
              to: target,
              latency: conn.latency,
              isRegionConnection: false
            };
            result.connections.push(connection);
            
            // If this connection is related to the selected server, mark it as highlighted
            if (selectedId && (server.id === selectedId || target.id === selectedId)) {
              result.highlightedConnections.add(key);
            }
          }
        }
      });

      // Add server-to-region connections
      (server.regionConnections || []).forEach(regionConn => {
        const region = cloudRegions.find(r => r.id === regionConn.regionId);
        if (region) {
          const key = `${server.id}_${region.id}`;
          const connection = {
            from: server,
            to: region,
            latency: regionConn.latency,
            isRegionConnection: true
          };
          result.connections.push(connection);
          
          // If this server is selected, highlight its region connection
          if (selectedId && server.id === selectedId) {
            result.highlightedConnections.add(key);
            result.regionConnections.add(region.id);
          }
        }
      });
    });
    
    return result;
  }, [servers, selectedId, cloudRegions]);
  
  // Group connections by latency and type (region vs server)
  const { lowLatency, mediumLatency, highLatency, regionConnections } = useMemo(() => {
    const result = {
      lowLatency: [] as typeof connections,
      mediumLatency: [] as typeof connections,
      highLatency: [] as typeof connections,
      regionConnections: [] as typeof connections
    };
    
    connections.forEach(conn => {
      if (conn.isRegionConnection) {
        result.regionConnections.push(conn);
      } else if (conn.latency < 50) {
        result.lowLatency.push(conn);
      } else if (conn.latency < 100) {
        result.mediumLatency.push(conn);
      } else {
        result.highLatency.push(conn);
      }
    });
    
    return result;
  }, [connections]);

  // Render connections in batches by type and latency for better performance
  return (
    <>
      {/* Region connections - rendered on top with a distinct style */}
      {regionConnections.map((conn, idx) => {
        const key = `region-${conn.from.id}-${conn.to.id}-${idx}`;
        const isHighlighted = highlightedConnections.has(`${conn.from.id}_${conn.to.id}`);
        return (
          <Connection
            key={key}
            from={conn.from}
            to={conn.to}
            latency={conn.latency}
            highlighted={isHighlighted}
            priority="high"
            isRegionConnection
          />
        );
      })}
      
      {/* Server-to-server connections */}
      {lowLatency.map((conn, idx) => (
        <Connection
          key={`low-${conn.from.id}-${conn.to.id}-${idx}`}
          from={conn.from}
          to={conn.to}
          latency={conn.latency}
          highlighted={highlightedConnections.has([conn.from.id, conn.to.id].sort().join('_'))}
          priority="high"
        />
      ))}
      
      {mediumLatency.map((conn, idx) => (
        <Connection
          key={`med-${conn.from.id}-${conn.to.id}-${idx}`}
          from={conn.from}
          to={conn.to}
          latency={conn.latency}
          highlighted={highlightedConnections.has([conn.from.id, conn.to.id].sort().join('_'))}
          priority="medium"
        />
      ))}
      
      {highLatency.map((conn, idx) => (
        <Connection
          key={`high-${conn.from.id}-${conn.to.id}-${idx}`}
          from={conn.from}
          to={conn.to}
          latency={conn.latency}
          highlighted={highlightedConnections.has([conn.from.id, conn.to.id].sort().join('_'))}
          priority="low"
        />
      ))}
    </>
  );
}
