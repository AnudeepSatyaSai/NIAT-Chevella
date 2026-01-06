
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

const Planet = ({ data, active, isLanded, timeSpeed = 1.0 }: any) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const moonRef = useRef<THREE.Mesh>(null!);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      data.texture,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 16;
        setTexture(tex);
        setLoadError(false);
      },
      undefined,
      () => {
        // Silenced texture error warning. Fallback color is used.
        setLoadError(true);
      }
    );
  }, [data.texture, data.name]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const speedMultiplier = delta * timeSpeed;
    
    // Orbital rotation around Sun
    if (groupRef.current) {
      groupRef.current.rotation.y += data.speed * 0.05 * speedMultiplier;
    }
    
    // Self axial rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += (data.rotationPeriod || 0.5) * speedMultiplier;
    }

    // Moon orbital logic for Earth
    if (moonRef.current && data.name === 'Earth') {
      const moonOrbitSpeed = 0.8 * timeSpeed;
      const moonOrbitRadius = data.size * 1.6;
      moonRef.current.position.x = Math.cos(t * moonOrbitSpeed) * moonOrbitRadius;
      moonRef.current.position.z = Math.sin(t * moonOrbitSpeed) * moonOrbitRadius;
      moonRef.current.rotation.y += speedMultiplier;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Subtle orbital path ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.distance - 0.1, data.distance + 0.1, 128]} />
        <meshBasicMaterial color="#ffffff" opacity={0.06} transparent side={THREE.DoubleSide} />
      </mesh>

      <group position={[data.distance, 0, 0]}>
        {/* Main Planet Mesh */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <sphereGeometry args={[data.size, 128, 128]} />
          <meshStandardMaterial
            map={!loadError ? (texture ?? undefined) : undefined}
            roughness={0.8}
            metalness={0.1}
            color={loadError || !texture ? data.color : '#ffffff'}
          />
        </mesh>

        {data.name === 'Earth' && (
          <>
            {/* Atmosphere Layer */}
            <mesh scale={[1.02, 1.02, 1.02]}>
              <sphereGeometry args={[data.size, 128, 128]} />
              <meshStandardMaterial
                transparent
                opacity={0.15}
                color="#4ebfff"
                emissive="#4ebfff"
                emissiveIntensity={1.2}
                side={THREE.BackSide}
              />
            </mesh>

            {/* Earth's Moon */}
            <mesh ref={moonRef} castShadow receiveShadow>
                <sphereGeometry args={[data.size * 0.22, 32, 32]} />
                <meshStandardMaterial color="#888888" roughness={1} />
                <AnimatePresence>
                    {active && (
                        <Html position={[0, data.size * 0.5, 0]} center>
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="bg-black/80 px-2 py-0.5 rounded-full border border-slate-500/50 text-slate-300 font-bold text-[8px] uppercase tracking-widest whitespace-nowrap backdrop-blur-md"
                            >
                                MOON
                            </motion.div>
                        </Html>
                    )}
                </AnimatePresence>
            </mesh>

            {/* HUD Labels */}
            <AnimatePresence>
                {!isLanded && (
                    <Html position={[data.size * 0.6, data.size * 0.4, data.size * 0.6]} center>
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="flex flex-col items-start pointer-events-none"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-[2px] w-12 bg-cyan-400/80"></div>
                                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-sm border-l-2 border-cyan-400">
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
                                        EARTH • INDIA • CHEVELLA
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </Html>
                )}
            </AnimatePresence>
            
            <Html position={[0, -data.size - 3, 0]} center>
                <div className="text-[40px] font-black text-white/5 uppercase tracking-[0.6em] select-none pointer-events-none italic">
                    EARTH
                </div>
            </Html>
          </>
        )}

        {/* Saturn Specific Rings */}
        {data.hasRings && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[data.size * 1.4, data.size * 2.5, 128]} />
            <meshStandardMaterial
              transparent
              opacity={0.3}
              color="#ffffff"
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default Planet;
