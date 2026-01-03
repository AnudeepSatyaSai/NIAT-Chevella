
import React, { useState, useEffect } from 'react';
import { UserRole, PermissionStatus, PermissionRequest, PermissionType, User } from '../../types';
import { db } from '../../services/database';
import { motion, AnimatePresence } from 'framer-motion';
import { renderSafe } from '../Shared';

const statusColorMap: Record<PermissionStatus, string> = {
    [PermissionStatus.Approved]: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    [PermissionStatus.Pending]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    [PermissionStatus.Rejected]: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const Permissions: React.FC<{ userRole: UserRole, user?: User }> = ({ userRole, user }) => {
    const [permissions, setPermissions] = useState<PermissionRequest[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [newRequest, setNewRequest] = useState({ type: PermissionType.LabAccess, details: '' });
    const [isLoading, setIsLoading] = useState(true);

    const canApprove = userRole === UserRole.Admin;
    const canRequest = userRole === UserRole.Faculty || userRole === UserRole.Student;

    const fetchPermissions = async () => {
        setIsLoading(true);
        if (user) {
            const data = await db.getPermissions(user);
            const sorted = data.sort((a, b) => {
                if (a.status === PermissionStatus.Pending && b.status !== PermissionStatus.Pending) return -1;
                if (a.status !== PermissionStatus.Pending && b.status === PermissionStatus.Pending) return 1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            setPermissions(sorted);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPermissions();
    }, [user]);

    const handleApprove = async (id: string, status: PermissionStatus) => {
        if (!user) return;
        await db.updatePermissionStatus(id, status, user.id);
        fetchPermissions();
    };

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfirming(true);
    };

    const handleFinalSubmit = async () => {
        if (!user) return;
        
        await db.createPermissionRequest({
            type: newRequest.type,
            details: newRequest.details
        }, user);
        
        setIsConfirming(false);
        setIsModalOpen(false);
        setNewRequest({ type: PermissionType.LabAccess, details: '' });
        fetchPermissions();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Permissions & Requests</h2>
                    <p className="text-sm text-slate-400">
                        {userRole === UserRole.Admin 
                            ? 'Manage approvals for faculty and student requests.' 
                            : 'Track status of your applications and requests.'}
                    </p>
                </div>
                {canRequest && (
                     <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-4 rounded-lg shadow-lg shadow-cyan-500/20 transition-all"
                    >
                        + New Request
                    </button>
                )}
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                {isLoading ? (
                    <div className="p-10 text-center text-cyan-400">Loading requests...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 border-b border-gray-700">
                            <tr>
                                <th className="p-4 text-slate-400 font-medium">Request ID</th>
                                <th className="p-4 text-slate-400 font-medium">Type</th>
                                <th className="p-4 text-slate-400 font-medium">Submitted By</th>
                                <th className="p-4 text-slate-400 font-medium">Details</th>
                                <th className="p-4 text-slate-400 font-medium">Date</th>
                                <th className="p-4 text-slate-400 font-medium">Status</th>
                                {canApprove && <th className="p-4 text-center text-slate-400 font-medium">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {permissions.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No records found.</td></tr>
                            ) : permissions.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-mono text-cyan-400 text-sm">{renderSafe(req.id)}</td>
                                    <td className="p-4 text-white font-medium">{renderSafe(req.type)}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm">{renderSafe(req.requesterName)}</span>
                                            <span className="text-xs text-slate-500">{renderSafe(req.requesterRole)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300 text-sm max-w-xs truncate">{renderSafe(req.details)}</td>
                                    <td className="p-4 text-slate-400 text-sm">{renderSafe(req.date)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${statusColorMap[req.status]}`}>
                                            {renderSafe(req.status)}
                                        </span>
                                    </td>
                                    {canApprove && (
                                        <td className="p-4">
                                            {req.status === PermissionStatus.Pending ? (
                                                <div className="flex justify-center space-x-2">
                                                    <button 
                                                        onClick={() => handleApprove(req.id, PermissionStatus.Approved)}
                                                        className="bg-lime-600/20 hover:bg-lime-600/40 text-lime-400 border border-lime-600/50 text-xs font-bold py-1 px-3 rounded transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApprove(req.id, PermissionStatus.Rejected)}
                                                        className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 text-xs font-bold py-1 px-3 rounded transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center text-xs text-slate-600">
                                                    {req.status === PermissionStatus.Approved ? 'Approved by Admin' : 'Rejected'}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Request Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-xl p-6 shadow-2xl relative"
                        >
                            {!isConfirming ? (
                                <>
                                    <h3 className="text-xl font-bold text-white mb-4">Submit Permission Request</h3>
                                    <form onSubmit={handlePreSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Request Type</label>
                                            <select 
                                                value={newRequest.type}
                                                onChange={(e) => setNewRequest({...newRequest, type: e.target.value as PermissionType})}
                                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                                            >
                                                {Object.values(PermissionType).map(t => <option key={t} value={t}>{renderSafe(t)}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Details / Reason</label>
                                            <textarea 
                                                value={newRequest.details}
                                                onChange={(e) => setNewRequest({...newRequest, details: e.target.value})}
                                                required
                                                rows={3}
                                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                                                placeholder="Please provide details for approval..."
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
                                            <button type="submit" className="px-4 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 text-sm">Submit</button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Confirm Submission</h3>
                                    <p className="text-slate-400 text-sm mb-6">Are you sure you want to submit this request for <strong>{renderSafe(newRequest.type)}</strong>? This action cannot be undone while the request is pending.</p>
                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => setIsConfirming(false)} className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">Go Back</button>
                                        <button onClick={handleFinalSubmit} className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">Yes, Submit</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Permissions;
