
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';

// Aliases for JSX intrinsic elements
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const RingGeometry = 'ringGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const ShaderMaterial = 'shaderMaterial' as any;

interface PlanetProps {
    data: {
        name: string;
        distance: number;
        size: number;
        color: string;
        speed: number;
        texture: string;
        rotationPeriod: number;
        hasClouds?: boolean;
        hasRings?: boolean;
        description: string;
    };
    active: boolean;
    activeObject: string | null;
    onSelect: (name: string, position?: THREE.Vector3, size?: number) => void;
    timeSpeed: number;
    cameraControls: React.RefObject<CameraControls>;
    isIntroStep?: string;
    setIntroStep?: (s: string) => void;
}

// Fresnel atmosphere shader for planetary scattering rim glow
const AtmosphereShader = {
    uniforms: {
        glowColor: { value: new THREE.Color('#3b82f6') },
        viewVector: { value: new THREE.Vector3() }
    },
    vertexShader: `
        varying float intensity;
        void main() {
            vec3 vNormal = normalize( normalMatrix * normal );
            vec3 vNormel = normalize( normalMatrix * viewMatrix[2].xyz );
            intensity = pow( 0.8 - dot(vNormal, vNormel), 5.5 );
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4( glow, intensity );
        }
    `
};

const Moon = ({ parentSize, timeSpeed, planetActive }: { parentSize: number, timeSpeed: number, planetActive: boolean }) => {
    const moonRef = useRef<THREE.Mesh>(null);
    const moonOrbitRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (moonOrbitRef.current) {
            moonOrbitRef.current.rotation.y += (0.45 * delta) * timeSpeed;
        }
        if (moonRef.current) {
            moonRef.current.rotation.y += (0.15 * delta) * timeSpeed;
        }
    });

    return (
        <Group ref={moonOrbitRef}>
            <Group position={[parentSize + 10, 0, 0]}>
                <Mesh ref={moonRef} castShadow receiveShadow>
                    <SphereGeometry args={[parentSize * 0.27, 32, 32]} />
                    <MeshStandardMaterial color="#999" roughness={0.9} />
                </Mesh>
                <AnimatePresence>
                    {planetActive && (
                        <Html key="moon-marker" position={[0, 2.2, 0]} center distanceFactor={15}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.7 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-black/70 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-2xl pointer-events-none shadow-2xl"
                            >
                                <span className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.3em]">Luna • V1.0</span>
                            </motion.div>
                        </Html>
                    )}
                </AnimatePresence>
            </Group>
        </Group>
    );
};

const Planet: React.FC<PlanetProps> = ({ data, active, activeObject, onSelect, timeSpeed, cameraControls, isIntroStep, setIntroStep }) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);
    
    const [loadError, setLoadError] = useState(false);
    const [textures, setTextures] = useState<{
        map: THREE.Texture | null,
        roughness: THREE.Texture | null,
        bump: THREE.Texture | null,
        clouds: THREE.Texture | null
    }>({ map: null, roughness: null, bump: null, clouds: null });

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        
        const safeLoad = async (url: string): Promise<THREE.Texture | null> => {
            try {
                return await loader.loadAsync(url);
            } catch (e) { return null; }
        };

        const initTextures = async () => {
            setLoadError(false);
            if (data.name === 'Earth') {
                const [map, clouds, roughness, bump] = await Promise.all([
                    safeLoad('https://upload.wikimedia.org/wikipedia/commons/c/cb/The_Blue_Marble_%28remastered%29.jpg'),
                    safeLoad('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Blue_Marble_cloud_cover_2002.jpg/1024px-Blue_Marble_cloud_cover_2002.jpg'),
                    safeLoad('https://upload.wikimedia.org/wikipedia/commons/5/53/Earth_roughness_map.jpg'),
                    safeLoad('https://upload.wikimedia.org/wikipedia/commons/2/23/Earth_bump_map.jpg')
                ]);
                if (map) map.colorSpace = THREE.SRGBColorSpace;
                if (clouds) clouds.colorSpace = THREE.SRGBColorSpace;
                setTextures({ map, clouds, roughness, bump });
                if (!map) setLoadError(true);
            } else {
                const map = await safeLoad(data.texture);
                if (map) {
                    map.colorSpace = THREE.SRGBColorSpace;
                    setTextures({ map, clouds: null, roughness: null, bump: null });
                } else setLoadError(true);
            }
        };
        initTextures();
    }, [data.texture, data.name]);

    useEffect(() => {
        if (data.name === 'Earth' && isIntroStep === 'FOCUSING_INDIA' && meshRef.current) {
            gsap.to(meshRef.current.rotation, {
                y: Math.PI * 1.54, // Precise alignment for India
                duration: 6,
                ease: "power4.inOut"
            });
        }
    }, [isIntroStep, data.name]);

    useFrame((state, delta) => {
        if (groupRef.current && (isIntroStep === 'WIDE' || !active)) {
            groupRef.current.rotation.y += (data.speed * 0.03 * delta) * timeSpeed;
        }

        if (meshRef.current) {
            const isFocusing = data.name === 'Earth' && (isIntroStep === 'FOCUSING_INDIA' || isIntroStep === 'DEEP_DIVE');
            if (!isFocusing) {
                const baseVelocity = 0.05; 
                const relativeRotationSpeed = 24 / (data.rotationPeriod || 24);
                meshRef.current.rotation.y += (baseVelocity * relativeRotationSpeed * delta) * timeSpeed;
            }
        }

        if (atmosphereRef.current) {
            const material = atmosphereRef.current.material as THREE.ShaderMaterial;
            material.uniforms.viewVector.value.copy(state.camera.position).sub(atmosphereRef.current.position);
        }

        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += 0.03 * delta * timeSpeed;
        }
    });

    return (
        <Group ref={groupRef}>
            {/* Orbital Guide-paths */}
            <Mesh rotation={[Math.PI / 2, 0, 0]}>
                <RingGeometry args={[data.distance - 0.25, data.distance + 0.25, 256]} />
                <MeshBasicMaterial color="white" opacity={0.03} transparent side={THREE.DoubleSide} />
            </Mesh>

            <Group position={[data.distance, 0, 0]}>
                {data.name === 'Earth' && (
                    <AnimatePresence>
                        {(isIntroStep === 'ZOOMING_EARTH' || isIntroStep === 'FOCUSING_INDIA') && (
                            <Html key="earth-main-title" position={[0, data.size + 2.2, 0]} center distanceFactor={18}>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <span className="text-white font-black text-7xl md:text-8xl uppercase tracking-[0.7em] drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] italic">EARTH</span>
                                </motion.div>
                            </Html>
                        )}

                        {(isIntroStep === 'FOCUSING_INDIA' || isIntroStep === 'DEEP_DIVE') && (
                            <Html key="india-sector-card" position={[3.2, 0.8, 4.2]} center distanceFactor={12}>
                                <motion.div 
                                    initial={{ opacity: 0, x: -60 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-black/50 backdrop-blur-3xl border border-white/20 p-12 rounded-[3.5rem] min-w-[380px] shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
                                >
                                    <span className="text-cyan-400 font-black text-[16px] uppercase tracking-[0.5em] block mb-6">OWNERSHIP: NIAT</span>
                                    <h3 className="text-white font-black text-8xl uppercase tracking-tighter mb-10 italic leading-none">INDIA</h3>
                                    <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden mb-8 border border-white/5">
                                        <div className="h-full bg-cyan-500 w-[96%] rounded-full shadow-[0_0_30px_#06b6d4]"></div>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 font-mono text-[12px] uppercase tracking-[0.4em]">
                                        <span>Node Status: ACTIVE</span>
                                        <span>Framework: V6.1</span>
                                    </div>
                                </motion.div>
                            </Html>
                        )}

                        {(isIntroStep === 'FOCUSING_INDIA' || isIntroStep === 'DEEP_DIVE') && (
                            <Html key="chevella-precise-node" position={[1.8, 0.4, 4.5]} center distanceFactor={10}>
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0 }} 
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-start gap-5"
                                >
                                    <div className="w-10 h-10 rounded-full border-[4px] border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                                        <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
                                    </div>
                                    <div className="bg-black/80 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[2rem] shadow-2xl">
                                        <span className="text-white font-black text-[32px] uppercase tracking-[0.5em] block leading-none">CHEVELLA</span>
                                        <span className="text-cyan-400 font-mono text-[12px] uppercase mt-5 block tracking-[0.3em] opacity-90">17.3117° N • 78.1356° E</span>
                                    </div>
                                </motion.div>
                            </Html>
                        )}
                    </AnimatePresence>
                )}

                {data.hasRings && (
                    <Mesh rotation={[Math.PI / 2.6, 0, 0]}>
                        <RingGeometry args={[data.size * 1.5, data.size * 2.5, 128]} />
                        <MeshStandardMaterial color="white" transparent opacity={0.35} side={THREE.DoubleSide} />
                    </Mesh>
                )}

                {data.name === 'Earth' && <Moon parentSize={data.size} timeSpeed={timeSpeed} planetActive={active} />}

                {/* Main Planet Core Mesh */}
                <Mesh ref={meshRef} castShadow receiveShadow>
                    <SphereGeometry args={[data.size, 64, 64]} />
                    <MeshStandardMaterial 
                        map={textures.map} 
                        roughnessMap={textures.roughness}
                        bumpMap={textures.bump}
                        bumpScale={0.1}
                        color={loadError || !textures.map ? (data.name === 'Earth' ? '#1e3a8a' : data.color) : 'white'}
                        roughness={0.9}
                    />
                </Mesh>

                {/* Atmospheric Cloud Shell */}
                {data.hasClouds && textures.clouds && (
                    <Mesh ref={cloudsRef}>
                        <SphereGeometry args={[data.size + 0.08, 64, 64]} />
                        <MeshStandardMaterial map={textures.clouds} transparent opacity={0.45} />
                    </Mesh>
                )}

                {/* Rayleigh Curvature Shader Rim */}
                <Mesh ref={atmosphereRef}>
                    <SphereGeometry args={[data.size * 1.2, 64, 64]} />
                    <ShaderMaterial
                        uniforms={THREE.UniformsUtils.clone(AtmosphereShader.uniforms)}
                        vertexShader={AtmosphereShader.vertexShader}
                        fragmentShader={AtmosphereShader.fragmentShader}
                        transparent
                        side={THREE.BackSide}
                        blending={THREE.AdditiveBlending}
                    />
                </Mesh>
            </Group>
        </Group>
    );
};

export default Planet;
