
export enum UserRole {
    Student = 'Student',
    Faculty = 'Faculty',
    Admin = 'Admin',
}

export enum TicketStatus {
    Pending = 'Pending',
    InProgress = 'In Progress',
    Resolved = 'Resolved',
    Closed = 'Closed'
}

export enum TicketPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High'
}

export enum TicketCategory {
    Water = 'Water',
    Hostel = 'Hostel/Accommodation',
    Maintenance = 'Campus Maintenance',
    IT = 'IT Support',
    Academic = 'General Enquiry/Academic',
    Infrastructure = 'Infrastructure/Lab'
}

export interface TicketHistoryEntry {
    id: string;
    ticketId: string;
    action: string; // e.g. "Status changed to Resolved"
    actorName: string; // Who did it
    timestamp: string;
}

// Table: Tickets
export interface Ticket {
    id: string; // PK
    title: string;
    category: TicketCategory;
    submittedBy: string; // FK -> profiles.id
    submittedByName?: string; // Denormalized from join
    assignedToRole?: UserRole; // Enum
    assignedToId?: string; // FK -> profiles.id
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string;
    description?: string;
    resolutionNotes?: string;
}

// Table: Announcements
export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string; // created_at in DB
    authorId?: string; // posted_by in DB
    isNiatNews: boolean; // mapped from is_niat_news
    visibility?: 'All' | 'Student' | 'Faculty';
}

export enum PermissionStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
}

export enum PermissionType {
    LabAccess = 'Lab Access',
    Leave = 'Leave Request',
    EventHosting = 'Event Hosting',
    ResourceProcurement = 'Resource Procurement'
}

// Table: PermissionRequests
export interface PermissionRequest {
    id: string; // PK
    type: PermissionType | string;
    requesterId: string; // FK -> profiles.id
    requesterName: string; // Joined
    requesterRole: UserRole; // Joined
    approverId?: string; // FK -> profiles.id
    status: PermissionStatus;
    details: string;
    date: string; // created_at
}

export interface NotificationPreferences {
    ticketUpdates: boolean;
    announcements: boolean;
    placements: boolean;
    events: boolean;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
}

// Table: Profiles (Users)
export interface User {
    id: string; // PK (UUID)
    name: string;
    role: UserRole;
    email: string;
    avatarUrl: string;
    program?: string; // Student specific
    department?: string; // Faculty specific
    about?: string;
    skills?: string[];
    gpa?: number;
    attendance?: number;
    notificationPreferences?: NotificationPreferences;
}

// Re-export Profile as User for compatibility if needed
export type Profile = User;

export interface Course {
    id: string;
    code: string;
    name: string;
    instructorId: string;
    instructor: string;
    progress: number;
    grade?: string;
    credits: number;
}

export interface TimetableEntry {
    courseId?: string;
    course: string;
    room: string;
    time: string; 
}

export enum PlacementStatus {
    Open = 'Open for Applications',
    Applied = 'Applied',
    Shortlisted = 'Shortlisted',
    Interview = 'Interview Scheduled',
    Offered = 'Offered',
    Closed = 'Closed'
}

// Table: PlacementDrives
export interface PlacementDrive {
    id: string;
    company: string;
    companyLogo: string;
    role: string;
    ctc: string;
    status: PlacementStatus;
    postedBy?: string;
}

export interface BuildingConfig {
    id: string;
    name: string;
    position: [number, number, number];
    size: [number, number, number];
    color: string;
    description: string;
    status: string;
}
