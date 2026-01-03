
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Float, Stars, Torus, MeshDistortMaterial, OrbitControls, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Fix: Use capitalized aliases to bypass JSX intrinsic element type errors
const Group = 'group' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;

const TechCoreContent = () => {
    const outerRingRef = useRef<THREE.Mesh>(null!);
    const innerRingRef = useRef<THREE.Mesh>(null!);
    const starsRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Get scroll position for parallax effect
        const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        
        if (outerRingRef.current) {
            outerRingRef.current.rotation.x = t * 0.2;
            outerRingRef.current.rotation.y = t * 0.1;
        }

        if (innerRingRef.current) {
            innerRingRef.current.rotation.x = -t * 0.2;
            innerRingRef.current.rotation.z = t * 0.1;
        }

        // Refined Parallax effect: Move and rotate stars based on scroll
        if (starsRef.current) {
            // Even more subtle rotation based on scroll for visual comfort
            starsRef.current.rotation.y = scrollY * 0.0001; 
            starsRef.current.rotation.x = scrollY * 0.00005;
            // Move stars slightly to create depth against the fixed foreground
            starsRef.current.position.y = -scrollY * 0.002; 
        }
    });

    return (
        <Group>
            {/* Central Energy Core - Optimized Mesh Detail */}
            <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                <Icosahedron args={[1.2, 2]}> {/* Reduced detail from 4 to 2 for better performance */}
                    <MeshDistortMaterial 
                        color="#06b6d4" 
                        emissive="#06b6d4"
                        emissiveIntensity={1.5}
                        envMapIntensity={1} 
                        clearcoat={1} 
                        clearcoatRoughness={0.1} 
                        metalness={0.5}
                        distort={0.4}
                        speed={2}
                    />
                </Icosahedron>
                {/* Inner sparkle particles for extra depth */}
                <Sparkles count={15} scale={3} size={4} speed={0.4} opacity={0.5} color="#a3e635" />
            </Float>

            {/* Outer Tech Rings with High Emissive Intensity for Bloom - Optimized Segments */}
            <Torus ref={outerRingRef} args={[2.5, 0.05, 12, 48]} rotation={[Math.PI / 2, 0, 0]}> {/* Reduced segments for performance */}
                 <MeshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2} />
            </Torus>
            
            <Torus ref={innerRingRef} args={[2, 0.03, 12, 48]} rotation={[0, Math.PI / 2, 0]}> {/* Reduced segments for performance */}
                 <MeshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={2} />
            </Torus>

            {/* Ambient Particle Field - Reduced count */}
            <Sparkles count={30} scale={10} size={2} speed={0.2} opacity={0.2} color="#ffffff" />

            {/* Background Stars with Parallax */}
            <Group ref={starsRef}>
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            </Group>
        </Group>
    );
};

const InteractiveTechCore = () => {
    return (
        <Canvas 
            camera={{ position: [0, 0, 8], fov: 55 }}
            dpr={[1, 2]} // Limit pixel ratio to 2 for performance on high-res screens
            performance={{ min: 0.5 }} // Allow regression if framerate drops
        >
            <AmbientLight intensity={0.5} />
            <PointLight position={[10, 10, 10]} intensity={1} />
            <TechCoreContent />
            
            {/* Post Processing for Glow/Bloom Effect - Optimized */}
            <EffectComposer enableNormalPass={false} multisampling={0}>
                <Bloom 
                    luminanceThreshold={0.2} 
                    mipmapBlur 
                    intensity={1.2} 
                    radius={0.6} 
                />
            </EffectComposer>

            {/* Optimized Controls for smoother interaction */}
            <OrbitControls 
                enableZoom={true} 
                enablePan={false} 
                enableRotate={true}
                autoRotate={true}
                autoRotateSpeed={0.8} // Slightly faster auto-rotate for dynamism
                minDistance={4} // Allow slightly closer zoom
                maxDistance={12} // Restrict zoom out to keep focus
                zoomSpeed={0.8} // More responsive zoom
                rotateSpeed={0.6} // More responsive rotation
                enableDamping={true}
                dampingFactor={0.05} // Smoother inertia
            />
        </Canvas>
    );
};

export default InteractiveTechCore;
