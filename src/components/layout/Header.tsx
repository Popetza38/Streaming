import { Search, Home, TrendingUp, Grid, Tv, ChevronDown } from 'lucide-react'
import { Link, useLocation, NavLink } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useLanguage, languages } from '../../store/language'
import { usePlatform, platforms } from '../../store/platform'

const navItems = [
  { to: '/', icon: Home, label: 'หน้าแรก' },
  { to: '/rank', icon: TrendingUp, label: 'ยอดนิยม' },
  { to: '/category', icon: Grid, label: 'หมวดหมู่' },
]

export default function Header() {
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const { lang, setLang } = useLanguage();
  const { platform, setPlatform } = usePlatform();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const platformMenuRef = useRef<HTMLDivElement>(null);

  const activePlatformObj = platforms.find(p => p.id === platform) || platforms[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (platformMenuRef.current && !platformMenuRef.current.contains(event.target as Node)) {
        setShowPlatformMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 z-50">
      <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent hidden sm:block">
            DramaBox
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-500/10 text-red-400'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Platform Selector Dropdown */}
          <div className="relative" ref={platformMenuRef}>
            <button
              onClick={() => setShowPlatformMenu(!showPlatformMenu)}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 rounded-xl transition-all text-xs md:text-sm font-medium text-zinc-300 hover:text-white"
              title="เลือกแพลตฟอร์มซีรีส์"
            >
              <Tv size={16} className="text-red-400" />
              <span className="font-semibold text-white">{activePlatformObj.name}</span>
              {activePlatformObj.badge && (
                <span className="hidden lg:inline text-[10px] font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                  {activePlatformObj.badge}
                </span>
              )}
              <ChevronDown size={14} className={`text-zinc-400 transition-transform ${showPlatformMenu ? 'rotate-180' : ''}`} />
            </button>

            {showPlatformMenu && (
              <div className="absolute top-full right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-64 max-h-96 overflow-y-auto z-50 shadow-2xl p-2 space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-white/5 mb-1">
                  เลือกแพลตฟอร์ม ({platforms.length})
                </div>
                {platforms.map((item) => {
                  const isSelected = item.id === platform;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPlatform(item.id);
                        setShowPlatformMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between text-sm ${
                        isSelected
                          ? 'bg-red-500/20 text-red-400 font-semibold'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Tv size={14} className={isSelected ? 'text-red-400' : 'text-zinc-500'} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'maint'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-sm"
            >
              <span className="text-lg">{languages.find(l => l.code === lang)?.flag || '🌐'}</span>
              <span className="hidden sm:block text-zinc-300">{languages.find(l => l.code === lang)?.name}</span>
            </button>

            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-56 max-h-80 overflow-y-auto z-50 shadow-2xl">
                <div className="p-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setLang(language.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 text-sm ${
                        lang === language.code
                          ? 'bg-red-500/20 text-red-400'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="font-medium">{language.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          {!isSearchPage && (
            <Link
              to="/search"
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl transition-all text-sm font-medium"
            >
              <Search size={18} />
              <span className="hidden sm:block">ค้นหา</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

