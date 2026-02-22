import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryItem {
    id: string;
    name: string;
    cover: string;
    episodes: number;
    lastEpisode: number;
    source: 'shortmax' | 'dramabox';
    updatedAt: number;
}

interface HistoryState {
    items: HistoryItem[];
    addOrUpdate: (item: Omit<HistoryItem, 'updatedAt'>) => void;
    remove: (id: string) => void;
    clear: () => void;
}

export const useHistory = create<HistoryState>()(
    persist(
        (set) => ({
            items: [],

            addOrUpdate: (item) =>
                set((state) => {
                    const filtered = state.items.filter((h) => h.id !== item.id);
                    return {
                        items: [{ ...item, updatedAt: Date.now() }, ...filtered].slice(0, 100),
                    };
                }),

            remove: (id) =>
                set((state) => ({
                    items: state.items.filter((h) => h.id !== id),
                })),

            clear: () => set({ items: [] }),
        }),
        {
            name: 'dramapop-history',
        }
    )
);
