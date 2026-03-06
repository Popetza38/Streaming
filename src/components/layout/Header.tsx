import { Search, LogIn, LogOut, Shield, Settings as SettingsIcon, Crown } from 'lucide-react'
import Swal from 'sweetalert2'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useLanguage, languages } from '../../store/language'
import { usePlatform, platforms } from '../../store/platform'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const { lang, setLang } = useLanguage();
  const { platform, setPlatform } = usePlatform();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, profile, signOut } = useAuth();
  const isVip = profile?.tier === 'vip'; // Show crown if tier is vip


  const activePlatform = platforms.find(p => p.id === platform) || platforms[0];

  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 z-50 safe-area-top">
      <div className="flex items-center justify-between h-full px-4 max-w-5xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden"
          >
            <img src={activePlatform.logo} alt={activePlatform.name} className="w-full h-full object-contain" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {activePlatform.name}
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">

          {/* Platform Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowPlatformMenu(!showPlatformMenu); setShowLangMenu(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl transition-colors text-sm"
              style={{ borderColor: activePlatform.color, borderWidth: 1 }}
            >
              <img src={activePlatform.logo} alt={activePlatform.name} className="w-5 h-5 rounded object-contain" />
              <span className="hidden sm:inline text-xs font-medium text-zinc-300">{activePlatform.name}</span>
            </button>

            {showPlatformMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPlatformMenu(false)} />
                <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl w-48 z-50 shadow-xl overflow-hidden">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPlatform(p.id);
                        setShowPlatformMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-zinc-800 active:bg-zinc-700 transition-colors flex items-center gap-3 text-sm ${platform === p.id ? 'bg-zinc-800' : 'text-white'
                        }`}
                    >
                      <img src={p.logo} alt={p.name} className="w-6 h-6 rounded object-contain" />
                      <span className="font-medium">{p.name}</span>
                      {platform === p.id && (
                        <span className="ml-auto" style={{ color: p.color }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowLangMenu(!showLangMenu); setShowPlatformMenu(false); }}
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

          {/* User Profile / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowLangMenu(false); setShowPlatformMenu(false); }}
                className="p-1 sm:p-1.5 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl transition-colors"
                title="Profile"
              >
                <div className={`relative w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold uppercase shadow-sm border ${isVip ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'border-red-500/50'}`}>
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    profile?.username?.charAt(0) || user.email?.charAt(0) || 'U'
                  )}
                  {profile?.tier === 'vip' && (
                    <div className="absolute -top-2.5 -right-1 bg-gradient-to-tr from-yellow-600 to-yellow-400 p-0.5 rounded-md shadow-lg border border-yellow-300/50 text-black">
                      <Crown size={8} fill="black" />
                    </div>
                  )}
                </div>
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl w-56 z-50 shadow-xl overflow-hidden py-1">
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-sm font-medium text-white truncate">{profile?.username || 'User'}</p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-800 active:bg-zinc-700 transition-colors flex items-center gap-3 text-sm text-white"
                      >
                        <Shield size={16} className="text-red-500" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-800 active:bg-zinc-700 transition-colors flex items-center gap-3 text-sm text-white"
                    >
                      <SettingsIcon size={16} className="text-zinc-400" />
                      <span>Account Settings</span>
                    </Link>
                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        const result = await Swal.fire({
                          title: 'ยืนยันการออกจากระบบ',
                          text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
                          icon: 'question',
                          showCancelButton: true,
                          confirmButtonColor: '#ef4444',
                          cancelButtonColor: '#3f3f46',
                          confirmButtonText: 'ออกจากระบบ',
                          cancelButtonText: 'ยกเลิก',
                          background: '#18181b',
                          color: '#fff'
                        });
                        if (result.isConfirmed) {
                          await signOut();
                          Swal.fire({
                            icon: 'success',
                            title: 'ออกจากระบบสำเร็จ',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 2000,
                            background: '#18181b',
                            color: '#fff'
                          });
                        }
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-800 active:bg-zinc-700 transition-colors flex items-center gap-3 text-sm text-red-500 border-t border-zinc-800/50"
                    >
                      <LogOut size={16} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="p-2 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl transition-colors flex items-center gap-1.5 sm:mr-1">
              <div className="bg-zinc-800 p-1.5 rounded-lg border border-zinc-700 flex items-center gap-1.5 px-2.5 hover:bg-red-600 hover:border-red-500 hover:text-white transition-all text-zinc-300">
                <LogIn size={16} />
                <span className="hidden sm:inline text-xs font-semibold">Login</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
