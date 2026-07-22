import { create } from 'zustand';

export interface PlatformItem {
  id: string;
  name: string;
  badge?: string;
  status?: 'active' | 'maint';
}

export const platforms: PlatformItem[] = [
  { id: 'dramabox', name: 'DramaPop', badge: '11 ep' },
  { id: 'melolo', name: 'Melolo', badge: '17 ep' },
  { id: 'pinedrama', name: 'PineDrama', badge: '8 ep' },
  { id: 'netshort', name: 'NetShort', badge: '7 ep' },
  { id: 'shortmax', name: 'ShortMax', badge: '8 ep' },
  { id: 'flickreels', name: 'FlickReels', badge: 'Maint', status: 'maint' },
  { id: 'reelshort', name: 'ReelShort', badge: '8 ep' },
  { id: 'goodshort', name: 'GoodShort', badge: '8 ep' },
  { id: 'dramabite', name: 'DramaBite', badge: '8 ep' },
  { id: 'idrama', name: 'iDrama', badge: '6 ep' },
  { id: 'starshort', name: 'StarShort', badge: '7 ep' },
  { id: 'flareflow', name: 'FlareFlow', badge: '6 ep' },
  { id: 'moboreels', name: 'MoboReels', badge: '6 ep' },
  { id: 'dramanova', name: 'DramaNova', badge: 'Maint', status: 'maint' },
  { id: 'dramawave', name: 'DramaWave', badge: '7 ep' },
  { id: 'playlet', name: 'Playlet', badge: '10 ep' },
];

interface PlatformStore {
  platform: string;
  setPlatform: (platform: string) => void;
}

export const usePlatform = create<PlatformStore>((set) => ({
  platform: localStorage.getItem('selected_platform') || 'dramabox',
  setPlatform: (platform: string) => {
    localStorage.setItem('selected_platform', platform);
    set({ platform });
  },
}));
