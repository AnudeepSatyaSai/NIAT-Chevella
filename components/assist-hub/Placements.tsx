
import React, { useState } from 'react';
import { UserRole, PlacementStatus, PlacementDrive } from '../../types';
import { usePortalData } from '../../hooks/usePortalData';
import { motion } from 'framer-motion';
import { Skeleton, renderSafe } from '../Shared';

const statusColorMap: Record<PlacementStatus, string> = {
    [PlacementStatus.Open]: 'bg-lime-500/20 text-lime-300',
    [PlacementStatus.Applied]: 'bg-blue-500/20 text-blue-300',
    [PlacementStatus.Shortlisted]: 'bg-cyan-500/20 text-cyan-300',
    [PlacementStatus.Interview]: 'bg-yellow-500/20 text-yellow-300',
    [PlacementStatus.Offered]: 'bg-green-500/20 text-green-300',
    [PlacementStatus.Closed]: 'bg-gray-500/20 text-gray-300',
};

const PlacementCard: React.FC<{ drive: PlacementDrive }> = ({ drive }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex items-center justify-between hover:border-cyan-500/50 transition-colors"
        >
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img src={drive.companyLogo} alt={`${drive.company} logo`} className="h-12 w-12 object-contain bg-white rounded-full p-1" />
                    <div className="absolute -bottom-1 -right-1 bg-cyan-900 rounded-full p-0.5 border border-gray-600">
                        <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{renderSafe(drive.company)}</h3>
                    <p className="text-slate-300">{renderSafe(drive.role)}</p>
                    <p className="text-sm text-cyan-400 font-semibold">{renderSafe(drive.ctc)}</p>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColorMap[drive.status]}`}>
                    {renderSafe(drive.status)}
                </span>
                {drive.status === PlacementStatus.Open ? (
                    <a 
                        href="https://learning.ccbp.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block w-full bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold py-1 px-4 rounded-lg text-center"
                    >
                        Apply on Portal
                    </a>
                ) : (
                     <a 
                        href="https://learning.ccbp.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block text-sm text-slate-400 hover:text-white hover:underline"
                    >
                        View Status
                    </a>
                )}
            </div>
        </motion.div>
    );
};


const Placements: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
    const [activeTab, setActiveTab] = useState('drives');
    const { data: allDrives, isLoading, lastSynced, refresh } = usePortalData<PlacementDrive[]>('placements');

    const openDrives = allDrives?.filter(p => p.status === PlacementStatus.Open) || [];
    const appliedDrives = allDrives?.filter(p => p.status !== PlacementStatus.Open) || [];

    const renderContent = () => {
        if (isLoading && !allDrives) {
             return (
                <div className="space-y-4">
                     {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
                </div>
            );
        }

        switch (activeTab) {
            case 'drives':
                return (
                    <div className="space-y-4">
                        {openDrives.length > 0 ? (
                            openDrives.map(drive => <PlacementCard key={drive.id} drive={drive} />)
                        ) : (
                            <div className="py-20 bg-gray-800/20 rounded-2xl border border-dashed border-gray-700 flex flex-col items-center justify-center text-center px-4">
                                <div className="p-4 bg-gray-800 rounded-full mb-4">
                                    <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">No Open Drives</h3>
                                <p className="text-slate-500 text-sm max-w-sm">There are no new placement opportunities available right now. Keep your portfolio updated in the meantime.</p>
                            </div>
                        )}
                    </div>
                );
            case 'applications':
                 return (
                    <div className="space-y-4">
                        {appliedDrives.length > 0 ? (
                            appliedDrives.map(drive => <PlacementCard key={drive.id} drive={drive} />)
                        ) : (
                            <div className="py-20 bg-gray-800/20 rounded-2xl border border-dashed border-gray-700 flex flex-col items-center justify-center text-center px-4">
                                <h3 className="text-xl font-bold text-white mb-1">No Active Applications</h3>
                                <p className="text-slate-500 text-sm max-w-sm">You haven't applied to any drives yet. Your career journey starts by taking the first step!</p>
                            </div>
                        )}
                    </div>
                );
            case 'resources':
                return (
                    <div className="bg-gray-800 p-6 rounded-lg text-center text-slate-400 border border-gray-700 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-xl text-white font-bold mb-4 relative z-10">Preparation Resources</h3>
                        <p className="mb-6 relative z-10">Access exclusive resume templates, mock interview bots, and company-specific cheatsheets on the main portal.</p>
                        <a href="https://learning.ccbp.in/" target="_blank" rel="noopener noreferrer" className="relative z-10 bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-full font-bold shadow-lg shadow-cyan-500/20 transition-all inline-block">
                            Go to Learning Portal
                        </a>
                    </div>
                );
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                 <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('drives')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'drives' ? 'bg-cyan-500 text-black' : 'text-slate-300'}`}>Open Drives</button>
                    <button onClick={() => setActiveTab('applications')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'applications' ? 'bg-cyan-500 text-black' : 'text-slate-300'}`}>My Applications</button>
                    <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'resources' ? 'bg-cyan-500 text-black' : 'text-slate-300'}`}>Resources</button>
                </div>
                
                <div className="flex items-center space-x-3 text-right">
                    {lastSynced && (
                        <div className="text-xs text-slate-500 hidden md:block">
                            <p>Connected to Placement Cell</p>
                            <p>Last synced: {renderSafe(lastSynced.toLocaleTimeString())}</p>
                        </div>
                    )}
                    <button onClick={refresh} className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-slate-300">
                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default Placements;
