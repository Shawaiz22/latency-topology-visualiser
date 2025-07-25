// lib/geo.ts
import * as THREE from 'three';

/**
 * Converts geographic coordinates (lat, lon) to a Vector3 on a unit sphere.
 */
export function latLonToVector3(lat: number, lon: number): THREE.Vector3 {
  const radius = 1;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}
