
import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, Text, Html, useCursor, Stars, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { BuildingConfig } from '../../types';
import { CAMPUS_BUILDINGS } from '../../constants';

// Fix: Use capitalized aliases to bypass JSX intrinsic element type errors
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const BoxGeometry = 'boxGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const RingGeometry = 'ringGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const Color = 'color' as any;
const Fog = 'fog' as any;
const AmbientLight = 'ambientLight' as any;
const DirectionalLight = 'directionalLight' as any;
const GridHelper = 'gridHelper' as any;
const PlaneGeometry = 'planeGeometry' as any;

interface BuildingProps {
    config: BuildingConfig;
    onSelect: (b: BuildingConfig) => void;
    isSelected: boolean;
}

const Building: React.FC<BuildingProps> = ({ config, onSelect, isSelected }) => {
    const ref = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);
    useCursor(hovered);

    useFrame((state) => {
        if (ref.current) {
            // Smoothly animate height/position on select
            const targetY = isSelected ? config.size[1] / 2 + 1 : config.size[1] / 2;
            ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.1);
        }
    });

    return (
        <Group>
            <Mesh
                ref={ref}
                position={[config.position[0], config.size[1] / 2, config.position[2]]}
                onPointerOver={(e: any) => { e.stopPropagation(); setHover(true); }}
                onPointerOut={(e: any) => { e.stopPropagation(); setHover(false); }}
                onClick={(e: any) => { e.stopPropagation(); onSelect(config); }}
            >
                <BoxGeometry args={config.size} />
                <MeshStandardMaterial 
                    color={config.color} 
                    emissive={config.color}
                    emissiveIntensity={hovered || isSelected ? 0.6 : 0.1}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Mesh>
            {/* Floor Glow */}
            <Mesh position={[config.position[0], 0.05, config.position[2]]} rotation={[-Math.PI/2, 0, 0]}>
                <RingGeometry args={[0, Math.max(config.size[0], config.size[2]), 32]} />
                <MeshBasicMaterial color={config.color} opacity={hovered || isSelected ? 0.3 : 0.1} transparent side={THREE.DoubleSide} />
            </Mesh>
            
            {/* Label on top */}
            {(hovered || isSelected) && (
                <Html position={[config.position[0], config.size[1] + 2, config.position[2]]} center distanceFactor={15}>
                    <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-gray-600 pointer-events-none backdrop-blur-sm">
                        {config.name}
                    </div>
                </Html>
            )}
        </Group>
    );
};

const CampusMap = () => {
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingConfig | null>(null);

    return (
        <div className="h-[75vh] w-full bg-gray-900 rounded-xl overflow-hidden relative border border-gray-700 shadow-2xl">
            {/* Overlay Header */}
            <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 pointer-events-none">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                    NIAT Chevella Campus
                </h2>
                <p className="text-xs text-slate-400 mt-1">Interactive 3D View</p>
            </div>

            <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-cyan-500">Loading 3D Map...</div>}>
                <Canvas shadows camera={{ position: [25, 25, 25], fov: 40 }}>
                    <Color attach="background" args={['#050505']} />
                    <Fog attach="fog" args={['#050505', 20, 70]} />
                    <AmbientLight intensity={0.4} />
                    <DirectionalLight 
                        position={[10, 20, 10]} 
                        intensity={1} 
                        castShadow 
                        shadow-mapSize={[1024, 1024]}
                    />
                    
                    <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
                    
                    <Group position={[0, -0.5, 0]}>
                        {/* Ground Grid */}
                        <GridHelper args={[100, 50, 0x333333, 0x111111]} />
                        {/* Floor Plane */}
                        <Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                            <PlaneGeometry args={[100, 100]} />
                            <MeshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.2} />
                        </Mesh>
                        
                        {CAMPUS_BUILDINGS.map((building) => (
                            <Building 
                                key={building.id} 
                                config={building} 
                                onSelect={setSelectedBuilding} 
                                isSelected={selectedBuilding?.id === building.id} 
                            />
                        ))}

                        <ContactShadows resolution={1024} scale={100} blur={2} opacity={0.5} far={10} color="#000000" />
                    </Group>

                    <MapControls 
                        enableDamping 
                        dampingFactor={0.05} 
                        minDistance={10} 
                        maxDistance={80} 
                        maxPolarAngle={Math.PI / 2.2} 
                    />
                </Canvas>
            </Suspense>

            {/* Info Panel Overlay */}
            <AnimatePresence>
                {selectedBuilding && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className="absolute bottom-6 left-6 z-20 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden shadow-2xl"
                    >
                        <div className="h-2" style={{ backgroundColor: selectedBuilding.color }} />
                        <div className="p-5 relative">
                            <button 
                                onClick={() => setSelectedBuilding(null)} 
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                                aria-label="Close details"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            
                            <h3 className="text-xl font-bold text-white mb-1">{selectedBuilding.name}</h3>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-900/50">
                                    ID: {selectedBuilding.id.toUpperCase()}
                                </span>
                                <span className="text-xs font-mono text-slate-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                                    {selectedBuilding.status}
                                </span>
                            </div>
                            
                            <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                {selectedBuilding.description}
                            </p>
                            
                            <button className="w-full py-2 bg-white text-black font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors">
                                View Details
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Instructions */}
            <div className="absolute bottom-4 right-4 z-10 text-[10px] text-slate-500 bg-black/50 px-2 py-1 rounded pointer-events-none backdrop-blur-sm border border-white/5">
                RMB: Pan • LMB: Rotate • Scroll: Zoom
            </div>
        </div>
    );
};

export default CampusMap;
