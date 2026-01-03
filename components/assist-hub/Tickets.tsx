
import React, { useState, useEffect } from 'react';
import { User, UserRole, TicketStatus, Ticket, TicketCategory, TicketPriority, TicketHistoryEntry } from '../../types';
import { db } from '../../services/database';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, PageHeader, Skeleton, renderSafe } from '../Shared';

// Map enums to Badge Colors
const getStatusColor = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.Pending: return 'yellow';
        case TicketStatus.InProgress: return 'blue';
        case TicketStatus.Resolved: return 'green';
        case TicketStatus.Closed: return 'gray';
        default: return 'gray';
    }
};

const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
        case TicketPriority.High: return 'red';
        case TicketPriority.Medium: return 'yellow';
        case TicketPriority.Low: return 'green';
        default: return 'gray';
    }
};

const Tickets: React.FC<{ user: User }> = ({ user }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // UI State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
    const [confirmResolveId, setConfirmResolveId] = useState<string | null>(null);
    const [resolutionNote, setResolutionNote] = useState('');
    const [ticketHistory, setTicketHistory] = useState<TicketHistoryEntry[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
    
    // Filters & Sorting
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [sortKey, setSortKey] = useState<'date' | 'priority'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Form
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState<TicketCategory>(TicketCategory.IT);
    const [newPriority, setNewPriority] = useState<TicketPriority>(TicketPriority.Medium);
    const [newDesc, setNewDesc] = useState('');

    const fetchTickets = async () => {
        setIsLoading(true);
        const data = await db.getTickets(user);
        setTickets(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, [user]);

    const handleExpand = async (ticketId: string) => {
        if (expandedTicketId === ticketId) {
            setExpandedTicketId(null);
            setTicketHistory([]);
            return;
        }

        setExpandedTicketId(ticketId);
        setActiveTab('details');
        setLoadingHistory(true);
        // Fetch history
        const history = await db.getTicketHistory(ticketId);
        setTicketHistory(history);
        setLoadingHistory(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await db.createTicket({
                title: newTitle,
                category: newCategory,
                priority: newPriority,
                description: newDesc
            }, user);
            setShowCreateModal(false);
            setNewTitle('');
            setNewDesc('');
            setNewPriority(TicketPriority.Medium);
            setNewCategory(TicketCategory.IT);
            fetchTickets();
        } catch (error) {
            console.error("Failed to create ticket", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: TicketStatus, notes?: string) => {
        await db.updateTicketStatus(id, status, user, notes);
        fetchTickets();
        // Refresh history if open
        if (expandedTicketId === id) {
             const history = await db.getTicketHistory(id);
             setTicketHistory(history);
        }
    };

    const confirmResolution = async () => {
        if (confirmResolveId) {
            await handleStatusUpdate(confirmResolveId, TicketStatus.Resolved, resolutionNote);
            setConfirmResolveId(null);
            setResolutionNote('');
        }
    };

    const canResolve = (ticket: Ticket) => {
        if (user.role === UserRole.Admin) return true; 
        if (user.role === UserRole.Faculty && ticket.assignedToRole === UserRole.Faculty) return true;
        return false;
    };

    // Filter Logic
    const processedTickets = [...tickets]
        .filter(t => filterStatus === 'All' || t.status === filterStatus)
        .filter(t => filterCategory === 'All' || t.category === filterCategory)
        .sort((a, b) => {
            if (sortKey === 'date') {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                const weights = { [TicketPriority.High]: 3, [TicketPriority.Medium]: 2, [TicketPriority.Low]: 1 };
                const wA = weights[a.priority] || 2;
                const wB = weights[b.priority] || 2;
                return sortOrder === 'asc' ? wA - wB : wB - wA;
            }
        });

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Support Tickets" 
                subtitle={user.role === UserRole.Student ? 'Raise and track your campus issues.' : 'Manage and resolve support requests.'}
                action={user.role === UserRole.Student && (
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors"
                    >
                        Create Ticket
                    </button>
                )}
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm backdrop-blur-md">
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Status</label>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="block rounded-lg border-0 py-2 pl-3 pr-10 bg-gray-900 text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-cyan-600 sm:text-sm"
                        >
                            <option value="All">All Status</option>
                            {Object.values(TicketStatus).map(s => <option key={s} value={s}>{renderSafe(s)}</option>)}
                        </select>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Category</label>
                        <select 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="block rounded-lg border-0 py-2 pl-3 pr-10 bg-gray-900 text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-cyan-600 sm:text-sm"
                        >
                            <option value="All">All Categories</option>
                            {Object.values(TicketCategory).map(c => <option key={c} value={c}>{renderSafe(c)}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-end gap-2">
                    <button 
                        onClick={() => { setSortKey('date'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
                        className={`text-xs px-4 py-2.5 rounded-lg border font-bold uppercase tracking-wider transition-all ${sortKey === 'date' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-gray-900 border-gray-700 text-slate-400 hover:text-white'}`}
                    >
                        Date {sortKey === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                    <button 
                        onClick={() => { setSortKey('priority'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
                        className={`text-xs px-4 py-2.5 rounded-lg border font-bold uppercase tracking-wider transition-all ${sortKey === 'priority' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-gray-900 border-gray-700 text-slate-400 hover:text-white'}`}
                    >
                        Priority {sortKey === 'priority' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="overflow-hidden bg-gray-800 shadow-sm ring-1 ring-gray-700 sm:rounded-xl">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900/50">
                        <tr>
                            <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-widest text-slate-500 sm:pl-6">ID / Priority</th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Subject</th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Category</th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Submitted By</th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                            <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 bg-gray-800">
                        {isLoading ? (
                           [...Array(5)].map((_, i) => (
                               <tr key={i}>
                                   <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                   <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                                   <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                   <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                                   <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                                   <td className="p-4"></td>
                               </tr>
                           ))
                        ) : processedTickets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <p>No tickets found matching your criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            processedTickets.map((ticket) => (
                                <React.Fragment key={ticket.id}>
                                    <tr 
                                        onClick={() => handleExpand(ticket.id)}
                                        className={`cursor-pointer transition-all ${expandedTicketId === ticket.id ? 'bg-cyan-900/10' : 'hover:bg-gray-700/50'}`}
                                    >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="font-mono text-[10px] text-slate-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700 w-fit">#{renderSafe(ticket.id.slice(0, 6))}</span>
                                                <Badge color={getPriorityColor(ticket.priority)}>{renderSafe(ticket.priority)}</Badge>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                                            <div className="font-bold text-slate-200">{renderSafe(ticket.title)}</div>
                                            <div className="text-slate-500 text-xs truncate max-w-xs mt-0.5">{renderSafe(ticket.description)}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                             <span className="text-slate-400 font-medium px-2 py-0.5 rounded bg-gray-900/50 border border-gray-700">{renderSafe(ticket.category)}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">
                                            <div className="font-bold text-slate-300">{renderSafe(ticket.submittedByName)}</div>
                                            <div className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase">{renderSafe(new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }))}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <Badge color={getStatusColor(ticket.status)}>{renderSafe(ticket.status)}</Badge>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            {canResolve(ticket) && ticket.status !== TicketStatus.Resolved && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmResolveId(ticket.id); }}
                                                    className="bg-cyan-500 text-black px-4 py-1.5 rounded-lg font-bold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {/* Expanded Detail View */}
                                    {expandedTicketId === ticket.id && (
                                        <tr className="bg-gray-900/30">
                                            <td colSpan={6} className="px-0 pb-4">
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="rounded-xl border border-gray-700 bg-gray-800/50 m-4 overflow-hidden shadow-2xl"
                                                >
                                                    <div className="flex border-b border-gray-700 bg-gray-900/30">
                                                        <button 
                                                            onClick={() => setActiveTab('details')}
                                                            className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'details' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-slate-500 hover:text-slate-300'}`}
                                                        >
                                                            Ticket Details
                                                        </button>
                                                        <button 
                                                            onClick={() => setActiveTab('history')}
                                                            className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-slate-500 hover:text-slate-300'}`}
                                                        >
                                                            Audit Log / History
                                                        </button>
                                                    </div>

                                                    <div className="p-6">
                                                        {activeTab === 'details' ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div>
                                                                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-3">Issue Description</h4>
                                                                    <div className="text-sm text-slate-300 leading-relaxed bg-black/40 p-4 rounded-xl border border-gray-700 italic">
                                                                        "{renderSafe(ticket.description)}"
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-6">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Escalated To</h4>
                                                                            <p className="text-sm text-white font-bold">{renderSafe(ticket.assignedToRole || 'System Default')}</p>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Creation Date</h4>
                                                                            <p className="text-sm text-white font-mono">{renderSafe(new Date(ticket.createdAt).toLocaleString())}</p>
                                                                        </div>
                                                                    </div>
                                                                    {ticket.resolutionNotes && (
                                                                        <div>
                                                                            <h4 className="text-[10px] font-black text-lime-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                                                Resolution Notes
                                                                            </h4>
                                                                            <div className="text-sm text-white bg-lime-500/10 p-4 rounded-xl border border-lime-500/20 font-medium">
                                                                                {renderSafe(ticket.resolutionNotes)}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="max-h-80 overflow-y-auto custom-scrollbar pr-4">
                                                                {loadingHistory ? (
                                                                    <div className="py-10 text-center text-cyan-500">
                                                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
                                                                        <p className="mt-4 text-xs font-bold uppercase tracking-widest">Fetching Audit Trail...</p>
                                                                    </div>
                                                                ) : ticketHistory.length === 0 ? (
                                                                    <div className="py-10 text-center text-slate-600 italic">No history records found for this ticket.</div>
                                                                ) : (
                                                                    <ul className="space-y-6">
                                                                        {ticketHistory.map((log) => (
                                                                            <li key={log.id} className="relative pl-8 border-l-2 border-gray-700 pb-1 group">
                                                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center group-hover:border-cyan-500 transition-colors">
                                                                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                                                                                </div>
                                                                                <div className="flex flex-col gap-1">
                                                                                    <p className="text-sm text-white font-medium">{renderSafe(log.action)}</p>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Actor:</span>
                                                                                        <span className="text-[10px] text-cyan-400 font-mono font-bold">{renderSafe(log.actorName)}</span>
                                                                                        <span className="text-slate-700 mx-1">•</span>
                                                                                        <span className="text-[10px] text-slate-500 font-mono">{renderSafe(new Date(log.timestamp).toLocaleString())}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 p-6 border-b border-gray-800">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Raise Support Request</h3>
                                <p className="text-xs text-cyan-400 font-mono mt-1 uppercase tracking-widest">Priority Protocol v4.2</p>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Subject / Headline</label>
                                    <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="block w-full rounded-xl border-0 py-3 bg-gray-800 text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-600 focus:ring-2 focus:ring-cyan-500 transition-all sm:text-sm" placeholder="Brief summary of the issue..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Classification</label>
                                        <select value={newCategory} onChange={e => setNewCategory(e.target.value as TicketCategory)} className="block w-full rounded-xl border-0 py-3 bg-gray-800 text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-cyan-500 transition-all sm:text-sm">
                                            {Object.values(TicketCategory).map(cat => <option key={cat} value={cat}>{renderSafe(cat)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Severity Level</label>
                                        <select value={newPriority} onChange={e => setNewPriority(e.target.value as TicketPriority)} className="block w-full rounded-xl border-0 py-3 bg-gray-800 text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-cyan-500 transition-all sm:text-sm">
                                            {Object.values(TicketPriority).map(p => <option key={p} value={p}>{renderSafe(p)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Full Context / Details</label>
                                    <textarea required rows={4} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="block w-full rounded-xl border-0 py-3 bg-gray-800 text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-600 focus:ring-2 focus:ring-cyan-500 transition-all sm:text-sm resize-none" placeholder="Provide as much detail as possible to expedite resolution..." />
                                </div>
                                <div className="mt-8 flex justify-end gap-3 border-t border-gray-800 pt-6">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-xl bg-gray-800 px-6 py-3 text-xs font-bold text-slate-400 hover:bg-gray-700 hover:text-white transition-all uppercase tracking-widest">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="rounded-xl bg-cyan-600 px-8 py-3 text-xs font-black text-white hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-[0.2em] disabled:opacity-50">
                                        {isSubmitting ? 'Transmitting...' : 'Submit Ticket'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Resolve Confirmation / Notes Modal */}
            <AnimatePresence>
                {confirmResolveId && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gray-900 border border-lime-500/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="bg-lime-500/10 p-6 border-b border-lime-500/20 text-center">
                                <div className="w-12 h-12 bg-lime-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <h3 className="text-xl font-black text-white uppercase italic">Confirm Resolution</h3>
                                <p className="mt-2 text-xs text-slate-400 font-medium">Please provide a brief summary of the resolution for the student's records.</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Resolution Summary</label>
                                    <textarea 
                                        rows={3} 
                                        value={resolutionNote} 
                                        onChange={e => setResolutionNote(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3 bg-gray-800 text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-600 focus:ring-2 focus:ring-lime-500 transition-all sm:text-sm resize-none" 
                                        placeholder="e.g. Projector cable replaced, Tested and working..." 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    <button onClick={() => { setConfirmResolveId(null); setResolutionNote(''); }} className="rounded-xl bg-gray-800 px-3 py-3 text-xs font-bold text-slate-400 hover:bg-gray-700 transition-all uppercase tracking-widest">Go Back</button>
                                    <button onClick={confirmResolution} className="rounded-xl bg-lime-500 px-3 py-3 text-xs font-black text-black hover:bg-lime-400 transition-all shadow-xl shadow-lime-500/20 uppercase tracking-widest">Verify & Resolve</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tickets;
