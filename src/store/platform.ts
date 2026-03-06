import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Platform = 'dramabox' | 'shortmax' | 'shortbox' | 'flextv' | 'dramapops' | 'dramabite' | 'fundrama';

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
    { id: 'dramabite' as Platform, name: 'DramaBite', icon: '🎬', logo: '/logos/dramabite.png', color: '#10b981' },
    { id: 'dramabox' as Platform, name: 'DramaBox', icon: '🎬', logo: '/logos/dramabox.png', color: '#e50914' },
    { id: 'dramapops' as Platform, name: 'DramaPops', icon: '🍿', logo: '/logos/dramapops.png', color: '#10b981' },
    { id: 'flextv' as Platform, name: 'FlexTV', icon: '📱', logo: '/logos/flextv.png', color: '#3b82f6' },
    { id: 'fundrama' as Platform, name: 'FunDrama', icon: '�', logo: '/logos/fundrama.png', color: '#f59e0b' },
    { id: 'shortbox' as Platform, name: 'ShortBox', icon: '📦', logo: '/logos/shortbox.png', color: '#a855f7' },
    { id: 'shortmax' as Platform, name: 'ShortMax', icon: '📺', logo: '/logos/shortmax.png', color: '#7c3aed' },
];
