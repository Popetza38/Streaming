import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WatchlistItem {
    id: string;
    title: string;
    image: string;
    addedAt: string;
}

interface WatchlistState {
    items: WatchlistItem[];
    add: (item: WatchlistItem) => void;
    remove: (id: string) => void;
    toggle: (item: WatchlistItem) => void;
    contains: (id: string) => boolean;
}

export const useWatchlist = create<WatchlistState>()(
    persist(
        (set, get) => ({
            items: [],
            add: (item) => set((state) => ({
                items: [item, ...state.items.filter(i => i.id !== item.id)]
            })),
            remove: (id) => set((state) => ({
                items: state.items.filter(i => i.id !== id)
            })),
            toggle: (item) => {
                const exists = get().items.some(i => i.id === item.id);
                if (exists) {
                    get().remove(item.id);
                } else {
                    get().add(item);
                }
            },
            contains: (id) => get().items.some(i => i.id === id),
        }),
        { name: 'dramapop-watchlist' }
    )
);
