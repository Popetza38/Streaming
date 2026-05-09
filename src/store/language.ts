import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  lang: string;
  setLang: (lang: string) => void;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      lang: 'th',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'dramabox-language',
    }
  )
);

export const languages = [
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'in', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zhHans', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh', name: '繁體中文', flag: '🇹🇼' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

