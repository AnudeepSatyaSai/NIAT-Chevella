
import React, { useState } from 'react';
import { UserRole, Announcement, User } from '../../types';
import { usePortalData } from '../../hooks/usePortalData';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '../../constants';
import { db } from '../../services/database';
import { renderSafe } from '../Shared';

const AnnouncementCard: React.FC<{ announcement: Announcement }> = ({ announcement }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gray-800 p-6 rounded-lg border border-gray-700 relative overflow-hidden group"
        >
             <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                <svg className="w-24 h-24 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
             </div>

            <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className="text-xl font-bold text-white">{renderSafe(announcement.title)}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${announcement.isNiatNews ? 'bg-cyan-500/20 text-cyan-300' : 'bg-lime-500/20 text-lime-300'}`}>
                    {announcement.isNiatNews ? 'NIAT News' : 'Tech News'}
                </span>
            </div>
            <p className="text-slate-400 mb-4 relative z-10">{renderSafe(announcement.content)}</p>
            <div className="flex justify-between items-center border-t border-gray-700 pt-4 mt-4 relative z-10">
                <span className="text-xs text-cyan-500 font-mono bg-cyan-900/20 px-2 py-1 rounded">Source: Learning Portal</span>
                <p className="text-xs text-slate-500">{renderSafe(announcement.date)}</p>
            </div>
        </motion.div>
    );
};

const Announcements: React.FC<{ user: User }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'niat' | 'tech'>('all');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: announcements, isLoading, lastSynced, isLive, refresh } = usePortalData<Announcement[]>('announcements');

    // Admin form state
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('niat');

    const filteredAnnouncements = announcements?.filter(ann => {
        if (activeTab === 'niat') return ann.isNiatNews;
        if (activeTab === 'tech') return !ann.isNiatNews;
        return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await db.createAnnouncement({
                title: newTitle,
                content: newContent,
                isNiatNews: newCategory === 'niat'
            }, user);
            setIsPostModalOpen(false);
            setNewTitle('');
            setNewContent('');
            refresh(); 
        } catch (error) {
            console.error("Failed to post announcement", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'all' ? 'bg-cyan-500 text-black' : 'text-slate-300'}`}>All</button>
                    <button onClick={() => setActiveTab('niat')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'niat' ? 'bg-cyan-500 text-black' : 'text-slate-300'}`}>NIAT News</button>
                    <button onClick={() => setActiveTab('tech')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'tech' ? 'bg-cyan-500 text-black' : 'text-slate-300'}`}>Tech News</button>
                </div>
                
                <div className="flex items-center space-x-4">
                    {isLive ? (
                         <span className="flex items-center text-xs text-green-400">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                            Live
                        </span>
                    ) : (
                        <span className="flex items-center text-xs text-amber-400">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>
                            Cached
                        </span>
                    )}
                    {lastSynced && <span className="text-xs text-slate-500 hidden md:inline">Updated: {renderSafe(lastSynced.toLocaleTimeString())}</span>}
                    <button onClick={refresh} className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors text-slate-300">
                         <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                    {user.role === UserRole.Admin && (
                        <button 
                            onClick={() => setIsPostModalOpen(true)}
                            className="bg-lime-500 hover:bg-lime-400 text-black font-bold py-2 px-4 rounded-lg shadow-lg shadow-lime-500/20"
                        >
                            Post New Announcement
                        </button>
                    )}
                </div>
            </div>

            {isLoading && !announcements ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 h-48 animate-pulse">
                            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-5/6 mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAnnouncements.length > 0 ? (
                        filteredAnnouncements.map(announcement => (
                            <AnnouncementCard key={announcement.id} announcement={announcement} />
                        ))
                    ) : (
                        <div className="col-span-2 py-20 bg-gray-800/30 rounded-xl border border-dashed border-gray-700 flex flex-col items-center justify-center text-center px-4">
                            <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            <h3 className="text-xl font-bold text-white mb-1">No Announcements Found</h3>
                            <p className="text-slate-500 text-sm max-w-sm">There aren't any bulletins to show in this category right now. Check back soon for fresh news from NIAT.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Post Announcement Modal */}
            <AnimatePresence>
                {isPostModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative"
                        >
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(to right, cyan 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            
                            <div className="p-6 relative z-10">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">Post Announcement</h3>
                                    <button onClick={() => setIsPostModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
                                </div>

                                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Title</label>
                                        <input 
                                            required 
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                            placeholder="Enter announcement title..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Category</label>
                                        <div className="flex gap-2">
                                            {['niat', 'tech'].map(cat => (
                                                <button 
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setNewCategory(cat)}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${newCategory === cat ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-gray-800 text-slate-400 border-gray-700 hover:border-slate-500'}`}
                                                >
                                                    {cat} News
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Content</label>
                                        <textarea 
                                            required 
                                            rows={5}
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                                            placeholder="Provide detailed information..."
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-cyan-500 to-lime-500 hover:from-cyan-400 hover:to-lime-400 text-black font-black py-4 rounded-xl shadow-xl shadow-cyan-500/20 uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Transmitting...' : 'Broadcast Now'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Announcements;
