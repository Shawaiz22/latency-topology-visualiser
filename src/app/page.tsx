'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Globe from '@/components/globe';
import ServerMarkers from '@/components/globe/server-markers';
import RotatingGroup from '@/components/rotating-group';

export default function HomePage() {
  return (
    <div className="w-screen h-screen">
      <Canvas>
        <ambientLight intensity={1} />
        <directionalLight intensity={1} position={[5, 3, 5]} />

        <PerspectiveCamera makeDefault position={[0, 0, 4]} />

        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          enablePan={false}
          rotateSpeed={0.8}
        />


       {/* Everything inside this group will spin together */}
       <RotatingGroup>
         <Globe />
         <ServerMarkers />
       </RotatingGroup>
      </Canvas>
    </div>
  );
}
