
import { useState } from 'react';
import { UserRole, User } from '../types';
import { MOCK_TIMETABLE, CAMPUS_BUILDINGS, MOCK_PLACEMENTS, MOCK_ANNOUNCEMENTS } from '../constants';
import { GoogleGenAI } from "@google/genai";

// Updated: Now utilizes the actual Google GenAI SDK while preserving local knowledge base and RBAC logic
export const useMockGemini = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getResponse = async (prompt: string, user: User): Promise<string> => {
        setIsLoading(true);
        try {
            // Initialize the AI client with the system-provided API key
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Construct a comprehensive system instruction incorporating local mock data for context-aware responses
            const systemInstruction = `
                You are the NIAT (NxtWave Institute of Advanced Technologies) AI Assistant for the Chevella Campus.
                
                Context for current user:
                - Name: ${user.name}
                - Role: ${user.role}
                - Program/Department: ${user.program || user.department || 'N/A'}
                - GPA: ${user.gpa || 'N/A'}
                - Attendance: ${user.attendance || 0}%

                Campus Data:
                - Buildings & Status: ${JSON.stringify(CAMPUS_BUILDINGS)}
                - Monday Schedule (Use for availability queries): ${JSON.stringify(MOCK_TIMETABLE['Monday'])}
                - Placement Drives: ${JSON.stringify(MOCK_PLACEMENTS)}
                - News & Bulletins: ${JSON.stringify(MOCK_ANNOUNCEMENTS)}

                Security Guidelines (RBAC):
                1. Students are strictly prohibited from accessing administrative data like salaries, private staff info, or system server logs.
                2. Faculty cannot access system-level root configurations or administrative audit trails.
                
                Behavioral Instructions:
                - Provide specific answers based on the provided Campus Data whenever possible.
                - If a room is mentioned in the schedule for Monday, mark it as "OCCUPIED" for today.
                - Be concise, helpful, and maintain a professional yet approachable tone.
            `;

            // Query the model using the recommended gemini-3-pro-preview for complex reasoning tasks
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                },
            });

            // Extract the generated text (not a function call)
            return response.text || "I apologize, but I encountered an error generating a response.";
        } catch (error) {
            console.error("Gemini API Error:", error);
            return "Connection to the NIAT AI Hub was lost. Please verify your network and try again.";
        } finally {
            setIsLoading(false);
        }
    };

    return { getResponse, isLoading };
};
