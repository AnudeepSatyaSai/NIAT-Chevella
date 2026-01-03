
import { useState, useEffect, useCallback } from 'react';
import { MOCK_COURSES, MOCK_TIMETABLE, MOCK_PLACEMENTS, MOCK_ANNOUNCEMENTS } from '../constants';
import { Course } from '../types';

type DataType = 'courses' | 'timetable' | 'placements' | 'announcements';

export const usePortalData = <T>(type: DataType) => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Attempt to fetch from the real/proxy API (Integration point simulation)
            // In a real scenario, this endpoint would bridge NIAT and CCBP data
            // We use a short timeout to fail fast and show fallback data if 'API' is unreachable (which it is)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000); 

            // This URL is hypothetical for simulation purposes
            const response = await fetch(`https://learning-portal-api.niat.edu/api/v1/integration/${type}`, {
                signal: controller.signal,
                headers: {
                    'Authorization': 'Bearer NIAT_DEMO_TOKEN'
                }
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('API unavailable');
            }

            const result = await response.json();
            setData(result);
            setIsLive(true);
            setLastSynced(new Date());
        } catch (err) {
            // Fallback to Cached/Mock Data if live fetch fails (Offline Mode)
            setIsLive(false);
            
            // Simulate local cache processing time
            setTimeout(() => {
                switch (type) {
                    case 'courses':
                        // Add some randomization to simulate changing progress in offline mode
                        const dynamicCourses = (MOCK_COURSES as unknown as Course[]).map(c => ({
                            ...c,
                            progress: Math.min(100, Math.max(0, c.progress + Math.floor(Math.random() * 5)))
                        }));
                        setData(dynamicCourses as unknown as T);
                        break;
                    case 'timetable':
                        setData(MOCK_TIMETABLE as unknown as T);
                        break;
                    case 'placements':
                        setData(MOCK_PLACEMENTS as unknown as T);
                        break;
                    case 'announcements':
                        setData(MOCK_ANNOUNCEMENTS as unknown as T);
                        break;
                    default:
                        setData(null);
                }
                setLastSynced(new Date());
                setIsLoading(false);
            }, 800);
        }
    }, [type]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, lastSynced, isLive, refresh: fetchData, error };
};
