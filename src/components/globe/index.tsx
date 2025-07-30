'use client';
import { useTexture, Html, useProgress } from '@react-three/drei';
import { useTheme } from '@/contexts/theme-context';

export default function Globe() {
  const { theme } = useTheme();
  const textureLight = useTexture('/textures/earth-map.jpg');
  const textureDark = useTexture('/textures/earth-map-2.jpg');
  const texture = theme === 'dark' ? textureDark : textureLight;

  // useProgress reports loading state for all assets in <Canvas>
  const { active } = useProgress();

  if (active) {
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
