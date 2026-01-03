
import React from 'react';
import { UserRole, Course } from '../../types';
import { usePortalData } from '../../hooks/usePortalData';
import { motion } from 'framer-motion';
import { Skeleton, renderSafe } from '../Shared';

const CourseCard = ({ course }: { course: Course }) => {
    const progressColor = course.progress > 75 ? 'bg-lime-500' : course.progress > 50 ? 'bg-cyan-500' : 'bg-yellow-500';

    return (
        <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-2 opacity-20">
                 <svg className="w-16 h-16 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
            </div>

            <div className="flex-grow z-10">
                <div className="flex justify-between items-start">
                    <span className="font-mono text-sm text-cyan-400">{renderSafe(course.code)}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-700 text-slate-300">{renderSafe(course.credits)} Credits</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2 mb-1">{renderSafe(course.name)}</h3>
                <p className="text-sm text-slate-400 mb-4">Instructor: {renderSafe(course.instructor)}</p>
            </div>
            <div className="z-10">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Portal Progress</span>
                    <span className="font-semibold text-white">{renderSafe(course.progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${course.progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                     <span className={`text-sm font-bold ${course.grade === 'In Progress' ? 'text-yellow-400' : 'text-lime-400'}`}>{renderSafe(course.grade)}</span>
                     <a 
                        href="https://learning.ccbp.in/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center hover:underline"
                    >
                        Continue Learning 
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

const Courses: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
    const { data: courses, isLoading, lastSynced, isLive, refresh } = usePortalData<Course[]>('courses');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center space-x-3">
                    {isLive ? (
                        <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs border border-cyan-500/30 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Connected to CCBP 4.0
                        </div>
                    ) : (
                        <div className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs border border-amber-500/30 flex items-center" title="Live connection failed, showing cached data">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                            Offline Mode (Cached)
                        </div>
                    )}
                    {lastSynced && <span className="text-xs text-slate-500">Synced: {renderSafe(lastSynced.toLocaleTimeString())}</span>}
                </div>
                
                <div className="flex space-x-2">
                     <button onClick={refresh} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-slate-300 transition-colors" title="Sync Curriculum">
                        <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                    {userRole === UserRole.Admin && (
                        <button className="bg-lime-500 hover:bg-lime-400 text-black font-bold py-2 px-4 rounded-lg">
                            Add New Course
                        </button>
                    )}
                </div>
            </div>

            {isLoading && !courses ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48" />)}
                </div>
            ) : !courses || courses.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-800/20 rounded-2xl border border-dashed border-gray-700">
                    <div className="p-6 bg-gray-800 rounded-full mb-6">
                        <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Curriculum Not Found</h3>
                    <p className="text-slate-500 text-sm max-w-sm">We couldn't retrieve any courses for your current program. Please sync again or contact the academic coordinator.</p>
                    <button onClick={refresh} className="mt-8 px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors">
                        Retry Sync
                    </button>
                </div>
            ) : (
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.05 } }
                    }}
                >
                    {courses?.map((course) => (
                        <motion.div key={course.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <CourseCard course={course} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default Courses;
