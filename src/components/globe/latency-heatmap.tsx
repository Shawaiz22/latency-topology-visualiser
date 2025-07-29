'use client';

import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { Vector3, Color } from 'three';
import { ExchangeServer } from '@/data/exchanges';

interface LatencyHeatmapProps {
  servers: ExchangeServer[];
  visible: boolean;
  intensity?: number;
  radius?: number;
}

export default function LatencyHeatmap({ 
  servers, 
  visible, 
  intensity = 1.5, 
  radius = 2 
}: LatencyHeatmapProps) {
  // Generate heatmap points based on server latency
  const heatmapPoints = useMemo(() => {
    if (!visible) return [];
    
    return servers.map(server => {
      // Convert lat/lon to 3D coordinates
      const phi = (90 - server.lat) * (Math.PI / 180);
      const theta = (server.lon + 180) * (Math.PI / 180);
      
      // Position on sphere (slightly above the surface)
      const x = -Math.sin(phi) * Math.cos(theta) * 1.01;
      const y = Math.cos(phi) * 1.01;
      const z = Math.sin(phi) * Math.sin(theta) * 1.01;
      
      // Color based on latency (red = high, green = low)
      const latency = server.currentLatency || 0;
      const normalizedLatency = Math.min(latency / 500, 1); // Normalize to 0-1 range (assuming max 500ms)
      const color = new Color()
        .lerpColors(
          new Color(0, 1, 0), // Green (good)
          new Color(1, 0, 0), // Red (bad)
          normalizedLatency
        );
      
      return {
        position: new Vector3(x, y, z),
        color,
        intensity: intensity * (0.5 + normalizedLatency * 0.5) // Vary intensity based on latency
      };
    });
  }, [servers, visible, intensity]);

  if (!visible || heatmapPoints.length === 0) return null;

  return (
    <group>
      {heatmapPoints.map((point, index) => (
        <mesh key={`heat-${index}`} position={point.position}>
          <sphereGeometry args={[radius * 0.02, 16, 16]} />
          <meshBasicMaterial 
            color={point.color} 
            transparent 
            opacity={point.intensity * 0.7}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
