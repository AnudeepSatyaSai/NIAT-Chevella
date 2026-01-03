
import React, { Suspense, useState } from 'react';
import { METRICS, WHY_NIAT_FEATURES, NAV_LINKS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader, StatCard } from './Shared';

const SolarSystem = React.lazy(() => import('./SolarSystem'));

const PublicWebsite: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
    const [isLanded, setIsLanded] = useState(false);

    return (
        <div className="bg-black text-slate-300 font-inter overflow-x-hidden selection:bg-cyan-500/30 min-h-screen">
            <style>{`html { scroll-behavior: smooth; }`}</style>
            
            <div className="fixed inset-0 z-0 bg-black">
                <Suspense fallback={
                    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center">
                        <div className="w-24 h-24 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
                        <p className="mt-8 text-cyan-400 font-mono text-[11px] uppercase tracking-[1.8em] animate-pulse">Synchronizing Node...</p>
                    </div>
                }>
                    <SolarSystem onLand={() => setIsLanded(true)} />
                </Suspense>
            </div>

            <AnimatePresence>
                {isLanded && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        // Fix: Changed 'expo.out' to 'easeOut' as 'expo.out' is not a valid framer-motion easing string
                        transition={{ duration: 2.2, ease: "easeOut" }}
                        className="relative z-10"
                    >
                        {/* High-End Glassmorphism Navbar */}
                        <header className="fixed top-0 left-0 right-0 z-50 py-10 px-8 md:px-16">
                            <nav className="max-w-7xl mx-auto flex justify-between items-center bg-black/30 backdrop-blur-3xl border border-white/10 p-7 rounded-[3.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
                                <div className="flex items-center gap-10">
                                    <div className="w-20 h-20 bg-white flex items-center justify-center rounded-[1.5rem] shadow-2xl transition-transform hover:scale-110">
                                        <span className="text-6xl font-black text-black italic">N</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-black text-white italic tracking-tighter leading-none">NIAT <span className="text-cyan-400 uppercase not-italic">INDIA</span></span>
                                        <span className="text-[12px] text-slate-500 uppercase tracking-[0.6em] font-black mt-3">Global Hub • Chevella</span>
                                    </div>
                                </div>
                                
                                <div className="hidden lg:flex gap-16">
                                    {NAV_LINKS.map(link => (
                                        <a key={link.name} href={link.href} className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-cyan-400 transition-colors">
                                            {link.name}
                                        </a>
                                    ))}
                                </div>

                                <div className="flex gap-6">
                                    <button onClick={onLoginClick} className="hidden xl:block text-white bg-white/5 backdrop-blur-md border border-white/10 px-12 py-5 rounded-3xl font-black text-[12px] uppercase tracking-widest hover:border-cyan-400 transition-all">
                                        Student Access
                                    </button>
                                    <button onClick={onLoginClick} className="bg-white text-black px-12 py-5 rounded-3xl font-black text-[12px] uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-2xl shadow-white/5">
                                        Secure Portal
                                    </button>
                                </div>
                            </nav>
                        </header>

                        <main>
                            {/* Refined Engine Hero */}
                            <section className="h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
                                <motion.div 
                                    initial={{ y: 100, opacity: 0 }} 
                                    animate={{ y: 0, opacity: 1 }} 
                                    // Fix: Changed 'expo.out' to 'easeOut' as 'expo.out' is not a valid framer-motion easing string
                                    transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }} 
                                    className="text-center relative z-10"
                                >
                                    <h2 className="text-8xl md:text-[12rem] font-black text-white mb-12 italic tracking-tighter uppercase leading-[0.75]">
                                        Ultra <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 not-italic">Intelligence.</span>
                                    </h2>
                                    <p className="text-3xl md:text-5xl text-slate-400 font-medium mb-28 tracking-wide max-w-5xl mx-auto leading-relaxed">
                                        The decentralized core for Industry 4.0 precision engineering at the heart of Telangana.
                                    </p>

                                    <button 
                                        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="group relative bg-white/5 backdrop-blur-md border border-white/20 text-white px-28 py-14 rounded-full font-black text-[20px] uppercase tracking-[0.7em] hover:border-cyan-500 hover:scale-105 transition-all shadow-2xl"
                                    >
                                        <span className="relative z-10">Scan Ecosystem</span>
                                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </button>
                                </motion.div>
                            </section>

                            {/* Core Node Telemetry */}
                            <section id="about" className="py-96 px-8 bg-gradient-to-b from-transparent via-black to-black">
                                <div className="max-w-7xl mx-auto">
                                    <PageHeader title="Node Telemetry" subtitle="Global performance metrics across the localized NIAT educational node." />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mt-32">
                                        {METRICS.map(metric => (
                                            <StatCard 
                                                key={metric.label} 
                                                title={metric.label} 
                                                value={`${metric.value}${metric.suffix || ''}`}
                                                color="cyan" 
                                                icon={() => <div className="w-14 h-14 border-[5px] border-current rounded-[2rem]"></div>} 
                                            />
                                        ))}
                                    </div>

                                    <div className="mt-72 grid md:grid-cols-3 gap-20">
                                        {WHY_NIAT_FEATURES.map((feature, idx) => (
                                            <motion.div 
                                                key={idx}
                                                whileHover={{ y: -30, borderColor: 'rgba(34, 211, 238, 0.7)' }}
                                                className="group p-28 bg-gray-900/40 backdrop-blur-3xl rounded-[6rem] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.6)] transition-all"
                                            >
                                                <div className="text-[10rem] mb-20 transform group-hover:scale-110 transition-transform duration-1000">{feature.icon}</div>
                                                <h3 className="text-6xl font-black text-white mb-12 uppercase italic tracking-tighter leading-none">{feature.title}</h3>
                                                <p className="text-slate-500 leading-relaxed text-3xl font-medium">{feature.desc}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <footer className="py-80 bg-black border-t border-white/5">
                                <div className="max-w-7xl mx-auto px-8 text-center">
                                    <h2 className="text-7xl font-black text-white italic uppercase tracking-[0.9em] mb-20">NIAT <span className="text-cyan-400 not-italic">INDIA</span></h2>
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-16 mb-24">
                                        <span className="text-[16px] font-mono text-slate-800 uppercase tracking-[2.5em]">Industry 4.0</span>
                                        <div className="w-3 h-3 bg-slate-900 rounded-full hidden md:block"></div>
                                        <span className="text-[16px] font-mono text-slate-800 uppercase tracking-[2.5em]">Next-Gen Edu</span>
                                        <div className="w-3 h-3 bg-slate-900 rounded-full hidden md:block"></div>
                                        <span className="text-[16px] font-mono text-slate-800 uppercase tracking-[2.5em]">Global Hub</span>
                                    </div>
                                    <p className="text-[12px] font-mono text-slate-900 uppercase tracking-[2em]">
                                        © 2024 NIAT Chevella • Local Node V6.1
                                    </p>
                                </div>
                            </footer>
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PublicWebsite;
