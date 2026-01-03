
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

const Planet = ({ data, active, isIntroStep }: any) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const groupRef = useRef<THREE.Group>(null!);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        loader.load(data.texture, 
            (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                setTexture(tex);
            },
            undefined,
            () => console.warn(`Texture load failed for ${data.name}, using color fallback.`)
        );
    }, [data.texture, data.name]);

    useFrame((state, delta) => {
        if (groupRef.current && (isIntroStep === 'WIDE' || !active)) {
            groupRef.current.rotation.y += data.speed * 0.1 * delta;
        }
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            <group position={[data.distance, 0, 0]}>
                <mesh ref={meshRef} castShadow receiveShadow>
                    <sphereGeometry args={[data.size, 64, 64]} />
                    <meshPhongMaterial 
                        map={texture} 
                        color={!texture ? data.color : '#ffffff'}
                        shininess={10}
                    />
                </mesh>

                {data.name === 'Earth' && (
                    <>
                        <mesh scale={[1.05, 1.05, 1.05]}>
                            <sphereGeometry args={[data.size, 64, 64]} />
                            <meshBasicMaterial color="#00ccff" transparent opacity={0.1} side={THREE.BackSide} />
                        </mesh>
                        <AnimatePresence>
                            {isIntroStep !== 'WIDE' && (
                                <Html position={[0, data.size + 1.5, 0]} center>
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/80 px-6 py-2 rounded-full border border-cyan-500/50 text-cyan-400 font-black text-xs uppercase tracking-widest whitespace-nowrap backdrop-blur-md">
                                        Sector: Planet Earth
                                    </motion.div>
                                </Html>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {data.hasRings && (
                    <mesh rotation={[Math.PI / 3, 0, 0]}>
                        <ringGeometry args={[data.size * 1.4, data.size * 2.2, 64]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
                    </mesh>
                )}
            </group>
        </group>
    );
};

export default Planet;
