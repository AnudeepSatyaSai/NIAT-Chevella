
import React from 'react';
import { motion } from 'framer-motion';
import { renderSafe } from '../Shared';

const Learning = () => {
    // Mock data representing CCBP progress
    const modules = [
        { title: "IRC 4.0 (Industry Ready Certification)", progress: 75, status: "In Progress" },
        { title: "Full Stack Development (MERN)", progress: 40, status: "In Progress" },
        { title: "Python Fundamentals", progress: 100, status: "Completed" },
        { title: "Data Structures & Algorithms", progress: 90, status: "Completed" }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-xl border border-cyan-500/30 relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">NxtWave <span className="text-cyan-400">CCBP 4.0</span> Academy</h2>
                    <p className="text-slate-300 mb-8 max-w-2xl text-lg">
                        Track your continuous learning progress, access coding practice sets, and view your mastery scores directly from the CCBP platform.
                    </p>
                    <a 
                        href="https://learning.ccbp.in/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-lg shadow-lg shadow-cyan-500/20 transition-transform transform hover:scale-105"
                    >
                        Launch Learning Portal
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                </div>
                
                {/* Decorative Background Elements */}
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
                     <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#22d3ee" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.2C93.5,8.8,82,21.9,71,33.6C60,45.4,49.5,55.8,37.4,64.1C25.3,72.4,11.6,78.6,-1.3,80.9C-14.2,83.1,-27.1,81.4,-38.4,74.5C-49.7,67.6,-59.3,55.5,-67.3,42.1C-75.3,28.7,-81.7,14,-80.9,-0.5C-80.1,-15,-72.1,-29.3,-62.6,-41.2C-53.1,-53.1,-42.1,-62.6,-30.2,-71.1C-18.3,-79.6,-5.5,-87.1,5.8,-97.1L17.1,-107.1" transform="translate(100 100)" />
                    </svg>
                </div>
            </div>

            {/* Progress Stats */}
            <div>
                <h3 className="text-2xl font-bold text-white mb-6">Your Learning Path</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {modules.map((mod, index) => (
                        <motion.div 
                            key={mod.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-white text-lg">{renderSafe(mod.title)}</h4>
                                    <p className={`text-xs font-semibold mt-1 ${mod.status === 'Completed' ? 'text-lime-400' : 'text-yellow-400'}`}>
                                        {renderSafe(mod.status)}
                                    </p>
                                </div>
                                <span className="text-2xl font-bold text-cyan-400">{renderSafe(mod.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${mod.status === 'Completed' ? 'bg-lime-500' : 'bg-cyan-500'}`} 
                                    style={{ width: `${mod.progress}%` }}
                                ></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

export default Learning;
