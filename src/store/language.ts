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
      name: 'shortmax-language',
    }
  )
);

export const languages = [
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
];

export const lockMessages: Record<string, string> = {
  id: 'Website ini hanya trial, jika membutuhkan API cek Telegram @sapitokenbot',
  en: 'This website is trial only, if you need API check Telegram @sapitokenbot',
  zh: '本網站僅供試用，如需API請查看Telegram @sapitokenbot',
  zh_cn: '本网站仅供试用，如需API请查看Telegram @sapitokenbot',
  fil: 'Ang website na ito ay trial lamang, kung kailangan mo ng API tingnan ang Telegram @sapitokenbot',
  hi: 'यह वेबसाइट केवल ट्रायल है, यदि आपको API चाहिए तो Telegram @sapitokenbot देखें',
  ja: 'このウェブサイトはトライアルのみです。APIが必要な場合はTelegram @sapitokenbotをチェックしてください',
  ko: '이 웹사이트는 체험판입니다. API가 필요하면 Telegram @sapitokenbot을 확인하세요',
  th: 'เว็บไซต์นี้เป็นเพียงทดลองใช้ หากคุณต้องการ API ตรวจสอบ Telegram @sapitokenbot',
  ar: 'هذا الموقع تجريبي فقط، إذا كنت بحاجة إلى API تحقق من Telegram @sapitokenbot',
  pt: 'Este site é apenas teste, se você precisa de API verifique Telegram @sapitokenbot',
  es: 'Este sitio web es solo de prueba, si necesita API consulte Telegram @sapitokenbot',
  vi: 'Trang web này chỉ dùng thử, nếu bạn cần API hãy kiểm tra Telegram @sapitokenbot',
  de: 'Diese Website ist nur Testversion, wenn Sie API benötigen, prüfen Sie Telegram @sapitokenbot',
  fr: 'Ce site web est en version d\'essai uniquement, si vous avez besoin d\'API consultez Telegram @sapitokenbot',
  ms: 'Laman web ini hanya percubaan, jika anda memerlukan API semak Telegram @sapitokenbot',
  ru: 'Этот сайт только пробный, если вам нужен API проверьте Telegram @sapitokenbot',
  it: 'Questo sito è solo di prova, se hai bisogno di API controlla Telegram @sapitokenbot',
  tr: 'Bu web sitesi sadece deneme amaçlıdır, API\'ye ihtiyacınız varsa Telegram @sapitokenbot\'ı kontrol edin'
};
