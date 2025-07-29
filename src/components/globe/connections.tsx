'use client';
import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { ExchangeServer } from '@/data/exchanges';
import { latLonToVector3 } from '@/lib/geo';

type ConnectionProps = {
  from: ExchangeServer;
  to: ExchangeServer;
  latency: number;
  highlighted?: boolean;
  priority?: 'high' | 'medium' | 'low';
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
  priority = 'medium' 
}: ConnectionProps) {
  const points = useMemo(() => {
    const start = latLonToVector3(from.lat, from.lon).multiplyScalar(1.01);
    const end = latLonToVector3(to.lat, to.lon).multiplyScalar(1.01);
    
    // Create a slight arc for better visibility
    const mid = start.clone().lerp(end, 0.5);
    const normal = mid.clone().normalize();
    mid.add(normal.multiplyScalar(0.2));
    
    return [start, mid, end];
  }, [from, to]);

  const color = getLatencyColor(latency, highlighted);
  // Adjust animation and appearance based on priority and highlight state
  const dashSize = highlighted ? 0.15 : priority === 'high' ? 0.12 : 0.1;
  const dashGap = highlighted ? 0.03 : priority === 'high' ? 0.04 : 0.05;
  const speed = highlighted ? 0.8 : priority === 'high' ? 0.7 : 0.5;
  const lineWidth = highlighted ? 2 : priority === 'high' ? 1.5 : 1;
  const opacity = highlighted ? 0.9 : priority === 'high' ? 0.7 : 0.5;
  
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
  // Filter and process connections
  const { connections, highlightedConnections } = useMemo(() => {
    const result = {
      connections: [] as { from: ExchangeServer; to: ExchangeServer; latency: number }[],
      highlightedConnections: new Set<string>()
    };
    const added = new Set<string>();
    
    // First pass: collect all connections
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
            };
            result.connections.push(connection);
            
            // If this connection is related to the selected server, mark it as highlighted
            if (selectedId && (server.id === selectedId || target.id === selectedId)) {
              result.highlightedConnections.add(key);
            }
          }
        }
      });
    });
    
    return result;
  }, [servers, selectedId]);
  
  // Group connections by latency for better rendering performance
  const { lowLatency, mediumLatency, highLatency } = useMemo(() => {
    const result = {
      lowLatency: [] as typeof connections,
      mediumLatency: [] as typeof connections,
      highLatency: [] as typeof connections,
    };
    
    connections.forEach(conn => {
      if (conn.latency < 50) {
        result.lowLatency.push(conn);
      } else if (conn.latency < 100) {
        result.mediumLatency.push(conn);
      } else {
        result.highLatency.push(conn);
      }
    });
    
    return result;
  }, [connections]);
  // Render connections in batches by latency for better performance
  return (
    <>
      {lowLatency.map((conn, idx) => {
        const key = `${conn.from.id}-${conn.to.id}-${idx}`;
        const isHighlighted = highlightedConnections.has([conn.from.id, conn.to.id].sort().join('_'));
        return (
          <Connection
            key={key}
            from={conn.from}
            to={conn.to}
            latency={conn.latency}
            highlighted={isHighlighted}
            priority="high"
          />
        );
      })}
      {mediumLatency.map((conn, idx) => {
        const key = `${conn.from.id}-${conn.to.id}-${idx + lowLatency.length}`;
        const isHighlighted = highlightedConnections.has([conn.from.id, conn.to.id].sort().join('_'));
        return (
          <Connection
            key={key}
            from={conn.from}
            to={conn.to}
            latency={conn.latency}
            highlighted={isHighlighted}
            priority="medium"
          />
        );
      })}
      {highLatency.map((conn, idx) => {
        const key = `${conn.from.id}-${conn.to.id}-${idx + lowLatency.length + mediumLatency.length}`;
        const isHighlighted = highlightedConnections.has([conn.from.id, conn.to.id].sort().join('_'));
        return (
          <Connection
            key={key}
            from={conn.from}
            to={conn.to}
            latency={conn.latency}
            highlighted={isHighlighted}
            priority="low"
          />
        );
      })}
    </>
  );
}
