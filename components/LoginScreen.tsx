
import React, { useState } from 'react';
import { User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '../constants';
import { db } from '../services/database';

interface LoginScreenProps {
    onLogin: (user: User) => void;
    onClose: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onClose }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isSignUp) {
                // Sign Up Flow
                await db.signUp(email, password, name);
                
                // After successful signup (and if auto-login is possible/verified), get user
                const user = await db.getCurrentUser();
                if (user) {
                    onLogin(user);
                } else {
                    // This case handles successful signup but pending email verification (if configured in Supabase)
                    // or if using mock data which just finished 'signup'
                    // For mock, signUp sets the session, so this branch might only be hit if real DB requires verification
                    setError('Account created! Please check your email for verification link if required, or try logging in.');
                    setIsSignUp(false);
                }
            } else {
                // Sign In Flow
                const user = await db.login(email, password);
                onLogin(user);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Authentication failed. Please check your inputs.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
        >
            <motion.div
                initial={{ scale: 0.9, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-gray-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/10 w-full max-w-md p-8 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white" aria-label="Close Login">
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <h2 id="login-title" className="text-3xl font-bold text-white">NIAT <span className="text-cyan-400">Portal</span></h2>
                    <p className="mt-2 text-slate-400">
                        {isSignUp ? 'Create your Student Account' : 'Secure Access Login'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`text-sm p-3 rounded border ${error.includes('Account created') ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}
                                role="alert"
                                aria-live="polite"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                        {isSignUp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                <input 
                                    id="name"
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 mb-6"
                                    placeholder="e.g. John Doe"
                                    required={isSignUp}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <input 
                            id="email"
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            placeholder="e.g. alex.j@niat.edu"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input 
                            id="password"
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </form>
                
                <div className="mt-6 text-center">
                    <button 
                        onClick={toggleMode}
                        className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
                    </button>
                </div>

                {!isSignUp && (
                    <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 text-xs text-slate-400">
                        <p className="font-bold mb-2 text-cyan-400">Demo Credentials:</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="block text-slate-500">Student:</span>
                                <span className="font-mono">alex.j@niat.edu</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Admin:</span>
                                <span className="font-mono">m.chen@niat.edu</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Faculty:</span>
                                <span className="font-mono">e.reed@niat.edu</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Pass:</span>
                                <span className="font-mono">any</span>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default LoginScreen;
