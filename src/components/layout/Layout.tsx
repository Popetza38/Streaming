import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import { useAuth } from '../../contexts/AuthContext'
import { Megaphone, X } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { settings } = useAuth();
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-950">
      {settings?.announcement && showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 px-4 shadow-lg animate-in slide-in-from-top duration-500">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <Megaphone size={16} className="shrink-0 animate-bounce" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                {settings.announcement}
              </span>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      <Header />
      <main className={`pt-14 sm:pt-16 pb-20 px-3 sm:px-4 md:px-6 max-w-5xl mx-auto ${settings?.announcement && showBanner ? 'mt-8' : ''}`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
