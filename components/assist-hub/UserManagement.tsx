
import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X } from '../../constants';
import { db } from '../../services/database';
import { renderSafe } from '../Shared';

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('All');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        setIsLoading(true);
        const data = await db.getUsers();
        setUsers(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeactivate = async (userId: string) => {
        if (window.confirm('Are you sure you want to deactivate this user?')) {
            await db.deleteUser(userId);
            fetchUsers();
        }
    };

    const handleEditRole = async (user: User) => {
        const nextRole = user.role === UserRole.Student ? UserRole.Faculty : user.role === UserRole.Faculty ? UserRole.Admin : UserRole.Student;
        const updatedUser = { ...user, role: nextRole };
        await db.updateUser(updatedUser);
        fetchUsers();
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'All' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: UserRole) => {
        switch(role) {
            case UserRole.Student: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case UserRole.Faculty: return 'bg-lime-500/20 text-lime-400 border-lime-500/30';
            case UserRole.Admin: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    User Management
                </h2>
                <div className="flex gap-3 w-full md:w-auto">
                     <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 w-full md:w-64"
                        aria-label="Search Users"
                    />
                    <select 
                        value={filterRole} 
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                        aria-label="Filter by Role"
                    >
                        <option value="All">All Roles</option>
                        <option value={UserRole.Student}>Students</option>
                        <option value={UserRole.Faculty}>Faculty</option>
                        <option value={UserRole.Admin}>Admins</option>
                    </select>
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex-1 overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 border-b border-gray-700 sticky top-0">
                        <tr>
                            <th scope="col" className="p-4 text-slate-400 font-medium">User</th>
                            <th scope="col" className="p-4 text-slate-400 font-medium">Role</th>
                            <th scope="col" className="p-4 text-slate-400 font-medium">Department / Program</th>
                            <th scope="col" className="p-4 text-slate-400 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="p-10 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                                </td>
                            </tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-700/30 transition-colors even:bg-gray-800/50">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-gray-700" aria-hidden="true" />
                                        <div>
                                            <p className="font-bold text-white">{renderSafe(user.name)}</p>
                                            <p className="text-xs text-slate-500">{renderSafe(user.email)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadge(user.role)}`}>
                                        {renderSafe(user.role)}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-300 text-sm">
                                    {renderSafe(user.program || user.department || 'N/A')}
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button 
                                        onClick={() => setSelectedUser(user)}
                                        className="text-cyan-400 hover:text-white text-sm font-medium px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                                        aria-label={`View details for ${user.name}`}
                                    >
                                        View
                                    </button>
                                    <button 
                                        className="text-slate-400 hover:text-white text-sm font-medium px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                                        onClick={() => handleEditRole(user)}
                                        aria-label={`Edit role for ${user.name}`}
                                    >
                                        Edit Role
                                    </button>
                                    <button 
                                        className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                                        onClick={() => handleDeactivate(user.id)}
                                        aria-label={`Deactivate ${user.name}`}
                                    >
                                        Deactivate
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!isLoading && filteredUsers.length === 0 && (
                    <div className="p-10 text-center text-slate-500">
                        No users found matching your criteria.
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div 
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
                        onClick={() => setSelectedUser(null)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="user-modal-title"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="h-24 bg-gradient-to-r from-cyan-600 to-blue-600 relative">
                                <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 rounded-full p-1 text-white transition-colors" aria-label="Close Modal">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="px-6 pb-6">
                                <div className="relative -mt-12 mb-4">
                                    <img src={selectedUser.avatarUrl} alt="" className="w-24 h-24 rounded-full border-4 border-gray-900 bg-gray-800" />
                                </div>
                                <div className="mb-6">
                                    <h3 id="user-modal-title" className="text-xl font-bold text-white">{renderSafe(selectedUser.name)}</h3>
                                    <p className="text-slate-400 text-sm">{renderSafe(selectedUser.email)}</p>
                                    <div className="mt-3 flex gap-2">
                                         <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadge(selectedUser.role)}`}>
                                            {renderSafe(selectedUser.role)}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-600 bg-gray-800 text-slate-300">
                                            ID: {renderSafe(selectedUser.id)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-3 border-t border-gray-800 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Department/Program</span>
                                        <span className="text-slate-200 font-medium">{renderSafe(selectedUser.program || selectedUser.department || 'N/A')}</span>
                                    </div>
                                    {selectedUser.role === UserRole.Student && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">GPA</span>
                                                <span className="text-cyan-400 font-bold">{renderSafe(selectedUser.gpa || 'N/A')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Attendance</span>
                                                <span className="text-lime-400 font-bold">{renderSafe(selectedUser.attendance || 0)}%</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button className="bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition-colors border border-gray-700">
                                        Reset Password
                                    </button>
                                    <button 
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-sm transition-colors border border-red-500/30"
                                        onClick={() => {
                                            handleDeactivate(selectedUser.id);
                                            setSelectedUser(null);
                                        }}
                                    >
                                        Deactivate User
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
