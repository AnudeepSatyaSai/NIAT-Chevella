
import React, { useState, useRef, Suspense, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { CameraControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import Planet from './Planet';
import CesiumEarth from './CesiumEarth';

export function latLongToVector3(lat: number, lon: number, radius: number, offset: THREE.Vector3 = new THREE.Vector3(0,0,0)) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  ).add(offset);
}

const EARTH_RADIUS = 4;
const EARTH_POS = new THREE.Vector3(85, 0, 0);
const CHEVELLA_COORDS = { lat: 17.3065, lon: 78.1946 };

const PLANET_DATA = [
  { name: "Mercury", size: 0.7, distance: 18, speed: 4.0, color: "#A57C1B", texture: "https://upload.wikimedia.org/wikipedia/commons/3/30/Mercury_in_color_-_Prockter07_centered.jpg" },
  { name: "Venus", size: 1.2, distance: 28, speed: 3.0, color: "#E3BB76", texture: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg" },
  { name: "Earth", size: EARTH_RADIUS, distance: EARTH_POS.x, speed: 0, color: "#22A6B3", texture: "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg" },
  { name: "Mars", size: 0.9, distance: 110, speed: 2.0, color: "#EB4D4B", texture: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg" },
  { name: "Jupiter", size: 7.0, distance: 150, speed: 1.2, color: "#F0932B", texture: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg" },
  { name: "Saturn", size: 6.0, distance: 190, speed: 0.9, color: "#F5C46F", hasRings: true, texture: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg" },
];

const Sun = () => (
  <group position={[-220, 90, -180]}>
    <mesh>
      <sphereGeometry args={[15, 64, 64]} />
      <meshStandardMaterial emissive="#ffffff" emissiveIntensity={8} color="#000" toneMapped={false} />
    </mesh>
    <directionalLight intensity={5} color="#ffffff" castShadow position={[1, 0.5, 1]} />
    <Sparkles count={100} scale={60} size={20} speed={0.2} color="#ffffff" />
  </group>
);

const CinematicSequence = ({ step, setStep, cameraControls, onFinish }: any) => {
  const { camera } = useThree();
  const chevellaVector = useMemo(() => latLongToVector3(CHEVELLA_COORDS.lat, CHEVELLA_COORDS.lon, EARTH_RADIUS, EARTH_POS), []);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(140, 45, 320),
    new THREE.Vector3(110, 30, 150),
    new THREE.Vector3(95, 12, 60),
    chevellaVector.clone().add(new THREE.Vector3(5, 2, 8))
  ]), [chevellaVector]);

  useEffect(() => {
    if (!cameraControls.current) return;
    if (step === 'WIDE') cameraControls.current.setLookAt(140, 45, 320, EARTH_POS.x, 0, 0, false);
    if (step === 'ZOOMING_EARTH') {
      const tl = gsap.timeline({ onComplete: () => setStep('FOCUSING_INDIA') });
      const proxy = { t: 0 };
      tl.to(proxy, { t: 0.75, duration: 8, ease: "power2.inOut", onUpdate: () => {
        camera.position.copy(curve.getPoint(proxy.t));
        cameraControls.current?.setTarget(EARTH_POS.x, 0, 0, false);
      }});
    }
    if (step === 'DEEP_DIVE') {
      const targetPos = chevellaVector.clone().add(new THREE.Vector3().subVectors(chevellaVector, EARTH_POS).normalize().multiplyScalar(1.2));
      gsap.to(camera.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 4, ease: "power2.in", onUpdate: () => {
        cameraControls.current?.setTarget(chevellaVector.x, chevellaVector.y, chevellaVector.z, false);
      }, onComplete: () => {
        setStep('LANDED');
        onFinish();
      }});
    }
  }, [step, cameraControls, setStep, onFinish, camera, chevellaVector, curve]);
  return null;
};

const Content = ({ step, setStep, onLand, cameraControlRef }: any) => {
  return (
    <>
      <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade speed={1} />
      <Sun />
      {PLANET_DATA.map((planet) => (
        <React.Fragment key={planet.name}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.distance - 0.1, planet.distance + 0.1, 128]} />
            <meshBasicMaterial color="#ffffff" opacity={0.05} transparent side={THREE.DoubleSide} />
          </mesh>
          <Planet 
            data={planet} 
            active={step !== 'WIDE' && planet.name === 'Earth'} 
            isIntroStep={step}
          />
        </React.Fragment>
      ))}
      <CinematicSequence step={step} setStep={setStep} cameraControls={cameraControlRef} onFinish={onLand} />
    </>
  );
};

const SolarSystem = ({ onLand }: { onLand?: () => void }) => {
  const [step, setStep] = useState('WIDE'); 
  const cameraControlRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      <div className={`w-full h-full absolute inset-0 transition-opacity duration-1000 ${step === 'LANDED' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Canvas 
          shadows 
          camera={{ position: [140, 45, 320], fov: 24 }} 
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#000']} />
          <ambientLight intensity={0.5} />
          <EffectComposer>
            <Bloom luminanceThreshold={1} intensity={1.2} radius={0.3} />
            <Vignette offset={0.1} darkness={1} />
          </EffectComposer>
          <Suspense fallback={null}>
            <Content step={step} setStep={setStep} onLand={onLand} cameraControlRef={cameraControlRef} />
          </Suspense>
          <CameraControls ref={cameraControlRef} enabled={step === 'WIDE'} makeDefault />
        </Canvas>
      </div>

      <AnimatePresence>
        {step === 'LANDED' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 w-full h-full">
             <CesiumEarth />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-end pb-32">
        <AnimatePresence>
          {step === 'WIDE' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
              <h1 className="text-8xl md:text-[12rem] font-black text-white italic uppercase tracking-tighter leading-none mb-12">NIAT <span className="text-cyan-400 not-italic">INDIA</span></h1>
              <button onClick={() => setStep('ZOOMING_EARTH')} className="pointer-events-auto bg-white text-black px-16 py-6 rounded-full font-black text-lg uppercase tracking-widest hover:scale-110 transition-transform shadow-2xl">
                Initialize Descent
              </button>
            </motion.div>
          )}
          {step === 'FOCUSING_INDIA' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center bg-black/60 backdrop-blur-xl p-16 rounded-[4rem] border border-white/10">
              <h2 className="text-6xl md:text-8xl font-black text-white mb-8 italic uppercase">Strategic <span className="text-cyan-400">Intelligence.</span></h2>
              <button onClick={() => setStep('DEEP_DIVE')} className="pointer-events-auto bg-white text-black px-16 py-6 rounded-full font-black text-lg uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl">
                Enter Atmosphere
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SolarSystem;
