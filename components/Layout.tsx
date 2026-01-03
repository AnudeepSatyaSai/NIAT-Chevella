
import React, { useState, useEffect, useRef } from 'react';
import { User, AppNotification, UserRole } from '../types';
import { getNavLinks, Bell, Search, LogOut, Menu, X, Shield, Book, UserCircle } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/database';
import { Badge, renderSafe } from './Shared';

interface LayoutProps {
    user: User;
    activeView: string;
    setActiveView: (view: string) => void;
    onLogout: () => void;
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, activeView, setActiveView, onLogout, children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const navLinks = getNavLinks(user.role);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Fetch Notifications
    useEffect(() => {
        const fetchNotes = async () => {
            const data = await db.getNotifications(user.id);
            setNotifications(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        };
        fetchNotes();
        const interval = setInterval(fetchNotes, 30000);
        return () => clearInterval(interval);
    }, [user.id]);

    const handleNavClick = (viewId: string) => {
        setActiveView(viewId);
        setIsMobileMenuOpen(false);
    };

    const handleMarkAsRead = async (id: string) => {
        await db.markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getRoleConfig = (role: UserRole) => {
        switch(role) {
            case UserRole.Admin: return { color: 'purple', icon: Shield, glow: 'shadow-[0_0_8px_rgba(168,85,247,0.5)]' };
            case UserRole.Faculty: return { color: 'green', icon: Book, glow: 'shadow-[0_0_8px_rgba(132,204,22,0.5)]' };
            case UserRole.Student: return { color: 'blue', icon: UserCircle, glow: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' };
            default: return { color: 'gray', icon: UserCircle, glow: '' };
        }
    };

    const roleConfig = getRoleConfig(user.role);

    return (
        <div className="min-h-screen bg-gray-900 flex text-slate-200">
            {/* --- Sidebar (Desktop) --- */}
            <aside className="hidden lg:sticky lg:top-0 lg:h-screen lg:z-50 lg:flex lg:w-72 lg:flex-col border-r border-gray-800 bg-black/50 backdrop-blur-xl">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-800">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20">N</div>
                        <span className="text-lg font-bold text-white tracking-tight uppercase italic">NIAT <span className="text-cyan-500">Portal</span></span>
                    </div>
                    <nav className="flex flex-1 flex-col" aria-label="Sidebar Navigation">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navLinks.map((link) => {
                                        const isActive = activeView === link.id;
                                        return (
                                            <li key={link.id}>
                                                <button
                                                    onClick={() => handleNavClick(link.id)}
                                                    aria-current={isActive ? 'page' : undefined}
                                                    className={`group flex gap-x-3 rounded-xl p-2 text-sm leading-6 font-bold w-full text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 relative ${
                                                        isActive
                                                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                                                            : 'text-slate-500 hover:text-white hover:bg-gray-800/50 border border-transparent'
                                                    }`}
                                                >
                                                    {isActive && (
                                                        <motion.div 
                                                            layoutId="sidebar-active-indicator"
                                                            className="absolute left-0 top-1 bottom-1 w-1 bg-cyan-500 rounded-r-full" 
                                                        />
                                                    )}
                                                    <link.icon
                                                        className={`h-6 w-6 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-white'}`}
                                                        aria-hidden="true"
                                                    />
                                                    {renderSafe(link.name)}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                            
                            <li className="mt-auto">
                                <div className="border-t border-gray-800 pt-4 mt-4">
                                     <button onClick={() => handleNavClick('profile')} className="w-full flex items-center gap-x-4 px-2 py-3 rounded-xl hover:bg-gray-800/50 cursor-pointer transition-all text-left group">
                                        <div className="relative">
                                            <img className="h-10 w-10 rounded-full bg-gray-800 ring-2 ring-gray-700 group-hover:ring-cyan-500 transition-all object-cover" src={user.avatarUrl} alt="" />
                                            <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full border border-gray-900 bg-gray-900 shadow-xl`}>
                                                <roleConfig.icon className={`w-3.5 h-3.5 text-${roleConfig.color}-400 ${roleConfig.glow}`} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col truncate">
                                            <div className="flex items-center gap-1.5">
                                                <span aria-hidden="true" className="font-black text-white group-hover:text-cyan-400 transition-colors text-sm">{renderSafe(user.name)}</span>
                                            </div>
                                            <div className="mt-0.5">
                                                <Badge color={roleConfig.color as any}>{renderSafe(user.role)}</Badge>
                                            </div>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={onLogout}
                                        className="mt-2 w-full flex items-center gap-x-3 rounded-xl p-2 text-xs font-black uppercase tracking-[0.15em] text-slate-500 hover:bg-red-900/10 hover:text-red-400 transition-all border border-transparent focus:outline-none"
                                        aria-label="Sign Out"
                                    >
                                        <LogOut className="h-5 w-5 shrink-0" />
                                        Sign Out
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* --- Mobile Header --- */}
            <div className="lg:hidden sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900/90 backdrop-blur-md px-4 py-4 shadow-sm sm:px-6 border-b border-gray-800 w-full">
                <button type="button" className="-m-2.5 p-2.5 text-slate-300 hover:text-white lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex-1 flex flex-col">
                    <span className="text-sm font-bold leading-none text-white">NIAT Portal</span>
                    <span className="text-[10px] text-cyan-400 font-mono mt-1">{renderSafe(user.role.toUpperCase())} ACCESS</span>
                </div>
                <button onClick={() => handleNavClick('profile')} className="flex items-center gap-x-4">
                    <span className="sr-only">Your profile</span>
                    <img className="h-8 w-8 rounded-full bg-gray-800" src={user.avatarUrl} alt="" />
                </button>
            </div>

            {/* --- Mobile Menu --- */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-gray-900 border-r border-gray-800 px-6 pb-4 shadow-2xl"
                        >
                            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 mb-6">
                                <div className="flex items-center gap-2">
                                     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-black font-bold">N</div>
                                     <span className="font-bold text-white uppercase italic">NIAT Portal</span>
                                </div>
                                <button type="button" className="-m-2.5 p-2.5 text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="sr-only">Close menu</span>
                                    <X className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                            <nav className="flex flex-1 flex-col">
                                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                    <li>
                                        <ul role="list" className="-mx-2 space-y-1">
                                            {navLinks.map((link) => (
                                                <li key={link.id}>
                                                    <button
                                                        onClick={() => handleNavClick(link.id)}
                                                        className={`group flex gap-x-3 rounded-xl p-3 text-sm font-bold w-full text-left transition-all ${
                                                            activeView === link.id
                                                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                                                : 'text-slate-400 hover:text-white hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        <link.icon className={`h-6 w-6 shrink-0 ${activeView === link.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                                                        {renderSafe(link.name)}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                     <li className="mt-auto border-t border-gray-800 pt-4">
                                        <button onClick={onLogout} className="group -mx-2 flex gap-x-3 rounded-xl p-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-red-900/10 hover:text-red-400 w-full transition-all">
                                            <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                                            Log out
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- Main Content --- */}
            <main className="w-full flex-1 min-w-0 bg-gray-900">
                {/* Header (Desktop) */}
                <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <form className="relative flex flex-1" action="#" method="GET" onSubmit={e => e.preventDefault()}>
                            <label htmlFor="search-field" className="sr-only">Search</label>
                            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-500" aria-hidden="true" />
                            <input
                                id="search-field"
                                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-white placeholder:text-slate-500 focus:ring-0 sm:text-sm bg-transparent"
                                placeholder="Search resources, students, or tickets..."
                                type="search"
                                name="search"
                            />
                        </form>
                        <div className="flex items-center gap-x-4 lg:gap-x-6 relative" ref={notificationRef}>
                            {/* Notification Bell */}
                            <button 
                                type="button" 
                                className="-m-2.5 p-2.5 text-slate-400 hover:text-white transition-colors relative"
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                aria-label="View notifications"
                                aria-expanded={isNotificationOpen}
                                aria-haspopup="true"
                            >
                                <Bell className="h-6 w-6" aria-hidden="true" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-cyan-500 ring-2 ring-gray-900" />
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            <AnimatePresence>
                                {isNotificationOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                            <h3 className="font-semibold text-white">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">{renderSafe(unreadCount)} New</span>
                                            )}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-500 text-sm">No new notifications.</div>
                                            ) : (
                                                <ul>
                                                    {notifications.map((note) => (
                                                        <li 
                                                            key={note.id} 
                                                            className={`p-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors cursor-pointer ${!note.read ? 'bg-gray-800/30' : ''}`}
                                                            onClick={() => handleMarkAsRead(note.id)}
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                                                    note.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                                                    note.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                                                    note.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                                                    'bg-blue-500/10 text-blue-400'
                                                                }`}>
                                                                    {renderSafe(note.type.toUpperCase())}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500">{renderSafe(new Date(note.timestamp).toLocaleDateString())}</span>
                                                            </div>
                                                            <h4 className={`text-sm font-medium ${!note.read ? 'text-white' : 'text-slate-300'}`}>{renderSafe(note.title)}</h4>
                                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{renderSafe(note.message)}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-gray-800 bg-gray-900 text-center">
                                            <button className="text-xs text-cyan-400 hover:text-white transition-colors">View All Notifications</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-700" aria-hidden="true" />
                            <div className="hidden lg:flex lg:items-center">
                                <span className="text-sm font-semibold leading-6 text-white" aria-hidden="true">{renderSafe(user.name)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
