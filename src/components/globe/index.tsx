'use client';
import { useTexture } from '@react-three/drei';
import { useTheme } from '@/contexts/theme-context';

export default function Globe() {
  const textureLight = useTexture('/textures/earth-map.jpg');
  const textureDark = useTexture('/textures/earth-map-2.jpg');
  const { theme } = useTheme();
  const texture = theme === 'dark' ? textureDark : textureLight;
  return (
   <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} transparent={false} opacity={1} />
    </mesh>
  );
}
