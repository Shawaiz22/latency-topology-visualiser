// components/RotatingGroup.tsx
'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function RotatingGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  // rotate the entire group (globe + markers)
  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.05;
  });

  return <group ref={groupRef}>{children}</group>;
}
