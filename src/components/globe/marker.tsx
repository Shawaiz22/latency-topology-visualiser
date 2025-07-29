'use client';
import { useState, useRef } from 'react';
import { Html, Text } from '@react-three/drei';
import { ExchangeServer } from '@/data/exchanges';
import { latLonToVector3 } from '@/lib/geo';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type MarkerProps = {
  server: ExchangeServer;
  selected?: boolean;
  onClick?: () => void;
};

const PROVIDER_COLORS = {
  AWS: '#FF9900',
  GCP: '#4285F4',
  Azure: '#0089D6',
} as const;

const STATUS_COLORS = {
  online: '#10B981',
  degraded: '#F59E0B',
  offline: '#EF4444',
} as const;

// This component must be rendered within a Canvas component
export default function Marker({ server, selected = false, onClick }: MarkerProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const pos = latLonToVector3(server.lat, server.lon).multiplyScalar(1.02);
  const color = PROVIDER_COLORS[server.provider];
  const statusColor = STATUS_COLORS[server.status];
  const scale = selected ? 1.5 : 1;
  const isActive = hovered || selected;

  // Pulsing animation - only runs in browser and within Canvas
  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const pulseScale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      pulseRef.current.scale.setScalar(pulseScale);
    }
  });

  // Handle click events
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <group 
      ref={groupRef} 
      position={pos}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Pulsing effect */}
      {isActive && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.3} 
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Main marker */}
      <mesh scale={scale}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={isActive ? color : undefined}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
        
        {/* Status indicator ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.025, 0.03, 16]} />
          <meshBasicMaterial 
            color={statusColor} 
            side={THREE.DoubleSide} 
            transparent 
            opacity={0.9}
          />
        </mesh>
      </mesh>

      {/* Exchange code label */}
      <Text
        position={[0, 0.05, 0]}
        fontSize={0.03}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.002}
        outlineColor="black"
        outlineOpacity={0.8}
        visible={isActive}
      >
        {server.code}
      </Text>

      {/* Tooltip */}
      {(hovered || selected) && (
        <Html
          as="div"
          wrapperClass="tooltip-wrapper"
          className="pointer-events-none"
          style={{
            position: 'absolute',
            transform: 'translate(-50%, -100%)',
            zIndex: 1000,
            minWidth: '200px',
            maxWidth: '300px',
          }}
          position={[0, 0.1, 0]}
          center
          occlude
          transform={false}
        >
          <div 
            className={`px-3 py-2 rounded-lg shadow-lg bg-gray-900/95 backdrop-blur-sm border ${
              server.status === 'online' ? 'border-green-500' :
              server.status === 'degraded' ? 'border-amber-500' :
              'border-red-500'
            }`}
            style={{
              transform: 'translateZ(50px)',
              transformStyle: 'preserve-3d',
              pointerEvents: 'none',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: PROVIDER_COLORS[server.provider] }}
              />
              <h3 className="text-sm font-semibold text-white truncate">
                {server.name}
              </h3>
            </div>
            <div className="text-xs text-gray-300">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <span 
                    className="inline-block w-2 h-2 rounded-full" 
                    style={{ backgroundColor: statusColor }} 
                  />
                  <span className="capitalize">{server.status}</span>
                </span>
                <span className="text-gray-500">•</span>
                <span>{server.provider}</span>
                <span className="text-gray-500">•</span>
                <span className="font-mono">
                  {server.currentLatency || server.lastPing || 'N/A'}ms
                </span>
              </div>
              {server.region && (
                <div className="mt-1 text-gray-400 text-xs">
                  {server.region}
                </div>
              )}
            </div>
            
            {server.connections && server.connections.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <h4 className="text-xs font-semibold text-gray-400 mb-1">Connections:</h4>
                <div className="space-y-1">
                  {server.connections.map((conn, i) => (
                    <div key={i} className="flex justify-between text-xs text-white">
                      <span className="truncate">{conn.targetId}</span>
                      <span className="ml-2 whitespace-nowrap">{conn.latency}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
