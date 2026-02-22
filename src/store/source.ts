import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StreamSource = 'shortmax' | 'dramabox';

interface SourceState {
    source: StreamSource;
    setSource: (source: StreamSource) => void;
}

export const useSource = create<SourceState>()(
    persist(
        (set) => ({
            source: 'dramabox',
            setSource: (source) => set({ source }),
        }),
        {
            name: 'streambox-source',
        }
    )
);
