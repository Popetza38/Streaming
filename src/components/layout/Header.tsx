import { Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useLanguage, languages } from '../../store/language'

export default function Header() {
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const { lang, setLang } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 z-50 safe-area-top">
      <div className="flex items-center justify-between h-full px-4 max-w-5xl mx-auto">
        <Link to="/" className="text-lg sm:text-xl font-bold text-white">
          DramaPop
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2.5 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl transition-colors text-sm"
            >
              {languages.find(l => l.code === lang)?.flag || '🌐'}
            </button>

            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl w-48 max-h-80 overflow-y-auto z-50 shadow-xl">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setLang(language.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-zinc-800 active:bg-zinc-700 transition-colors flex items-center gap-3 text-sm ${lang === language.code ? 'bg-zinc-800 text-red-400' : 'text-white'
                        }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {!isSearchPage && (
            <Link to="/search" className="p-2.5 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl transition-colors">
              <Search size={20} className="text-zinc-400" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
