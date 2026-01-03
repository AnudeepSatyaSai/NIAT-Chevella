
import React, { useEffect } from 'react';
import { User, UserRole } from '../types';
import { getNavLinks } from '../constants';
import { useAssistHubStore } from '../store/assistHubStore';
import Layout from './Layout';
import Dashboard from './assist-hub/Dashboard';
import Tickets from './assist-hub/Tickets';
import Announcements from './assist-hub/Announcements';
import CampusMap from './assist-hub/CampusMap';
import AIChatbot from './assist-hub/AIChatbot';
import Profile from './assist-hub/Profile';
import Courses from './assist-hub/Courses';
import Timetable from './assist-hub/Timetable';
import Placements from './assist-hub/Placements';
import Permissions from './assist-hub/Permissions';
import Learning from './assist-hub/Learning';
import Enrollment from './assist-hub/Enrollment';
import UserManagement from './assist-hub/UserManagement';
import { motion, AnimatePresence } from 'framer-motion';

interface AssistHubProps {
    user: User;
    onLogout: () => void;
}

const ViewComponent = ({ view, user }: { view: string; user: User }) => {
    switch (view) {
        case 'dashboard': return <Dashboard user={user} />;
        case 'profile': return <Profile userRole={user.role} />;
        case 'learning': return <Learning />;
        case 'courses': return <Courses userRole={user.role} />;
        case 'timetable': return <Timetable userRole={user.role} />;
        case 'tickets': return <Tickets user={user} />;
        case 'permissions': return <Permissions userRole={user.role} user={user} />;
        case 'placements': return <Placements userRole={user.role} />;
        // Fix: Announcements expects 'user' prop instead of 'userRole'
        case 'announcements': return <Announcements user={user} />;
        case 'map': return <CampusMap />;
        case 'enrollment': return <Enrollment />;
        case 'users': return <UserManagement />;
        default: return <Dashboard user={user} />;
    }
};

const AssistHub: React.FC<AssistHubProps> = ({ user, onLogout }) => {
    const { activeView, setActiveView } = useAssistHubStore();
    const navLinks = getNavLinks(user.role);

    // RBAC: Redirect to dashboard if attempting to access an unauthorized view
    useEffect(() => {
        const isValidView = navLinks.some(link => link.id === activeView);
        // Allow 'dashboard' as a fallback always, but check others
        if (!isValidView && activeView !== 'dashboard') {
            console.warn(`Unauthorized access attempt to ${activeView}. Redirecting to Dashboard.`);
            setActiveView('dashboard');
        }
    }, [activeView, navLinks, setActiveView, user.role]);

    return (
        <Layout user={user} activeView={activeView} setActiveView={setActiveView} onLogout={onLogout}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <ViewComponent view={activeView} user={user} />
                </motion.div>
            </AnimatePresence>
            <AIChatbot user={user} />
        </Layout>
    );
};

export default AssistHub;
