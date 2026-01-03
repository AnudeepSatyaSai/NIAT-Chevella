
import React, { useEffect, useRef, useState } from "react";
import { Viewer, Entity, PointGraphics, ImageryLayer } from "resium";
import * as Cesium from "cesium";
import { 
    Cartesian3, 
    Ion, 
    Math as CesiumMath, 
    createWorldTerrainAsync,
    Color,
    IonImageryProvider
} from "cesium";

const CHEVELLA = { lat: 17.3065, lon: 78.1946 };

const CesiumEarth: React.FC = () => {
    const viewerRef = useRef<any>(null);
    const [terrainProvider, setTerrainProvider] = useState<any>(undefined);

    useEffect(() => {
        createWorldTerrainAsync().then(setTerrainProvider).catch(() => console.warn("Terrain failed"));

        const startDescent = async () => {
            if (!viewerRef.current?.cesiumElement) return;
            const viewer = viewerRef.current.cesiumElement;

            viewer.camera.setView({
                destination: Cartesian3.fromDegrees(CHEVELLA.lon, CHEVELLA.lat, 8000000)
            });

            await new Promise(r => setTimeout(r, 1000));
            
            viewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(CHEVELLA.lon, CHEVELLA.lat, 150000), 
                duration: 4
            });

            await new Promise(r => setTimeout(r, 4500));

            viewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(CHEVELLA.lon, CHEVELLA.lat, 1200), 
                duration: 5,
                orientation: {
                    pitch: CesiumMath.toRadians(-45),
                    heading: 0
                }
            });
        };

        startDescent();
    }, []);

    return (
        <div className="w-full h-full bg-black">
            <Viewer
                ref={viewerRef}
                full
                terrainProvider={terrainProvider}
                timeline={false}
                animation={false}
                baseLayerPicker={false}
                geocoder={false}
                sceneModePicker={false}
                navigationHelpButton={false}
                homeButton={false}
                infoBox={false}
                selectionIndicator={false}
            >
                <Entity position={Cartesian3.fromDegrees(CHEVELLA.lon, CHEVELLA.lat, 0)}>
                    <PointGraphics pixelSize={15} color={Color.CYAN} outlineColor={Color.WHITE} outlineWidth={2} />
                </Entity>
            </Viewer>

            <div className="absolute top-12 left-12 z-50 pointer-events-none">
                <div className="bg-black/70 backdrop-blur-2xl p-8 rounded-3xl border border-cyan-500/30 font-mono">
                    <p className="text-xs text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Live Telemetry
                    </p>
                    <h3 className="text-2xl font-bold text-white mb-4">SECTOR: TELANGANA_01</h3>
                    <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-4">
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase block">Status</span>
                            <span className="text-sm text-lime-400">DESCENT_ACTIVE</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase block">Grid</span>
                            <span className="text-sm text-white">17.3N / 78.1E</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CesiumEarth;
