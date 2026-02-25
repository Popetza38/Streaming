import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Platform = 'dramabox' | 'shortmax' | 'shortbox';

interface PlatformState {
    platform: Platform;
    setPlatform: (platform: Platform) => void;
}

export const usePlatform = create<PlatformState>()(
    persist(
        (set) => ({
            platform: 'dramabox',
            setPlatform: (platform) => set({ platform }),
        }),
        {
            name: 'dramapop-platform',
        }
    )
);

export const platforms = [
    { id: 'dramabox' as Platform, name: 'DramaBox', icon: '🎬', logo: '/logos/dramabox.png', color: '#e50914' },
    { id: 'shortmax' as Platform, name: 'ShortMax', icon: '📺', logo: '/logos/shortmax.png', color: '#7c3aed' },
    { id: 'shortbox' as Platform, name: 'ShortBox', icon: '📦', logo: '/logos/shortbox.png', color: '#a855f7' },
];
