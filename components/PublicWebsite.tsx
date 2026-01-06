
import React, { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SolarSystem from './SolarSystem';

const PublicWebsite: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
    const [isLanded, setIsLanded] = useState(false);

    return (
        <div className="relative w-screen h-screen bg-black text-white font-inter overflow-hidden selection:bg-cyan-500/30">
            {/* 3D Background Layer */}
            <Suspense fallback={<div className="w-full h-full bg-black flex items-center justify-center font-mono text-cyan-500">INITIALIZING VISUAL ENGINE...</div>}>
                <SolarSystem isLanded={isLanded} />
            </Suspense>

            {/* UI Overlay Layer */}
            <div className="relative z-10 w-full h-full flex flex-col pointer-events-none">
                {/* Navbar */}
                <header className="w-full fixed top-0 left-0 py-8 px-10 md:px-16 pointer-events-auto z-50">
                    <nav className="max-w-[1800px] mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-lg shadow-2xl">
                                <span className="text-xl font-black text-black italic">N</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black text-white italic tracking-tighter leading-none">NIAT <span className="text-cyan-400 uppercase not-italic">INDIA</span></span>
                                <span className="text-[7px] text-slate-500 uppercase tracking-[0.5em] font-black">Chevella Campus</span>
                            </div>
                        </div>
                        
                        <div className="hidden xl:flex gap-10">
                            {["Home", "About Us", "Programs", "Life at NIAT", "Placements", "Admissions", "Contact"].map(item => (
                                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 hover:text-white transition-all">
                                    {item}
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center gap-8">
                            <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-all border-b border-transparent hover:border-cyan-400/30 pb-1">
                                Student Login
                            </button>
                            <button onClick={onLoginClick} className="bg-white text-black px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-cyan-400 hover:scale-105 transition-all shadow-xl shadow-white/5">
                                Portal Login
                            </button>
                        </div>
                    </nav>
                </header>

                {/* Hero Content */}
                <main className="flex-1 flex flex-col justify-center px-10 md:px-24">
                    <motion.div 
                        initial={{ x: -100, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-4xl pointer-events-auto"
                    >
                        <div className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 px-6 py-2 rounded-full mb-12 backdrop-blur-md">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_cyan]"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Admissions Open 2024–25</span>
                        </div>

                        <h1 className="text-6xl md:text-[8rem] font-black text-white mb-10 italic tracking-tighter uppercase leading-[0.85] drop-shadow-2xl">
                            India's 1st <br/> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 not-italic">Industry 4.0</span> <br/>
                            Institute.
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 font-medium mb-16 tracking-wide max-w-xl leading-relaxed">
                            A global standard institute powered by NxtWave, bridging education with high-growth technology careers.
                        </p>

                        <button 
                            onClick={onLoginClick}
                            className="group relative bg-white text-black px-16 py-6 rounded-full font-black text-[14px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                        >
                            <span className="relative z-10">Enter Home Page</span>
                            <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        </button>
                    </motion.div>
                </main>

                {/* Footer */}
                <footer className="py-12 px-10 md:px-24 bg-black/40 backdrop-blur-xl border-t border-white/5">
                    <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">
                            Powered by NxtWave. Creating Industry-Ready Engineers.
                        </div>
                        <div className="flex gap-12 items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[9px] font-mono text-slate-700 uppercase tracking-[0.2em]">Visual Core V2.4.0 Active</span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-800 uppercase tracking-[0.2em]">© 2024 NIAT INDIA</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default PublicWebsite;
