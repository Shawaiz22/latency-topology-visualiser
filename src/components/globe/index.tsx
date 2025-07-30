'use client';
import { useTexture } from '@react-three/drei';
import { useTheme } from '@/contexts/theme-context';
import { useState } from 'react';

export default function Globe() {
  const [loading, setLoading] = useState(true);
  const textureLight = useTexture('/textures/earth-map.jpg', undefined, () => setLoading(false));
  const textureDark = useTexture('/textures/earth-map-2.jpg', undefined, () => setLoading(false));
  const { theme } = useTheme();
  const texture = theme === 'dark' ? textureDark : textureLight;

  // Show loader while texture is loading
  if (loading) {
    return (
      <mesh>
        <Html center>
          <div style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>Loading globe...</div>
        </Html>
      </mesh>
    );
  }

  return (
   <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} transparent={false} opacity={1} />
    </mesh>
  );
}
