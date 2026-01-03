
import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Stars, Sparkles, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import Planet from './Planet';

// Aliases for JSX intrinsic elements to avoid strict type errors
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const PointLight = 'pointLight' as any;
const AmbientLight = 'ambientLight' as any;
const Color = 'color' as any;
const DirectionalLight = 'directionalLight' as any;

const PLANET_DATA = [
  { name: "Mercury", size: 0.7, distance: 15, speed: 4.0, color: "#A57C1B", rotationPeriod: 1407, texture: "https://upload.wikimedia.org/wikipedia/commons/3/30/Mercury_in_color_-_Prockter07_centered.jpg", description: "Smallest" },
  { name: "Venus", size: 1.2, distance: 25, speed: 3.0, color: "#E3BB76", rotationPeriod: 5832, texture: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg", description: "Extreme" },
  { name: "Earth", size: 4.0, distance: 60, speed: 0, color: "#22A6B3", hasClouds: true, rotationPeriod: 24, texture: "https://upload.wikimedia.org/wikipedia/commons/c/cb/The_Blue_Marble_%28remastered%29.jpg", description: "Home" },
  { name: "Mars", size: 0.9, distance: 85, speed: 2.0, color: "#EB4D4B", rotationPeriod: 24.6, texture: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg", description: "Red" },
  { name: "Jupiter", size: 7.0, distance: 120, speed: 1.2, color: "#F0932B", rotationPeriod: 9.9, texture: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg", description: "Giant" },
  { name: "Saturn", size: 6.0, distance: 160, speed: 0.9, color: "#F5C46F", hasRings: true, rotationPeriod: 10.7, texture: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg", description: "Jewel" },
];

const Sun = () => (
    <Group>
        <Mesh>
            <SphereGeometry args={[10, 64, 64]} />
            <MeshBasicMaterial color={[12, 6, 2.5]} toneMapped={false} />
        </Mesh>
        <PointLight intensity={1500} distance={4000} decay={1.8} color="#ffcc33" position={[0, 0, 0]} />
        <Sparkles count={600} scale={45} size={12} speed={0.4} color="#ffaa00" />
    </Group>
);

const CinematicSequence = ({ 
    step, 
    setStep, 
    cameraControls,
    onFinish
}: { 
    step: string, 
    setStep: (s: string) => void, 
    cameraControls: React.RefObject<CameraControls>,
    onFinish: () => void
}) => {
    useEffect(() => {
        if (!cameraControls.current) return;

        if (step === 'ZOOMING_EARTH') {
            const tl = gsap.timeline();
            
            // Phase 1: Wide Descent to High Orbit
            tl.to(cameraControls.current.camera.position, {
                x: 75,
                y: 18,
                z: 55,
                duration: 6,
                ease: "expo.inOut",
                onUpdate: () => {
                    cameraControls.current?.setTarget(60, 0, 0, false);
                }
            })
            // Phase 2: Targeted Focus on India Sector
            .to(cameraControls.current.camera.position, {
                x: 68.2,
                y: 6.4,
                z: 21.5,
                duration: 4,
                ease: "power4.inOut",
                onComplete: () => setStep('FOCUSING_INDIA')
            });
        }

        if (step === 'DEEP_DIVE') {
            // Phase 3: Final precision landing over Chevella node
            gsap.to(cameraControls.current.camera.position, {
                x: 63.9,
                y: 1.6,
                z: 4.6,
                duration: 5,
                ease: "expo.inOut",
                onComplete: () => {
                    setStep('LANDED');
                    onFinish();
                }
            });
        }
    }, [step, cameraControls, setStep, onFinish]);

    return null;
};

const SolarSystem = ({ onLand }: { onLand?: () => void }) => {
    const [step, setStep] = useState('WIDE'); 
    const cameraControlRef = useRef<CameraControls>(null);

    return (
        <div className="w-full h-full relative bg-black font-inter overflow-hidden">
            <Canvas shadows camera={{ position: [-450, 350, 650], fov: 24 }} dpr={[1, 2]}>
                <Color attach="background" args={['#000']} />
                
                {/* Visual Fixes: Global Lighting */}
                <AmbientLight intensity={0.7} />
                <DirectionalLight position={[100, 40, 20]} intensity={6} castShadow />

                <EffectComposer enableNormalPass={false}>
                    <Bloom luminanceThreshold={0.4} intensity={3.5} radius={1.2} mipmapBlur />
                    <Vignette offset={0.3} darkness={1.2} />
                    <Noise opacity={0.08} />
                    <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2.5} />
                </EffectComposer>

                <Suspense fallback={null}>
                    {/* Starfield Particles */}
                    <Stars radius={950} depth={200} count={30000} factor={18} saturation={0.8} fade speed={2} />
                    <Sparkles count={1200} scale={400} size={2} speed={1.2} opacity={0.4} color="#ffffff" />
                    
                    <Sun />

                    {PLANET_DATA.map((planet) => (
                        <Planet 
                            key={planet.name}
                            data={planet}
                            active={step !== 'WIDE' && planet.name === 'Earth'}
                            activeObject={planet.name === 'Earth' ? step : null}
                            onSelect={() => {}}
                            timeSpeed={step === 'WIDE' ? 1.0 : 0.015}
                            cameraControls={cameraControlRef}
                            isIntroStep={step}
                            setIntroStep={setStep}
                        />
                    ))}

                    <CinematicSequence 
                        step={step} 
                        setStep={setStep} 
                        cameraControls={cameraControlRef} 
                        onFinish={onLand || (() => {})} 
                    />
                </Suspense>

                <CameraControls 
                    ref={cameraControlRef} 
                    enabled={step === 'WIDE' || step === 'LANDED'}
                />
            </Canvas>

            {/* Cinematic HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none z-30 select-none">
                <AnimatePresence mode="popLayout">
                    {step === 'WIDE' && (
                        <motion.div 
                            key="intro-panel"
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-6"
                        >
                            <div className="text-center">
                                <motion.p 
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-cyan-400 font-mono text-[10px] uppercase tracking-[1.5em] mb-4"
                                >
                                    Astro-Visualization Engine V6.1
                                </motion.p>
                                <motion.h1 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-7xl md:text-[9.5rem] font-black text-white italic uppercase tracking-tighter leading-none mb-20"
                                >
                                    NIAT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4D8] to-[#0077B6] not-italic">GLOBAL</span>
                                </motion.h1>
                                
                                <button 
                                    onClick={() => setStep('ZOOMING_EARTH')}
                                    className="pointer-events-auto group relative px-24 py-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-full transition-all hover:border-cyan-500/50 hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(6,182,212,0.15)]"
                                >
                                    <span className="text-white font-black uppercase tracking-[1em] text-sm group-hover:text-cyan-400 transition-colors">
                                        Initiate Descent
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {(step !== 'WIDE' && step !== 'LANDED') && (
                        <motion.div 
                            key="admission-pill"
                            initial={{ opacity: 0, y: -20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-10 w-full flex justify-center"
                        >
                            <div className="bg-black/60 backdrop-blur-2xl border border-white/20 px-10 py-4 rounded-full flex items-center gap-5 shadow-2xl">
                                <span className="w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-[0_0_15px_#a3e635]"></span>
                                <span className="text-[12px] font-black text-white uppercase tracking-[0.5em]">Admissions Open 2024-25</span>
                            </div>
                        </motion.div>
                    )}

                    {step === 'FOCUSING_INDIA' && (
                        <motion.div 
                            key="focus-india-content"
                            initial={{ opacity: 0, y: 50 }} 
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-20 w-full flex flex-col items-center gap-8 px-6"
                        >
                            <div className="text-center max-w-3xl bg-black/50 backdrop-blur-3xl p-14 rounded-[4rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                                <h2 className="text-6xl md:text-7xl font-black text-white mb-8 italic tracking-tighter uppercase leading-none">
                                    Precision <br/> <span className="text-cyan-400 not-italic">Engineering.</span>
                                </h2>
                                <p className="text-slate-400 font-medium tracking-wide mb-12 max-w-lg mx-auto text-lg">
                                    The next localized node for Industry 4.0 at the NIAT Global Hub.
                                </p>
                                <button 
                                    onClick={() => setStep('DEEP_DIVE')}
                                    className="pointer-events-auto bg-white text-black px-24 py-8 rounded-3xl font-black text-[14px] uppercase tracking-[1em] shadow-2xl transition-all hover:bg-cyan-400 hover:scale-105 active:scale-95"
                                >
                                    Access Node
                                </button>
                                <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-center gap-3">
                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">Integrated Engine powered by</span>
                                    <span className="text-[14px] font-black text-white uppercase tracking-widest italic">NxtWave</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SolarSystem;
