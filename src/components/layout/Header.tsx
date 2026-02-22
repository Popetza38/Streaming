import { Search, Film, Home, TrendingUp, Crown, Clock } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLanguage, languages } from '../../store/language'
import { useSource, type StreamSource } from '../../store/source'

const sources: { id: StreamSource; label: string; icon: string }[] = [
  { id: 'dramabox', label: 'DramaBox', icon: '🎬' },
  { id: 'shortmax', label: 'ShortMax', icon: '⚡' },
]

export default function Header() {
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const { lang, setLang } = useLanguage();
  const { source, setSource } = useSource();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    if (!showLangMenu && !showSourceMenu) return;
    const handler = () => { setShowLangMenu(false); setShowSourceMenu(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showLangMenu, showSourceMenu]);

  const currentSource = sources.find(s => s.id === source) || sources[0];

  return (
    <header className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 ${scrolled
      ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
      : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}>
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#e50914] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Film size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Drama<span className="text-[#e50914]">Pop</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-8">
          {[
            { to: '/', label: 'Home', Icon: Home },
            { to: '/rank', label: 'Rank', Icon: TrendingUp },
            { to: '/search', label: 'Search', Icon: Search },
            { to: '/category', label: 'VIP', Icon: Crown },
            { to: '/history', label: 'History', Icon: Clock },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                  ? 'text-[#e50914] bg-[#e50914]/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.Icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Source Selector */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowSourceMenu(!showSourceMenu); setShowLangMenu(false); }}
              className="h-8 flex items-center gap-1.5 px-2.5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
            >
              <span>{currentSource.icon}</span>
              <span className="hidden sm:inline text-zinc-300">{currentSource.label}</span>
            </button>

            {showSourceMenu && (
              <div className="absolute top-full right-0 mt-2 glass-strong rounded-xl w-48 z-50 shadow-2xl shadow-black/50 animate-fade-in">
                <div className="p-1">
                  <div className="px-3 py-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider">Source</div>
                  {sources.map((s) => (
                    <button
                      key={s.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSource(s.id);
                        setShowSourceMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 text-sm ${source === s.id
                        ? 'bg-[#e50914]/20 text-[#e50914]'
                        : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <span className="font-medium">{s.label}</span>
                      {source === s.id && (
                        <span className="ml-auto text-[#e50914]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu); setShowSourceMenu(false); }}
              className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-lg"
            >
              {languages.find(l => l.code === lang)?.flag || '🌐'}
            </button>

            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 glass-strong rounded-xl w-52 max-h-80 overflow-y-auto z-50 shadow-2xl shadow-black/50 animate-fade-in">
                <div className="p-1">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLang(language.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 text-sm ${lang === language.code
                        ? 'bg-[#e50914]/20 text-[#e50914]'
                        : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="font-medium">{language.name}</span>
                      {lang === language.code && (
                        <span className="ml-auto text-[#e50914]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isSearchPage && (
            <Link to="/search" className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
              <Search size={20} className="text-zinc-300" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
