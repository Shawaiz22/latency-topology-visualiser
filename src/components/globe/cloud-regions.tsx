// 'use client';

// import { useMemo } from 'react';
// import { Line } from '@react-three/drei';
// import { Vector3 } from 'three';
// import { CLOUD_REGIONS } from '@/data/exchanges';

// interface CloudRegionsProps {
//   visible: boolean;
//   selectedProvider?: string;
// }

// export default function CloudRegions({ visible, selectedProvider }: CloudRegionsProps) {
//   // Generate region boundaries
//   const regionLines = useMemo(() => {
//     if (!visible) return [];

//     return CLOUD_REGIONS
//       .filter(region => !selectedProvider || region.provider === selectedProvider)
//       .map((region) => {
//         // Simple rectangular boundary for each region
//         const {  boundaries } = region;
        
//         // Convert lat/lon to 3D coordinates on the sphere
//         const getPosition = (lat: number, lon: number, radius = 1.01) => {
//           const phi = (90 - lat) * (Math.PI / 180);
//           const theta = (lon + 180) * (Math.PI / 180);
          
//           const x = -(radius * Math.sin(phi) * Math.cos(theta));
//           const z = radius * Math.sin(phi) * Math.sin(theta);
//           const y = radius * Math.cos(phi);
          
//           return new Vector3(x, y, z);
//         };
        
//         // Create a rectangle boundary
//         const points = [
//           getPosition(boundaries[0].lat, boundaries[0].lon),
//           getPosition(boundaries[1].lat, boundaries[1].lon),
//           getPosition(boundaries[2].lat, boundaries[2].lon),
//           getPosition(boundaries[3].lat, boundaries[3].lon),
//           getPosition(boundaries[0].lat, boundaries[0].lon), // Close the shape
//         ];
        
//         // Get provider color
//         const getProviderColor = (provider: string) => {
//           switch (provider) {
//             case 'AWS': return '#FF9900';
//             case 'GCP': return '#4285F4';
//             case 'Azure': return '#0089D6';
//             default: return '#666666';
//           }
//         };
        
//         return {
//           points,
//           color: getProviderColor(region.provider),
//           name: region.name,
//           provider: region.provider,
//         };
//       });
//   }, [visible, selectedProvider]);

//   if (!visible) return null;

//   return (
//     <group>
//       {regionLines.map((region) => (
//         <Line
//           key={`${region.provider}-${region.name}`}
//           points={region.points}
//           color={region.color}
//           lineWidth={0.5}
//           opacity={0.7}
//           transparent
//           depthTest={false}
//           renderOrder={1}
//         />
//       ))}
//     </group>
//   );
// }



'use client';

import { useMemo } from 'react';
import { Line, Text } from '@react-three/drei';
import { Vector3 } from 'three';
import { CLOUD_REGIONS } from '@/data/exchanges';

interface CloudRegionsProps {
  visible: boolean;
  selectedProvider?: string;
}

export default function CloudRegions({ visible, selectedProvider }: CloudRegionsProps) {
  const regionLines = useMemo(() => {
    if (!visible) return [];

    const getPosition = (lat: number, lon: number, radius = 1.01) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return new Vector3(x, y, z);
    };

    const getProviderColor = (provider: string) => {
      switch (provider) {
        case 'AWS': return '#FF9900';
        case 'GCP': return '#4285F4';
        case 'Azure': return '#0089D6';
        default: return '#666666';
      }
    };

    return CLOUD_REGIONS
      .filter(region => !selectedProvider || region.provider === selectedProvider)
      .map((region) => {
        const { boundaries } = region;

        const lats = boundaries.map(b => b.lat);
        const lons = boundaries.map(b => b.lon);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);

        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;

        const height = Math.abs(maxLat - minLat);
        const width = Math.abs(maxLon - minLon);

        // Rectangle around center
        const corners = [
          getPosition(centerLat + height / 2, centerLon - width / 2),
          getPosition(centerLat + height / 2, centerLon + width / 2),
          getPosition(centerLat - height / 2, centerLon + width / 2),
          getPosition(centerLat - height / 2, centerLon - width / 2),
          getPosition(centerLat + height / 2, centerLon - width / 2), // Close loop
        ];

        const labelPos = getPosition(centerLat, centerLon, 1.02);

        return {
          points: corners,
          color: getProviderColor(region.provider),
          name: region.name,
          labelPosition: labelPos,
        };
      });
  }, [visible, selectedProvider]);

  if (!visible) return null;

  return (
    <group>
      {regionLines.map((region, idx) => (
        <group key={idx}>
          <Line
            points={region.points}
            color={region.color}
            lineWidth={1}
            opacity={0.8}
            transparent
            depthTest={false}
            renderOrder={2}
          />
          <Text
            position={region.labelPosition}
            fontSize={0.015}
            color={region.color}
            anchorX="center"
            anchorY="middle"
          >
            {region.name}
          </Text>
        </group>
      ))}
    </group>
  );
}
