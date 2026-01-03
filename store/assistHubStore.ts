
import { create } from 'zustand';

interface AssistHubState {
    activeView: string;
    setActiveView: (view: string) => void;
}

export const useAssistHubStore = create<AssistHubState>((set) => ({
    activeView: 'dashboard',
    setActiveView: (view) => set({ activeView: view }),
}));
