import { Home, TrendingUp, Search, Grid } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/rank', icon: TrendingUp, label: 'Rank' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/category', icon: Grid, label: 'Category' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-5xl mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all active:scale-95 min-w-[64px] ${isActive
                ? 'text-red-500 bg-red-500/10'
                : 'text-zinc-400 hover:text-white active:text-white'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[11px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
