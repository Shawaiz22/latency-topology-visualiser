'use client';
import { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Stars } from '@react-three/drei';
import Globe from '@/components/globe';
import ServerMarkers from '@/components/globe/server-markers';
import RotatingGroup from '@/components/rotating-group';
import ControlPanel from '@/components/controls/control-panel';
import { EXCHANGE_SERVERS } from '@/data/exchanges';
import { useTheme } from '@/contexts/theme-context';


const Home = () => {
    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        providers: ['AWS', 'GCP', 'Azure'],
        status: ['online', 'degraded'],
        latencyRange: [0, 500] as [number, number],
    });
    const [showConnections, setShowConnections] = useState(true);
    const [showRegions, setShowRegions] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);

    const filteredServers = useMemo(() => {
        return EXCHANGE_SERVERS.filter(server => {
            if (!filters.providers.includes(server.provider)) return false;
            if (!filters.status.includes(server.status)) return false;
            const latency = server.currentLatency || server.lastPing || 0;
            if (latency < filters.latencyRange[0] || latency > filters.latencyRange[1]) {
                return false;
            }
            return true;
        });
    }, [filters]);

    type FilterState = {
        providers: string[];
        status: string[];
        latencyRange: [number, number];
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    const handleSelectServer = (id: string | null) => {
        setSelectedServerId(prevId => (prevId === id ? null : id));
    };

    const handleToggleConnections = () => {
        setShowConnections(!showConnections);
    };

    const handleToggleHeatmap = () => {
        setShowHeatmap(!showHeatmap);
    };

    const handleToggleRegions = () => {
        setShowRegions(!showRegions);
    };

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div
            className="w-screen h-screen relative"
            style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}
        >
            <Canvas shadows>
                <color attach="background" args={[isDark ? '#0f172a' : '#f9fafb']} />
                <ambientLight intensity={isDark ? 0.5 : 1.2} />
                <directionalLight
                    position={[5, 3, 5]}
                    intensity={isDark ? 1.5 : 0.8}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <directionalLight position={[-5, -3, -5]} intensity={isDark ? 0.5 : 0.3} />

                <PerspectiveCamera makeDefault position={[0, 0, 4]} />

                <OrbitControls
                    enableDamping
                    dampingFactor={0.1}
                    minDistance={2}
                    maxDistance={10}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 1.5}
                    enablePan={true}
                    rotateSpeed={0.8}
                    autoRotate
                    autoRotateSpeed={0.5}
                />

                {isDark ? (
                    <Stars
                        radius={100}
                        depth={50}
                        count={5000}
                        factor={4}
                        saturation={0}
                        fade
                        speed={0.5}
                    />)
                    : (<Sky sunPosition={[100, 20, 100]} distance={450000} inclination={0.49} azimuth={0.25} />)
                }

                <RotatingGroup>
                    <Globe />
                    <ServerMarkers
                        servers={filteredServers}
                        selectedId={selectedServerId}
                        onSelectServer={handleSelectServer}
                        showRegions={showRegions}
                        showConnections={showConnections}
                        showHeatmap={showHeatmap}
                    />
                </RotatingGroup>
            </Canvas>


            <ControlPanel
                servers={EXCHANGE_SERVERS}
                filteredServers={filteredServers}
                selectedServerId={selectedServerId}
                onSelectServer={handleSelectServer}
                onFilterChange={handleFilterChange}
                filters={filters}
                showConnections={showConnections}
                showHeatmap={showHeatmap}
                showRegions={showRegions}
                onToggleConnections={handleToggleConnections}
                onToggleHeatmap={handleToggleHeatmap}
                onToggleRegions={handleToggleRegions}
            />
        </div>
    );
}

export default Home;