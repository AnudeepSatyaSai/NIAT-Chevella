
import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, PerspectiveCamera, CameraControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import Planet from './Planet';

const EARTH_RADIUS = 13.5; 
const EARTH_DISTANCE = 48; 

const PLANET_DATA = [
  { name: "Mercury", size: 0.8, distance: 22, speed: 1.2, rotationPeriod: 1.0, color: "#A57C1B", texture: "https://unpkg.com/three-globe/example/img/solar-system/mercury.jpg" },
  { name: "Venus", size: 1.4, distance: 30, speed: 0.8, rotationPeriod: 0.8, color: "#E3BB76", texture: "https://unpkg.com/three-globe/example/img/solar-system/venus.jpg" },
  { 
    name: "Earth", 
    size: EARTH_RADIUS, 
    distance: EARTH_DISTANCE, 
    speed: 0.2, 
    rotationPeriod: 0.4, 
    color: "#22A6B3", 
    texture: "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg", 
    isHero: true 
  },
  { name: "Mars", size: 1.1, distance: 80, speed: 0.5, rotationPeriod: 1.1, color: "#EB4D4B", texture: "https://unpkg.com/three-globe/example/img/solar-system/mars.jpg" },
  { name: "Jupiter", size: 5.5, distance: 110, speed: 0.3, rotationPeriod: 2.5, color: "#F0932B", texture: "https://unpkg.com/three-globe/example/img/solar-system/jupiter.jpg" },
  { name: "Saturn", size: 4.8, distance: 140, speed: 0.2, rotationPeriod: 2.2, color: "#F5C46F", hasRings: true, texture: "https://unpkg.com/three-globe/example/img/solar-system/saturn.jpg" },
  { name: "Uranus", size: 3.2, distance: 170, speed: 0.15, rotationPeriod: -1.8, color: "#D1E7E7", texture: "https://unpkg.com/three-globe/example/img/solar-system/uranus.jpg" },
  { name: "Neptune", size: 3.1, distance: 200, speed: 0.1, rotationPeriod: 1.6, color: "#4B70DD", texture: "https://unpkg.com/three-globe/example/img/solar-system/neptune.jpg" },
];

const Sun = () => {
    const sunRef = useRef<THREE.Mesh>(null!);
    useFrame((state, delta) => {
        sunRef.current.rotation.y += delta * 0.05;
    });
    return (
        <group position={[-90, 0, -50]}>
            <mesh ref={sunRef}>
                <sphereGeometry args={[25, 64, 64]} />
                <meshBasicMaterial
                    color={[2, 2, 2.5]} 
                    toneMapped={false}
                />
            </mesh>
            <pointLight intensity={15000} distance={4000} decay={2} color="#ffffff" castShadow />
            <Sparkles count={500} scale={80} size={15} speed={0.2} color="#ffffff" />
        </group>
    );
};

const CameraRig = ({ controlsRef }: { controlsRef: React.RefObject<any> }) => {
    useEffect(() => {
        if (controlsRef.current) {
            // Position camera to look at Earth on the right
            controlsRef.current.setLookAt(
                -25, 8, 85, // Eye position (far left looking right)
                48, 0, -10, // Target (Earth)
                false
            );
        }
    }, []);

    useFrame((state) => {
        // Subtle kinematic drift
        state.camera.position.x += Math.sin(state.clock.elapsedTime * 0.08) * 0.003;
        state.camera.position.y += Math.cos(state.clock.elapsedTime * 0.12) * 0.003;
    });
    return null;
};

const SolarSystem = ({ isLanded }: { isLanded: boolean }) => {
    const controlsRef = useRef<any>(null);

    return (
        <div className="w-full h-full absolute inset-0 bg-black overflow-hidden pointer-events-none">
            <Canvas 
                shadows 
                dpr={[1, 2]}
                gl={{ 
                    antialias: true, 
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.6,
                    outputColorSpace: THREE.SRGBColorSpace
                }}
                style={{ pointerEvents: 'none' }}
            >
                <PerspectiveCamera makeDefault fov={40} />
                <CameraControls ref={controlsRef} enabled={false} />
                <CameraRig controlsRef={controlsRef} />
                <color attach="background" args={['#000']} />
                <ambientLight intensity={0.12} />
                
                <EffectComposer multisampling={4}>
                    <Bloom luminanceThreshold={1} intensity={2.0} radius={0.4} />
                    <Vignette offset={0.1} darkness={0.9} />
                    <Noise opacity={0.04} />
                </EffectComposer>

                <Suspense fallback={null}>
                    <Stars radius={300} depth={150} count={15000} factor={7} saturation={0} fade speed={1.2} />
                    <Sun />
                    {PLANET_DATA.map((planet) => (
                        <Planet 
                            key={planet.name}
                            data={planet} 
                            active={planet.isHero}
                            isLanded={isLanded}
                            timeSpeed={1.0}
                        />
                    ))}
                </Suspense>
            </Canvas>
        </div>
    );
};

export default SolarSystem;
