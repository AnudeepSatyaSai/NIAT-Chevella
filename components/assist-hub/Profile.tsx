
import React, { useState, useEffect } from 'react';
import { UserRole, NotificationPreferences } from '../../types';
import { MOCK_PROFILE_DATA } from '../../constants';
import { db } from '../../services/database';
import { motion } from 'framer-motion';
import { Bell } from '../../constants';
import { renderSafe } from '../Shared';

const Profile: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
    const [user, setUser] = useState<any>(null);
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        ticketUpdates: true,
        announcements: true,
        placements: true,
        events: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            const currentUser = await db.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                if (currentUser.notificationPreferences) {
                    setPreferences(currentUser.notificationPreferences);
                }
            } else {
                setUser(MOCK_PROFILE_DATA[userRole]);
            }
        };
        loadProfile();
    }, [userRole]);

    const handleToggle = (key: keyof NotificationPreferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const savePreferences = async () => {
        if (!user) return;
        setIsSaving(true);
        setSaveMessage('');
        try {
            await db.updateNotificationPreferences(user.id, preferences);
            setSaveMessage('Preferences saved successfully.');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (e) {
            console.error(e);
            setSaveMessage('Failed to save preferences.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="max-w-4xl mx-auto space-y-8"
        >
            {/* Header Card */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-cyan-900 to-blue-900"></div>
                <div className="p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-24 mb-6">
                        <img src={user.avatarUrl} alt="Profile Avatar" className="w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-700" />
                        <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                            <h1 className="text-3xl font-bold text-white">{renderSafe(user.name)}</h1>
                            <p className="text-cyan-400 font-medium">{renderSafe(user.program || user.department)}</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <span className="inline-flex items-center rounded-md bg-gray-700/50 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-600/20">
                                {renderSafe(user.role)} ID: {renderSafe(user.id)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-700 pt-8">
                        {/* Left Column */}
                        <div className="md:col-span-1 space-y-6">
                             <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Contact Info</h3>
                                <div className="space-y-2 text-sm text-slate-300">
                                    <p className="flex justify-between"><span className="text-slate-500">Email:</span> {renderSafe(user.email)}</p>
                                    <p className="flex justify-between"><span className="text-slate-500">Phone:</span> +91 98765 XXXXX</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills?.map((skill: string) => (
                                        <span key={skill} className="bg-lime-500/10 text-lime-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-lime-500/20">
                                            {renderSafe(skill)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="md:col-span-2">
                             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">About Me</h3>
                             <p className="text-slate-400 leading-relaxed text-sm">{renderSafe(user.about)}</p>
                             
                             {user.role === UserRole.Student && (
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                        <p className="text-xs text-slate-500 uppercase">CGPA</p>
                                        <p className="text-2xl font-bold text-cyan-400">{renderSafe(user.gpa || 'N/A')}</p>
                                    </div>
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                        <p className="text-xs text-slate-500 uppercase">Attendance</p>
                                        <p className="text-2xl font-bold text-lime-400">{renderSafe(user.attendance || 0)}%</p>
                                    </div>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Bell className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
                        <p className="text-sm text-slate-400">Manage what alerts you receive in-app and via email.</p>
                    </div>
                </div>

                <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
                        <div>
                            <p className="font-medium text-white">Ticket Updates</p>
                            <p className="text-xs text-slate-500">Get notified when your support tickets change status.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={preferences.ticketUpdates} onChange={() => handleToggle('ticketUpdates')} />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
                        <div>
                            <p className="font-medium text-white">Announcements</p>
                            <p className="text-xs text-slate-500">Receive alerts for new campus news and academic updates.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={preferences.announcements} onChange={() => handleToggle('announcements')} />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>

                    {user.role === UserRole.Student && (
                        <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
                            <div>
                                <p className="font-medium text-white">Placement Drives</p>
                                <p className="text-xs text-slate-500">Alerts for new job openings and interview schedules.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={preferences.placements} onChange={() => handleToggle('placements')} />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                    )}

                     <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
                        <div>
                            <p className="font-medium text-white">Campus Events</p>
                            <p className="text-xs text-slate-500">Reminders for workshops, hackathons, and seminars.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={preferences.events} onChange={() => handleToggle('events')} />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-4">
                    {saveMessage && <span className="text-sm text-green-400">{renderSafe(saveMessage)}</span>}
                    <button 
                        onClick={savePreferences}
                        disabled={isSaving}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
