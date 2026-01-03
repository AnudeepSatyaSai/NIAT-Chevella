
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { useMockGemini } from '../../hooks/useMockGemini';
import { Bot, Send, X } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssistHubStore } from '../../store/assistHubStore';
import { db } from '../../services/database';
import { renderSafe } from '../Shared';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

// Added missing interface definition for AIChatbot props
interface AIChatbotProps {
    user: User;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const { getResponse, isLoading } = useMockGemini();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { activeView } = useAssistHubStore();

    useEffect(() => {
        setMessages([
            { sender: 'ai', text: `Hello ${user.name.split(' ')[0]}! I'm your AI Assistant. How can I help you with your ${activeView} today?` }
        ]);
    }, [user.name, activeView]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + K toggles the assistant
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const getSuggestions = () => {
        const roleSpecific = user.role === UserRole.Admin 
            ? ['System Status', 'Pending Tickets'] 
            : user.role === UserRole.Faculty 
                ? ['My Schedule', 'Student Attendance'] 
                : ['My Grades', 'Next Class'];

        const viewSpecific: Record<string, string[]> = {
            dashboard: ['Campus News', 'Recent Alerts'],
            timetable: ['Is Lab 2 free?', 'Full schedule'],
            courses: ['Syllabus', 'My Progress'],
            placements: ['Open drives', 'Resume tips'],
            map: ['Where is the library?', 'Find Admin Block'],
            tickets: ['Raise IT ticket', 'Ticket status'],
            permissions: ['Status of my request', 'New pass'],
        };

        const specific = viewSpecific[activeView] || [];
        return Array.from(new Set([...specific, ...roleSpecific])).slice(0, 3);
    };

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (textToSend.trim() === '' || isLoading) return;
        
        const userMessage: Message = { sender: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        const aiResponseText = await getResponse(textToSend, user);
        db.logAIInteraction(user.id, user.role, textToSend, aiResponseText);

        const aiMessage: Message = { sender: 'ai', text: aiResponseText };
        setMessages(prev => [...prev, aiMessage]);
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative group bg-cyan-500 text-black rounded-full p-4 shadow-xl shadow-cyan-500/40"
                    aria-label="Toggle AI Assistant (Ctrl+K)"
                    title="Toggle AI Assistant (Ctrl+K)"
                >
                    <span className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-20"></span>
                    <Bot className="w-8 h-8 relative z-10" />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-96 h-[600px] max-h-[80vh] flex flex-col z-50"
                    >
                        {/* HUD Border Container */}
                        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden clip-path-hud">
                            {/* Decorative Grid Background */}
                            <div className="absolute inset-0 opacity-10" style={{ 
                                backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(to right, cyan 1px, transparent 1px)', 
                                backgroundSize: '20px 20px' 
                            }}></div>
                        </div>

                        {/* Header */}
                        <div className="relative z-10 flex items-center justify-between p-4 border-b border-cyan-500/20 bg-gray-900/50">
                            <div className="flex items-center space-x-3">
                                <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/30">
                                    <Bot className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm tracking-wide uppercase">NIAT Assistant</h3>
                                    <p className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono uppercase">
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_5px_cyan]"></span>
                                        Ready • Ctrl+K
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="relative z-10 flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                            {messages.map((msg, index) => (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed border backdrop-blur-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-cyan-600/90 text-white rounded-br-sm border-cyan-500 shadow-[0_4px_15px_rgba(8,145,178,0.3)]' 
                                            : 'bg-gray-800/80 text-slate-200 rounded-bl-sm border-gray-700'
                                    }`}>
                                        <p>{renderSafe(msg.text)}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-800/80 border border-gray-700 flex items-center space-x-1.5">
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions */}
                        <div className="relative z-10 px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-cyan-500/10 bg-black/20">
                            {getSuggestions().map((s, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleSend(s)} 
                                    className="text-[10px] font-medium bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-md whitespace-nowrap hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all uppercase tracking-wide"
                                >
                                    {renderSafe(s)}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="relative z-10 p-4 pt-2 bg-gray-900/80 border-t border-gray-700">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your query..."
                                    className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600 transition-all"
                                    autoFocus
                                />
                                <button 
                                    onClick={() => handleSend()} 
                                    disabled={isLoading || !input.trim()} 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 rounded-lg text-black hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 transition-all shadow-lg shadow-cyan-500/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;
