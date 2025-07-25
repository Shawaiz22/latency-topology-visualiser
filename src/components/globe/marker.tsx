'use client';
import { useState } from 'react';
import { Html } from '@react-three/drei';
import { ExchangeServer } from '@/data/exchanges';
import { latLonToVector3 } from '@/lib/geo';

type MarkerProps = {
  server: ExchangeServer;
};

export default function Marker({ server }: MarkerProps) {
  // track hover state
  const [hovered, setHovered] = useState(false);

  // compute position just above the globe
  const pos = latLonToVector3(server.lat, server.lon).multiplyScalar(1.02);

  // color by provider
  const color =
    server.provider === 'AWS'
      ? 'orange'
      : server.provider === 'GCP'
      ? 'lightblue'
      : 'lightgreen';

  return (
    <group position={pos}>
      {/* the sphere marker */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* tooltip rendered above the marker when hovered */}
      {hovered && (
        <Html distanceFactor={10} className="pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white p-1.5 rounded whitespace-nowrap text-xs transform -translate-x-1/2 -translate-y-full">
            <strong className="block font-semibold">{server.name}</strong>
            <span>{server.provider}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
