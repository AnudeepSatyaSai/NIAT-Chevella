
import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../../types';
import { db } from '../../services/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { FEES_DATA, Target, TrendingUp, Users, Building, TicketIcon, DollarSign, CalendarDays, Shield, UserPlus, METRICS } from '../../constants';
import { usePortalData } from '../../hooks/usePortalData';
import { TimetableEntry } from '../../types';
import { StatCard, Skeleton, PageHeader, Badge, renderSafe } from '../Shared';
import { useAssistHubStore } from '../../store/assistHubStore';

// Reusable Chart Wrapper
const ChartCard = ({ title, children, height = "h-80", isLoading = false }: { title: string, children?: React.ReactNode, height?: string, isLoading?: boolean }) => (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col shadow-lg ${height}`}>
        <h3 className="text-base font-semibold leading-6 text-white mb-6">{renderSafe(title)}</h3>
        <div className="flex-1 w-full min-h-0">
            {isLoading ? (
                <Skeleton className="w-full h-full" />
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    {children as any}
                </ResponsiveContainer>
            )}
        </div>
    </div>
);

const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [stats, setStats] = useState<any>(null);
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [isLoadingPerformance, setIsLoadingPerformance] = useState(true);
    const { data: timetableData, isLoading: loadingTime } = usePortalData<Record<string, TimetableEntry[]>>('timetable');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaysClasses = timetableData ? timetableData[today] || [] : [];

    useEffect(() => {
        db.getDashboardStats(user).then(setStats);
        db.getAcademicPerformance(user).then(data => {
            setPerformanceData(data);
            setIsLoadingPerformance(false);
        });
    }, [user]);

    return (
        <div className="space-y-8">
            <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle="Here's what's happening with your academic progress today." />

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats ? (
                    <>
                        <StatCard icon={TrendingUp} title="CGPA" value={user.gpa ?? "N/A"} change="Consistent Performance" color="cyan" />
                        <StatCard icon={Target} title="Attendance" value={`${user.attendance || 0}%`} change="Eligible for Exams" color="lime" />
                        <StatCard 
                            icon={DollarSign} 
                            title="Fee Status" 
                            value={stats.feePending > 0 ? `₹${stats.feePending.toLocaleString()}` : "Paid"} 
                            change={stats.feePending > 0 ? `Due: ${FEES_DATA.nextDueDate}` : "No Dues Pending"} 
                            color="yellow" 
                        />
                        <StatCard icon={TicketIcon} title="Active Tickets" value={stats.openTickets ?? "0"} change="Support Requests" color="purple" />
                    </>
                ) : (
                    <>
                        <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Academic Chart */}
                <div className="lg:col-span-2">
                    <ChartCard title="Semester Performance" isLoading={isLoadingPerformance}>
                        <LineChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" domain={[0, 10]} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} 
                            />
                            <Line type="monotone" dataKey="gpa" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} activeDot={{ r: 6 }} name="GPA Score" />
                        </LineChart>
                    </ChartCard>
                </div>

                {/* Today's Schedule */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 h-96 flex flex-col shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-white">Today's Schedule</h3>
                        <Badge color="purple">{renderSafe(today)}</Badge>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {loadingTime ? (
                            <div className="space-y-3">
                                <Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" />
                            </div>
                        ) : todaysClasses.length > 0 ? (
                            <div className="space-y-4">
                                {todaysClasses.map((entry, idx) => (
                                    <div key={idx} className="relative pl-4 border-l-2 border-cyan-500">
                                        <div className="font-semibold text-white text-sm">{renderSafe(entry.course)}</div>
                                        <div className="text-xs text-slate-400 mt-1 flex justify-between">
                                            <span>{renderSafe(entry.time)}</span>
                                            <span className="font-medium text-cyan-400">{renderSafe(entry.room)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <CalendarDays className="w-10 h-10 mb-2 opacity-50" />
                                <p className="text-sm">No classes scheduled.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const FacultyDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [stats, setStats] = useState<any>(null);
    const [facultyData, setFacultyData] = useState<any[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        db.getDashboardStats(user).then(setStats);
        db.getFacultyPerformanceStats(user).then(data => {
            setFacultyData(data);
            setIsLoadingStats(false);
        });
    }, [user]);

    return (
        <div className="space-y-8">
            <PageHeader title="Faculty Overview" subtitle="Manage your courses, students, and research." />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats ? (
                    <>
                        <StatCard icon={Users} title="My Students" value={stats.studentCount ?? "0"} color="cyan" />
                        <StatCard icon={TrendingUp} title="Avg. Attendance" value={`${stats.avgAttendance || 0}%`} change="+2% vs last sem" color="lime" />
                        <StatCard icon={Target} title="Research Output" value={stats.researchPapers ?? "0"} change="2 in Review" color="purple" />
                        <StatCard icon={Shield} title="Pending Approvals" value={stats.pendingApprovals ?? "0"} color="yellow" />
                    </>
                ) : (
                    <><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></>
                )}
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2">
                    <ChartCard title="Course Outcomes (CSE101)" isLoading={isLoadingStats}>
                        <BarChart data={facultyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                            <Bar dataKey="avgScore" fill="#0ea5e9" name="Avg Score" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="submissionRate" fill="#84cc16" name="Submission Rate (%)" radius={[4, 4, 0, 0]} />
                            <Legend />
                        </BarChart>
                    </ChartCard>
                </div>
                
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
                    <h3 className="text-base font-semibold leading-6 text-white mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Upload Marks', color: 'blue' },
                            { label: 'Review Assignments', color: 'indigo' },
                            { label: 'Create Announcement', color: 'green' }
                        ].map((action, idx) => (
                            <button key={idx} className="w-full text-left p-4 rounded-lg border border-gray-700 hover:bg-gray-700/50 hover:border-cyan-500/30 transition-all flex items-center justify-between group">
                                <span className="font-medium text-slate-300 group-hover:text-white">{renderSafe(action.label)}</span>
                                <span className={`text-${action.color}-400 group-hover:translate-x-1 transition-transform`}>→</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
    const COLORS = ['#0ea5e9', '#84cc16', '#facc15', '#f87171', '#a855f7'];
    const [stats, setStats] = useState<any>(null);
    const [ticketData, setTicketData] = useState<any[]>([]);
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);
    const { setActiveView } = useAssistHubStore();

    useEffect(() => {
        db.getDashboardStats(user).then(setStats);
        db.getTicketDistributionStats().then(data => {
            setTicketData(data);
            setIsLoadingTickets(false);
        });
    }, [user]);

    return (
        <div className="space-y-8">
            <PageHeader title="System Administration" subtitle="Overview of platform health and user activity." />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats ? (
                    <>
                        <StatCard icon={Users} title="Total Users" value={stats.totalUsers?.toLocaleString() || "0"} change="+15% YoY" color="cyan" />
                        <StatCard icon={TicketIcon} title="Open Tickets" value={stats.pendingTickets ?? "0"} color="yellow" />
                        <StatCard icon={Building} title="System Health" value={`${stats.systemHealth || 0}%`} color="lime" />
                        <StatCard icon={DollarSign} title="Placement Drives" value={stats.activeDrives ?? "0"} change="Active" color="purple" />
                    </>
                ) : (
                    <><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     <ChartCard title="System Activity (7 Days)">
                        <AreaChart data={[
                            { name: 'Mon', visits: 4000 }, { name: 'Tue', visits: 3000 },
                            { name: 'Wed', visits: 2000 }, { name: 'Thu', visits: 2780 },
                            { name: 'Fri', visits: 1890 }, { name: 'Sat', visits: 2390 },
                            { name: 'Sun', visits: 3490 },
                        ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                            <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                            <Area type="monotone" dataKey="visits" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                        </AreaChart>
                    </ChartCard>

                    <div className="grid grid-cols-2 gap-6">
                         <div onClick={() => setActiveView('users')} className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg cursor-pointer hover:border-cyan-500/50 hover:bg-gray-800/80 transition-all group">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
                                    <Users className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h3 className="font-semibold text-white">User Management</h3>
                             </div>
                             <p className="text-sm text-slate-400">View registered users, edit roles, and manage access.</p>
                         </div>

                         <div onClick={() => setActiveView('enrollment')} className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg cursor-pointer hover:border-lime-500/50 hover:bg-gray-800/80 transition-all group">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-lime-500/20 rounded-lg group-hover:bg-lime-500/30 transition-colors">
                                    <UserPlus className="w-6 h-6 text-lime-400" />
                                </div>
                                <h3 className="font-semibold text-white">Student Enrollment</h3>
                             </div>
                             <p className="text-sm text-slate-400">Register new student batches and verify documents.</p>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {METRICS.map(metric => (
                            <StatCard 
                                key={metric.label} 
                                title={metric.label || ''} 
                                value={`${metric.value}${metric.suffix || ''}`} 
                                color="cyan" 
                                icon={() => <div className="w-8 h-8 border-2 border-current rounded-lg"></div>} 
                            />
                        ))}
                    </div>
                </div>

                <ChartCard title="Ticket Categories" isLoading={isLoadingTickets}>
                    <PieChart>
                        <Pie 
                            data={ticketData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={70} 
                            outerRadius={100} 
                            paddingAngle={5}
                            dataKey="value" 
                            nameKey="name"
                            stroke="none"
                        >
                            {ticketData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                    </PieChart>
                </ChartCard>
            </div>
        </div>
    );
}

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
    switch (user.role) {
        case UserRole.Student: return <StudentDashboard user={user} />;
        case UserRole.Faculty: return <FacultyDashboard user={user} />;
        case UserRole.Admin: return <AdminDashboard user={user} />;
        default: return <div>Dashboard not available.</div>;
    }
};

export default Dashboard;
