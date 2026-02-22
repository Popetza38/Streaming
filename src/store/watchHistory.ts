import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryItem {
    bookId: string;
    bookName: string;
    cover: string;
    episode: number;
    totalEpisodes: number;
    timestamp: number; // Date.now()
    videoTime: number; // seconds into the video
    videoDuration: number;
}

interface WatchHistoryState {
    history: HistoryItem[];
    save: (item: Omit<HistoryItem, 'timestamp'>) => void;
    getItem: (bookId: string) => HistoryItem | undefined;
    remove: (bookId: string) => void;
    clear: () => void;
}

const MAX_HISTORY = 50;

export const useWatchHistory = create<WatchHistoryState>()(
    persist(
        (set, get) => ({
            history: [],

            save: (item) => {
                set((state) => {
                    const filtered = state.history.filter(h => h.bookId !== item.bookId);
                    const newItem: HistoryItem = { ...item, timestamp: Date.now() };
                    return {
                        history: [newItem, ...filtered].slice(0, MAX_HISTORY),
                    };
                });
            },

            getItem: (bookId) => {
                return get().history.find(h => h.bookId === bookId);
            },

            remove: (bookId) => {
                set((state) => ({
                    history: state.history.filter(h => h.bookId !== bookId),
                }));
            },

            clear: () => set({ history: [] }),
        }),
        { name: 'dramapop-watch-history' }
    )
);
