import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Platform = 'dramabox' | 'shortmax';

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
];
