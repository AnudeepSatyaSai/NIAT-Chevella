
import React from 'react';
import { UserRole, Ticket, TicketStatus, TicketCategory, TicketPriority, Announcement, PermissionRequest, PermissionStatus, Profile, Course, TimetableEntry, PlacementDrive, PlacementStatus, BuildingConfig } from './types';

// --- Icons ---
export const LayoutDashboard = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
export const UserCircle = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>;
export const BookOpen = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
export const Book = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
export const Calendar = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>;
export const TicketIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>;
export const Shield = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>;
export const Briefcase = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
export const Bell = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
export const Map = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>;
export const UserPlus = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>;
export const Users = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
export const LogOut = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
export const Menu = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
export const X = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="6 6 18 18"/></svg>;
export const Bot = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
export const Send = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
export const TrendingUp = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
export const Target = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
export const DollarSign = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
export const Building = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>;
export const FileText = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
export const CalendarDays = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>;
export const Search = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;


export const THEME_COLORS = {
    primary: 'cyan',
    secondary: 'lime',
};

export const NAV_LINKS = [
    { name: 'Home', href: '#' },
    { name: 'About Us', href: '#about' },
    { name: 'Programs', href: '#programs' },
    { name: 'Life at NIAT', href: '#campus' },
    { name: 'Placements', href: '#placements' },
    { name: 'Admissions', href: '#admissions' },
    { name: 'Contact', href: '#contact' },
    { name: 'Student Login', href: 'https://learning.ccbp.in/', external: true },
];

export const PLACEMENT_PARTNERS = [
    'https://cdn.worldvectorlogo.com/logos/google-2015.svg',
    'https://cdn.worldvectorlogo.com/logos/microsoft.svg',
    'https://cdn.worldvectorlogo.com/logos/amazon-2.svg',
    'https://cdn.worldvectorlogo.com/logos/meta-1.svg',
    'https://cdn.worldvectorlogo.com/logos/apple-13.svg',
    'https://cdn.worldvectorlogo.com/logos/netflix-3.svg',
    'https://cdn.worldvectorlogo.com/logos/salesforce-2.svg',
    'https://cdn.worldvectorlogo.com/logos/oracle-6.svg',
    'https://cdn.worldvectorlogo.com/logos/adobe-2.svg',
    'https://cdn.worldvectorlogo.com/logos/ibm.svg',
    'https://cdn.worldvectorlogo.com/logos/intel.svg',
    'https://cdn.worldvectorlogo.com/logos/cisco.svg',
];

export const PROGRAMS = [
    { name: 'CSE (AI & ML)', description: 'Specialized B.Tech program focusing on Neural Networks, Deep Learning, and building intelligent systems.', icon: '🧠' },
    { name: 'CSE (Data Science)', description: 'Master Big Data, Analytics, and Statistical Modeling to drive data-driven decisions.', icon: '📊' },
    { name: 'CSE (Cyber Security)', description: 'Defend digital infrastructure with advanced cryptography, network security, and ethical hacking.', icon: '🛡️' },
    { name: 'ECE (IoT)', description: 'Bridge the physical and digital worlds with Electronics and Internet of Things smart systems.', icon: '🌐' },
];

export const WHY_NIAT_FEATURES = [
    { title: "India's 1st 4.0 Institute", desc: "Pioneering Industry 4.0 education with NxtWave's proven curriculum.", icon: "🚀" },
    { title: "Industry-Ready Certification", desc: "IRC curriculum ensures you are job-ready from Day 1, not just after 4 years.", icon: "📜" },
    { title: "Maang Mentorship", desc: "Get guided by professionals from Google, Amazon, Microsoft, and Meta.", icon: "👨‍🏫" },
    { title: "Reversed Engineering", desc: "Practical-first approach: Build, Break, Learn, Repeat.", icon: "🛠️" },
    { title: "High-End Infrastructure", desc: "Labs equipped with AR/VR, Robotics, and High-Performance Computing clusters.", icon: "🏢" },
    { title: "Proven Placements", desc: "Join a legacy of students placed in 3000+ companies worldwide.", icon: "🌍" },
];

export const CAMPUS_GALLERY = [
    { src: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2586&auto=format&fit=crop", alt: "Administrative Block", caption: "Iconic Campus" },
    { src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670&auto=format&fit=crop", alt: "Hackathon", caption: "Coding Culture" },
    { src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2670&auto=format&fit=crop", alt: "Auditorium", caption: "Tech Talks & Events" },
    { src: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=2574&auto=format&fit=crop", alt: "Library", caption: "24/7 Digital Library" },
    { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop", alt: "Workshops", caption: "Industry Workshops" },
    { src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop", alt: "Classrooms", caption: "Smart Classrooms" },
];

export const STUDENT_TESTIMONIALS = [
    { name: "Rahul K.", role: "SDE at Amazon", text: "The CCBP curriculum at NIAT changed my life. I moved from zero coding knowledge to a product-based company offer." },
    { name: "Sneha R.", role: "Data Analyst at Deloitte", text: "The practical approach to learning Python and SQL helped me crack the interview easily. Highly recommended!" },
    { name: "Amit V.", role: "AI Engineer", text: "The labs here are world-class. Working on real-time IoT and ML projects gave me the edge I needed." },
];

export const RESEARCH_AREAS = [
    { title: 'AR/VR Lab', description: 'Immersive technologies lab for building next-gen Metaverse and Augmented Reality applications.', icon: '👓' },
    { title: 'Robotics & Automation', description: 'Advanced robotics workshop for designing autonomous agents and industrial automation.', icon: '🤖' },
    { title: 'IoT Smart Grid', description: 'Hands-on Internet of Things laboratory for smart home and industrial sensor networks.', icon: '📡' },
    { title: 'High Performance Computing', description: 'Supercomputing infrastructure for training massive AI models and simulations.', icon: '💻' },
];

export const ADMISSION_STEPS = [
    { step: '01', title: 'Application', description: 'Submit your application online or visit the Chevella campus.' },
    { step: '02', title: 'Assessment', description: 'Qualify via EAMCET, JEE Main, or NIAT Entrance Test.' },
    { step: '03', title: 'Interview', description: 'Personal interview with faculty for assessment of aptitude.' },
    { step: '04', title: 'Admission', description: 'Final document verification and fee payment to secure your seat.' },
];

export const METRICS = [
    { value: 100, label: "Placement Assistance", suffix: "%" },
    { value: 3000, label: "Alumni Network", suffix: "+" },
    { value: 50, label: "LPA Highest Package", suffix: "L" },
    { value: 150, label: "Industry Partners", suffix: "+" }
];

// --- Mock Data for Dashboard ---

export const MOCK_STUDENT_ACADEMICS = [
    { name: 'Sem 1', gpa: 8.2, attendance: 92 },
    { name: 'Sem 2', gpa: 8.5, attendance: 88 },
    { name: 'Sem 3', gpa: 8.1, attendance: 85 },
    { name: 'Sem 4', gpa: 8.9, attendance: 90 },
    { name: 'Sem 5', gpa: 9.2, attendance: 94 },
];

export const MOCK_FACULTY_PERFORMANCE = [
    { name: 'Assignment 1', avgScore: 78, submissionRate: 92 },
    { name: 'Mid Term', avgScore: 82, submissionRate: 100 },
    { name: 'Project', avgScore: 85, submissionRate: 88 },
    { name: 'Assignment 2', avgScore: 75, submissionRate: 95 },
];

export const MOCK_ADMIN_TICKETS = [
    { name: 'IT Support', value: 40 },
    { name: 'Maintenance', value: 30 },
    { name: 'Hostel', value: 15 },
    { name: 'Academic', value: 10 },
    { name: 'Other', value: 5 },
];

export const FEES_DATA = {
    totalDue: 150000,
    paid: 110000,
    pending: 40000,
    nextDueDate: '15th Oct 2024'
};

export const EXAM_RESULTS_DATA = [
    { subject: 'Data Structures', marks: 85, grade: 'A', status: 'Passed' },
    { subject: 'Operating Systems', marks: 78, grade: 'B+', status: 'Passed' },
    { subject: 'Database Mgmt', marks: 92, grade: 'O', status: 'Passed' },
    { subject: 'Computer Networks', marks: 74, grade: 'B', status: 'Passed' },
];

export const MOCK_TICKETS: Ticket[] = [
    { id: 'T-1001', title: 'Projector not working in Lab 3', category: TicketCategory.IT, status: TicketStatus.Pending, priority: TicketPriority.Medium, createdAt: '2024-06-15', submittedBy: 'F001', description: 'HDMI cable seems broken.' },
    { id: 'T-1002', title: 'Water leakage in Hostel B', category: TicketCategory.Hostel, status: TicketStatus.InProgress, priority: TicketPriority.High, createdAt: '2024-06-14', submittedBy: 'S001', description: 'Room 302 bathroom tap leaking.' },
    { id: 'T-1003', title: 'Library Wifi Slow', category: TicketCategory.IT, status: TicketStatus.Resolved, priority: TicketPriority.Low, createdAt: '2024-06-10', submittedBy: 'S002', description: 'Cannot download research papers.' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'A1', title: 'Hackathon Registration Open', content: 'Register for the annual code fest by Friday.', date: '2024-06-20', isNiatNews: true },
    { id: 'A2', title: 'New AI Model Released', content: 'Google releases Gemini 2.5 with enhanced reasoning.', date: '2024-06-18', isNiatNews: false },
    { id: 'A3', title: 'Campus Maintenance Schedule', content: 'Power outage expected on Saturday 2pm-4pm.', date: '2024-06-19', isNiatNews: true },
];

export const MOCK_COURSES: Course[] = [
    { id: 'C101', code: 'CS301', name: 'Machine Learning', instructor: 'Dr. E. Reed', instructorId: 'F001', progress: 75, credits: 4, grade: 'A' },
    { id: 'C102', code: 'CS304', name: 'Web Development', instructor: 'Prof. A. Grant', instructorId: 'F002', progress: 45, credits: 3, grade: 'In Progress' },
    { id: 'C103', code: 'HS201', name: 'Soft Skills', instructor: 'Mrs. S. Lee', instructorId: 'F003', progress: 90, credits: 2, grade: 'O' },
];

export const MOCK_TIMETABLE: Record<string, TimetableEntry[]> = {
    'Monday': [
        { course: 'Machine Learning', time: '09:00 - 10:00', room: 'C301' },
        { course: 'Web Development', time: '11:00 - 12:00', room: 'Lab 2' },
    ],
    'Tuesday': [
        { course: 'Soft Skills', time: '10:00 - 11:00', room: 'Sem Hall 1' },
        { course: 'Machine Learning', time: '14:00 - 15:00', room: 'C301' },
    ],
    'Wednesday': [
         { course: 'Web Development', time: '09:00 - 11:00', room: 'Lab 2' },
    ],
    'Thursday': [
        { course: 'Machine Learning', time: '11:00 - 12:00', room: 'C301' },
    ],
    'Friday': [
        { course: 'Soft Skills', time: '15:00 - 16:00', room: 'Sem Hall 1' },
    ]
};

export const MOCK_PLACEMENTS: PlacementDrive[] = [
    { id: 'P1', company: 'Google', companyLogo: 'https://cdn.worldvectorlogo.com/logos/google-2015.svg', role: 'SDE Intern', ctc: '12 LPA', status: PlacementStatus.Open },
    { id: 'P2', company: 'Amazon', companyLogo: 'https://cdn.worldvectorlogo.com/logos/amazon-2.svg', role: 'Software Engineer', ctc: '24 LPA', status: PlacementStatus.Applied },
    { id: 'P3', company: 'TCS', companyLogo: 'https://cdn.worldvectorlogo.com/logos/tcs-2.svg', role: 'System Engineer', ctc: '7 LPA', status: PlacementStatus.Closed },
];

export const MOCK_PERMISSIONS: PermissionRequest[] = [
    { id: 'REQ-001', type: 'Out Pass', requesterId: 'S001', requesterName: 'Alex Johnson', requesterRole: UserRole.Student, status: PermissionStatus.Pending, details: 'Going home for weekend', date: '2024-06-21' },
    { id: 'REQ-002', type: 'Event Hosting', requesterId: 'S002', requesterName: 'Priya Sharma', requesterRole: UserRole.Student, status: PermissionStatus.Approved, details: 'Coding Club Meetup', date: '2024-06-18' },
];

export const MOCK_PROFILE_DATA: Record<UserRole, Profile> = {
    [UserRole.Student]: {
        id: 'S001',
        name: 'Alex Johnson',
        role: UserRole.Student,
        email: 'alex.j@niat.edu',
        avatarUrl: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Alex',
        program: 'B.Tech CSE (AI & ML)',
        about: 'Passionate about Artificial Intelligence and building scalable web applications. Lead of the NIAT Coding Club.',
        skills: ['Python', 'React', 'TensorFlow', 'Node.js', 'C++']
    },
    [UserRole.Faculty]: {
        id: 'F001',
        name: 'Dr. Evelyn Reed',
        role: UserRole.Faculty,
        email: 'e.reed@niat.edu',
        avatarUrl: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Evelyn',
        department: 'Computer Science & Engineering',
        about: 'Ph.D. in Neural Networks with 10 years of teaching experience. Research interests include Deep Learning and Computer Vision.',
        skills: ['Machine Learning', 'Curriculum Design', 'Python', 'Research', 'Mentoring']
    },
    [UserRole.Admin]: {
        id: 'A001',
        name: 'Marcus Chen',
        role: UserRole.Admin,
        email: 'm.chen@niat.edu',
        avatarUrl: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Marcus',
        department: 'Administration',
        about: 'Overseeing campus operations and digital infrastructure. Committed to providing a seamless experience for students and faculty.',
        skills: ['Management', 'System Administration', 'Communication', 'Logistics']
    }
};

// Mock layout for BITS/NIAT Chevella Campus
export const CAMPUS_BUILDINGS: BuildingConfig[] = [
    { id: 'b1', name: 'Admin Block', position: [0, 0, 0], size: [6, 5, 6], color: '#06b6d4', description: 'Admissions, Accounts, and Principal Office.', status: 'Open' },
    { id: 'b2', name: 'CSE Dept', position: [12, 0, 5], size: [5, 8, 5], color: '#8b5cf6', description: 'Labs 1-4, Server Room, Faculty Cabins.', status: 'Busy' },
    { id: 'b3', name: 'ECE Dept', position: [12, 0, -5], size: [5, 7, 5], color: '#a3e635', description: 'IoT Lab, VLSI Lab, Robotics Center.', status: 'Classes' },
    { id: 'b4', name: 'Library', position: [-12, 0, 0], size: [5, 4, 8], color: '#f59e0b', description: 'Central Library and Digital Resource Center.', status: 'Quiet' },
    { id: 'b5', name: 'Auditorium', position: [0, 0, -12], size: [8, 5, 5], color: '#ec4899', description: 'Main venue for events and seminars.', status: 'Event' },
    { id: 'b6', name: 'Cafeteria', position: [0, 0, 12], size: [6, 3, 4], color: '#f43f5e', description: 'Food court and recreation area.', status: 'Open' },
    { id: 'b7', name: 'Hostels', position: [-15, 0, -15], size: [4, 10, 10], color: '#10b981', description: 'Student accommodation blocks.', status: 'Restricted' },
];

// --- Navigation Configuration ---

export const MASTER_NAV_CONFIG = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard, roles: [UserRole.Student, UserRole.Faculty, UserRole.Admin] },
    { name: 'Profile', id: 'profile', icon: UserCircle, roles: [UserRole.Student, UserRole.Faculty, UserRole.Admin] },
    { name: 'My Learning', id: 'learning', icon: BookOpen, roles: [UserRole.Student] },
    { name: 'Courses', id: 'courses', icon: Book, roles: [UserRole.Student, UserRole.Faculty, UserRole.Admin] }, 
    { name: 'Timetable', id: 'timetable', icon: Calendar, roles: [UserRole.Student, UserRole.Faculty] },
    { name: 'Support Tickets', id: 'tickets', icon: TicketIcon, roles: [UserRole.Student, UserRole.Faculty, UserRole.Admin] },
    { name: 'Permissions', id: 'permissions', icon: Shield, roles: [UserRole.Student, UserRole.Faculty, UserRole.Admin] },
    { name: 'Placements', id: 'placements', icon: Briefcase, roles: [UserRole.Student, UserRole.Admin] },
    { name: 'Announcements', id: 'announcements', icon: Bell, roles: [UserRole.Student, UserRole.Faculty, UserRole.Admin] },
    { name: 'Campus Map', id: 'map', icon: Map, roles: [UserRole.Student, UserRole.Faculty, UserRole.Admin] },
    { name: 'Enrollment', id: 'enrollment', icon: UserPlus, roles: [UserRole.Admin] },
    { name: 'User Management', id: 'users', icon: Users, roles: [UserRole.Admin] },
];

export const getNavLinks = (role: UserRole) => {
    return MASTER_NAV_CONFIG.filter(link => link.roles.includes(role));
};
