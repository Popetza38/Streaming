import { Home, TrendingUp, Search, Crown, Clock } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/rank', icon: TrendingUp, label: 'Rank' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/category', icon: Crown, label: 'VIP' },
  { to: '/history', icon: Clock, label: 'History' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Gradient fade */}
      <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />

      <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 ${isActive
                  ? 'text-[#e50914]'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                    {isActive && (
                      <div className="absolute -inset-2 bg-[#e50914]/20 rounded-full blur-md -z-10" />
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-[#e50914]' : ''}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
