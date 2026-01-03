
import { supabase, isSupabaseConfigured } from './supabase';
import { UserRole, Ticket, TicketStatus, TicketCategory, User, PermissionRequest, PermissionStatus, PermissionType, PlacementDrive, Announcement, Course, TimetableEntry, TicketPriority, TicketHistoryEntry, NotificationPreferences, AppNotification } from '../types';
import { MOCK_TICKETS, MOCK_PROFILE_DATA, MOCK_PERMISSIONS, MOCK_ANNOUNCEMENTS, MOCK_TIMETABLE, MOCK_COURSES, MOCK_PLACEMENTS, MOCK_ADMIN_TICKETS, MOCK_STUDENT_ACADEMICS, MOCK_FACULTY_PERFORMANCE } from '../constants';

// Helper to map DB snake_case to Frontend camelCase
const mapProfileToUser = (profile: any): User => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role as UserRole,
    avatarUrl: profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}`,
    program: profile.program,
    department: profile.department,
    gpa: profile.gpa ? parseFloat(profile.gpa) : undefined,
    attendance: profile.attendance ? parseFloat(profile.attendance) : undefined,
    skills: profile.skills || [],
    notificationPreferences: profile.preferences || {
        ticketUpdates: true,
        announcements: true,
        placements: true,
        events: false
    }
});

class DatabaseService {
    private useMock = false;
    private mockTickets: Ticket[] = [...MOCK_TICKETS];
    private mockPermissions: PermissionRequest[] = [...MOCK_PERMISSIONS];
    private mockAnnouncements: Announcement[] = [...MOCK_ANNOUNCEMENTS];
    private mockTicketHistory: TicketHistoryEntry[] = []; 
    private mockNotifications: AppNotification[] = [
        { id: 'n1', title: 'Ticket Updated', message: 'Your ticket #T-1001 has been resolved.', type: 'success', timestamp: new Date(Date.now() - 10000000).toISOString(), read: false },
        { id: 'n2', title: 'New Announcement', message: 'Hackathon registration deadline extended.', type: 'info', timestamp: new Date(Date.now() - 80000000).toISOString(), read: true },
        { id: 'n3', title: 'Placement Alert', message: 'Google SDE Intern drive is now open.', type: 'warning', timestamp: new Date(Date.now() - 200000000).toISOString(), read: false }
    ];

    constructor() {
        if (!isSupabaseConfigured) {
            console.warn("Supabase keys are placeholders. Using Mock Data Fallback.");
            this.useMock = true;
            this.mockTickets.forEach(t => {
                this.mockTicketHistory.push({
                    id: `H-${Math.random()}`,
                    ticketId: t.id,
                    action: 'Ticket Created',
                    actorName: t.submittedByName || 'User',
                    timestamp: t.createdAt
                });
            });
        }
    }

    async login(email: string, password: string): Promise<User> {
        if (this.useMock) {
            const user = Object.values(MOCK_PROFILE_DATA).find(u => u.email.toLowerCase() === email.toLowerCase());
            if (user) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!user.notificationPreferences) {
                    user.notificationPreferences = { ticketUpdates: true, announcements: true, placements: true, events: false };
                }
                localStorage.setItem('mock_session_user', JSON.stringify(user));
                return user as User;
            }
            throw new Error('Invalid mock credentials');
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const user = await this.getCurrentUser();
        if (!user) throw new Error('Profile not found for user');
        return user;
    }

    async signUp(email: string, password: string, name: string): Promise<void> {
        if (this.useMock) {
            const newUser: User = {
                id: `S-${Date.now()}`,
                name: name,
                email: email,
                role: UserRole.Student,
                avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`,
                program: 'B.Tech CSE (AI & ML)', 
                notificationPreferences: { ticketUpdates: true, announcements: true, placements: true, events: false }
            };
            
            await new Promise(resolve => setTimeout(resolve, 800)); 
            localStorage.setItem('mock_session_user', JSON.stringify(newUser));
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });

        if (error) throw error;
        if (!data.session) {
            throw new Error('Sign up successful! Please check your email to verify your account before logging in.');
        }
    }

    async getCurrentUser(): Promise<User | null> {
        if (this.useMock) {
            const stored = localStorage.getItem('mock_session_user');
            return stored ? JSON.parse(stored) : null;
        }

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) return null;

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error || !profile) return null;
            return mapProfileToUser(profile);
        } catch (e) {
            console.warn("Supabase connection failed, falling back to mock.", e);
            this.useMock = true;
            return this.getCurrentUser();
        }
    }

    async signOut(): Promise<void> {
        if (this.useMock) {
            localStorage.removeItem('mock_session_user');
            return;
        }
        await supabase.auth.signOut();
    }

    async getTickets(user: User): Promise<Ticket[]> {
        if (this.useMock) {
            let tickets = this.mockTickets;
            if (user.role === UserRole.Student) {
                tickets = tickets.filter(t => t.submittedBy === user.id);
            }
            return tickets;
        }

        try {
            const { data, error } = await supabase
                .from('tickets')
                .select(`
                    *,
                    profiles:submitted_by (name) 
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map((t: any) => ({
                id: t.id,
                title: t.title,
                category: t.category as TicketCategory,
                description: t.description,
                status: t.status as TicketStatus,
                priority: (t.priority as TicketPriority) || TicketPriority.Medium,
                createdAt: t.created_at,
                submittedBy: t.submitted_by,
                submittedByName: t.profiles?.name || 'Unknown',
                assignedToRole: t.assigned_to_role as UserRole,
                assignedToId: t.assigned_to_id,
                resolutionNotes: t.resolution_notes
            }));
        } catch (e) {
            this.useMock = true;
            return this.getTickets(user);
        }
    }

    async createTicket(ticketData: Partial<Ticket>, user: User): Promise<void> {
        let assignedRole = UserRole.Admin;
        if (ticketData.category === TicketCategory.Academic) {
            assignedRole = UserRole.Faculty;
        }

        const newPriority = ticketData.priority || TicketPriority.Medium;

        if (this.useMock) {
            const newTicket: Ticket = {
                id: `T-${Math.floor(Math.random() * 10000)}`,
                title: ticketData.title!,
                category: ticketData.category!,
                description: ticketData.description,
                status: TicketStatus.Pending,
                priority: newPriority,
                createdAt: new Date().toISOString(),
                submittedBy: user.id,
                submittedByName: user.name,
                assignedToRole: assignedRole
            };
            this.mockTickets = [newTicket, ...this.mockTickets];
            
            this.mockTicketHistory.push({
                id: `H-${Date.now()}`,
                ticketId: newTicket.id,
                action: 'Ticket Created',
                actorName: user.name,
                timestamp: new Date().toISOString()
            });

            return;
        }

        const { error } = await supabase.from('tickets').insert({
            title: ticketData.title,
            category: ticketData.category,
            description: ticketData.description,
            status: TicketStatus.Pending,
            priority: newPriority,
            submitted_by: user.id,
            assigned_to_role: assignedRole
        });

        if (error) throw error;
    }

    async updateTicketStatus(id: string, status: TicketStatus, resolverUser: User, resolutionNotes?: string): Promise<void> {
        const historyAction = resolutionNotes 
            ? `Status updated to ${status} with resolution: "${resolutionNotes}"`
            : `Status updated to ${status}`;

        if (this.useMock) {
            this.mockTickets = this.mockTickets.map(t => 
                t.id === id ? { ...t, status, resolutionNotes: resolutionNotes || t.resolutionNotes } : t
            );
            
            this.mockTicketHistory.push({
                id: `H-${Date.now()}`,
                ticketId: id,
                action: historyAction,
                actorName: resolverUser.name,
                timestamp: new Date().toISOString()
            });
            
            const ticket = this.mockTickets.find(t => t.id === id);
            if (ticket) {
                this.mockNotifications.unshift({
                    id: `n-${Date.now()}`,
                    title: 'Ticket Update',
                    message: `Ticket #${ticket.id} is now ${status}.`,
                    type: 'info',
                    timestamp: new Date().toISOString(),
                    read: false
                });
            }
            return;
        }

        const updates: any = { status };
        if (status === TicketStatus.Resolved) {
            updates.assigned_to_id = resolverUser.id;
            if (resolutionNotes) updates.resolution_notes = resolutionNotes;
        }

        const { error } = await supabase
            .from('tickets')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    }

    async getTicketHistory(ticketId: string): Promise<TicketHistoryEntry[]> {
        if (this.useMock) {
            return this.mockTicketHistory
                .filter(h => h.ticketId === ticketId)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        return [];
    }

    async createAnnouncement(announcement: Partial<Announcement>, user: User): Promise<void> {
        if (this.useMock) {
            const newAnn: Announcement = {
                id: `A-${Date.now()}`,
                title: announcement.title || 'Untitled',
                content: announcement.content || '',
                date: new Date().toISOString().split('T')[0],
                isNiatNews: announcement.isNiatNews || false,
                authorId: user.id
            };
            this.mockAnnouncements.unshift(newAnn);
            return;
        }
        const { error } = await supabase.from('announcements').insert({
            title: announcement.title,
            content: announcement.content,
            is_niat_news: announcement.isNiatNews,
            posted_by: user.id
        });
        if (error) throw error;
    }

    async updateNotificationPreferences(userId: string, prefs: NotificationPreferences): Promise<void> {
        if (this.useMock) {
            const stored = localStorage.getItem('mock_session_user');
            if (stored) {
                const user = JSON.parse(stored) as User;
                if (user.id === userId) {
                    user.notificationPreferences = prefs;
                    localStorage.setItem('mock_session_user', JSON.stringify(user));
                    Object.values(MOCK_PROFILE_DATA).forEach(u => {
                        if (u.id === userId) u.notificationPreferences = prefs;
                    });
                }
            }
            return;
        }
        await supabase.from('profiles').update({ preferences: prefs }).eq('id', userId);
    }

    async getPermissions(user: User): Promise<PermissionRequest[]> {
        if (this.useMock) {
            let permissions = this.mockPermissions;
            if (user.role !== UserRole.Admin) {
                permissions = permissions.filter(p => p.requesterId === user.id);
            }
            return permissions;
        }

        try {
            const { data, error } = await supabase
                .from('permission_requests')
                .select(`
                    *,
                    profiles:requester_id (name, role)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map((r: any) => ({
                id: r.id,
                type: r.type,
                details: r.details,
                status: r.status as PermissionStatus,
                date: r.created_at.split('T')[0],
                requesterId: r.requester_id,
                requesterName: r.profiles?.name || 'Unknown',
                requesterRole: r.profiles?.role || UserRole.Student,
                approverId: r.approver_id
            }));
        } catch (e) {
            this.useMock = true;
            return this.getPermissions(user);
        }
    }

    async createPermissionRequest(request: Partial<PermissionRequest>, user: User): Promise<void> {
        if (this.useMock) {
            this.mockPermissions.unshift({
                id: `REQ-${Date.now()}`,
                type: request.type!,
                details: request.details!,
                requesterId: user.id,
                requesterName: user.name,
                requesterRole: user.role,
                status: PermissionStatus.Pending,
                date: new Date().toISOString()
            });
            return;
        }

        const { error } = await supabase.from('permission_requests').insert({
            type: request.type,
            details: request.details,
            requester_id: user.id,
            status: 'Pending'
        });

        if (error) throw error;
    }

    async updatePermissionStatus(id: string, status: PermissionStatus, approverId: string): Promise<void> {
        if (this.useMock) {
            this.mockPermissions = this.mockPermissions.map(p => p.id === id ? { ...p, status } : p);
            return;
        }

        const { error } = await supabase
            .from('permission_requests')
            .update({ 
                status: status,
                approver_id: approverId
            })
            .eq('id', id);

        if (error) throw error;
    }

    async getNotifications(userId: string): Promise<AppNotification[]> {
        if (this.useMock) {
            return this.mockNotifications;
        }
        return [];
    }

    async markNotificationRead(id: string): Promise<void> {
        if (this.useMock) {
            this.mockNotifications = this.mockNotifications.map(n => n.id === id ? { ...n, read: true } : n);
            return;
        }
    }

    async getDashboardStats(user: User) {
        if (this.useMock) {
            if (user.role === UserRole.Student) return { openTickets: 2, feePending: 40000 };
            if (user.role === UserRole.Faculty) return { studentCount: 120, pendingApprovals: 3, avgAttendance: 88, researchPapers: 5 };
            return { totalUsers: 3450, totalTickets: 156, pendingTickets: 12, systemHealth: 98, activeDrives: 4 };
        }

        try {
            if (user.role === UserRole.Student) {
                const { count } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('submitted_by', user.id).neq('status', 'Resolved');
                return { openTickets: count || 0, feePending: 40000 };
            }
            if (user.role === UserRole.Admin) {
                const { count: pending } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
                const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                return { totalUsers: users || 0, pendingTickets: pending || 0, systemHealth: 99, activeDrives: 4 };
            }
            return {};
        } catch (e) {
            this.useMock = true;
            return this.getDashboardStats(user);
        }
    }

    async getAcademicPerformance(user: User): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 600)); 
        return MOCK_STUDENT_ACADEMICS;
    }

    async getFacultyPerformanceStats(user: User): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 600)); 
        return MOCK_FACULTY_PERFORMANCE;
    }

    async getTicketDistributionStats(): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 600)); 
        return MOCK_ADMIN_TICKETS;
    }

    async logAIInteraction(userId: string, role: string, query: string, response: string): Promise<void> {
        console.log(`[AI AUDIT] User: ${userId} (${role}) | Query: ${query}`);
    }
    
    async getUsers(): Promise<User[]> {
        if (this.useMock) return Object.values(MOCK_PROFILE_DATA);
        
        try {
            const { data, error } = await supabase.from('profiles').select('*');
            if(error) throw error;
            return data.map(mapProfileToUser);
        } catch (e) {
            this.useMock = true;
            return this.getUsers();
        }
    }

    async deleteUser(userId: string): Promise<void> {
        if(this.useMock) return;
        console.warn("Delete User requires Admin API Edge Function");
    }
    
    async updateUser(user: User): Promise<void> {
         if(this.useMock) return;
         await supabase.from('profiles').update({ role: user.role }).eq('id', user.id);
    }

    getTicketStatsByCategory(): any[] {
        return MOCK_ADMIN_TICKETS;
    }
}

export const db = new DatabaseService();
