
import React from 'react';
import { UserRole, TimetableEntry } from '../../types';
import { usePortalData } from '../../hooks/usePortalData';
import { motion } from 'framer-motion';
import { renderSafe } from '../Shared';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
    "09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00",
    "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"
];

const courseColors = [
    'bg-cyan-800/50 border-l-4 border-cyan-400',
    'bg-lime-800/50 border-l-4 border-lime-400',
    'bg-indigo-800/50 border-l-4 border-indigo-400',
    'bg-rose-800/50 border-l-4 border-rose-400',
    'bg-amber-800/50 border-l-4 border-amber-400',
];
const courseColorMap: { [key: string]: string } = {};
let colorIndex = 0;

const Timetable: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
    const { data: timetableData, isLoading, lastSynced, refresh } = usePortalData<Record<string, TimetableEntry[]>>('timetable');
    
    const getEventForSlot = (day: string, time: string) => {
        if (!timetableData) return undefined;
        const daySchedule = timetableData[day] || [];
        return daySchedule.find(event => {
            const [startTime, endTime] = event.time.split('-').map(t => t.trim());
            const slotStartTime = time.split('-')[0].trim();
            return slotStartTime >= startTime && slotStartTime < endTime;
        });
    }

    if (isLoading && !timetableData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border border-gray-700 rounded-lg bg-gray-800">
                 <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-lime-400 font-mono animate-pulse">Fetching schedule from CCBP Servers...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-end mb-4">
                 <div>
                    <h2 className="text-xl font-bold text-white">Live Schedule</h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Synchronized with Learning Portal • Last update: {renderSafe(lastSynced?.toLocaleTimeString())}
                    </p>
                 </div>
                 <button onClick={refresh} className="text-cyan-400 hover:text-white text-sm flex items-center bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">
                    <svg className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Refresh
                 </button>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 relative overflow-hidden">
                {/* Watermark */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                    <span className="text-9xl font-bold text-white">CCBP</span>
                </div>

                <div className="overflow-x-auto">
                    <div className="grid grid-cols-6 relative z-10 min-w-[800px]">
                        <div className="text-center font-bold text-white py-2">Time</div>
                        {days.map(day => (
                            <div key={day} className="text-center font-bold text-white py-2">{renderSafe(day)}</div>
                        ))}

                        {timeSlots.map(time => (
                            <React.Fragment key={time}>
                                <div className="text-center font-mono text-sm text-slate-400 py-4 border-t border-gray-700">{renderSafe(time.split('-')[0])}</div>
                                {days.map(day => {
                                    const event = getEventForSlot(day, time);
                                    if (event && time.startsWith(event.time.split('-')[0].trim())) {

                                        if (!courseColorMap[event.course]) {
                                            courseColorMap[event.course] = courseColors[colorIndex % courseColors.length];
                                            colorIndex++;
                                        }
                                        
                                        const [startStr, endStr] = event.time.split('-').map(t => t.trim());
                                        const [startHourStr, startMinuteStr] = startStr.split(':');
                                        const [endHourStr, endMinuteStr] = endStr.split(':');

                                        const startHour = parseInt(startHourStr, 10);
                                        const startMinute = startMinuteStr ? parseInt(startMinuteStr, 10) : 0;
                                        const endHour = parseInt(endHourStr, 10);
                                        const endMinute = endMinuteStr ? parseInt(endMinuteStr, 10) : 0;

                                        const startTimeInMinutes = startHour * 60 + startMinute;
                                        const endTimeInMinutes = endHour * 60 + endMinute;

                                        const durationInMinutes = endTimeInMinutes - startTimeInMinutes;
                                        const duration = Math.ceil(durationInMinutes / 60);


                                        return (
                                            <motion.div
                                                key={`${day}-${time}`}
                                                className={`m-1 p-2 rounded-lg ${courseColorMap[event.course]} cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-center`}
                                                style={{ gridRow: `span ${duration}` }}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                                onClick={() => window.open('https://learning.ccbp.in/', '_blank')}
                                            >
                                                <p className="font-bold text-sm text-white leading-tight">{renderSafe(event.course)}</p>
                                                <p className="text-xs text-slate-300 mt-1">{renderSafe(event.room)}</p>
                                            </motion.div>
                                        );
                                    } else if (event) {
                                        return null;
                                    }
                                    return <div key={`${day}-${time}`} className="border-t border-gray-700"></div>;
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
