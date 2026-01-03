
import React, { useState, useEffect } from 'react';
import { User } from './types';
import PublicWebsite from './components/PublicWebsite';
import LoginScreen from './components/LoginScreen';
import AssistHub from './components/AssistHub';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './services/database';
import { supabase, isSupabaseConfigured } from './services/supabase';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on load
        const checkSession = async () => {
            const currentUser = await db.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
            setIsLoading(false);
        };

        checkSession();

        // Listen for Auth changes (e.g. token refresh, logout)
        // Only if we have a valid Supabase connection to avoid "Failed to fetch" errors
        let subscription: { unsubscribe: () => void } | null = null;

        if (isSupabaseConfigured) {
            const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                     const currentUser = await db.getCurrentUser();
                     setUser(currentUser);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
            });
            subscription = data.subscription;
        }

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const handleLogin = (user: User) => {
        setUser(user);
        setShowLogin(false);
    };

    const handleLogout = async () => {
        await db.signOut(); // Use DB service to handle both mock/real logout
        setUser(null);
    };

    const handleLoginClick = () => {
        setShowLogin(true);
    };

    const handleCloseLogin = () => {
        setShowLogin(false);
    };

    if (isLoading) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-cyan-400">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400"></div>
                <p className="mt-4 text-xl font-mono">Connecting to NIAT Database...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen text-slate-200">
            <AnimatePresence mode="wait">
                {user ? (
                    <motion.div
                        key="assist-hub"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <AssistHub user={user} onLogout={handleLogout} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="public-site"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <PublicWebsite onLoginClick={handleLoginClick} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLogin && (
                    <LoginScreen onLogin={handleLogin} onClose={handleCloseLogin} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default App;
