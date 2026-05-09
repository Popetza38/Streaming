import { Home, TrendingUp, Search, Grid } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: Home, label: 'หน้าแรก' },
  { to: '/rank', icon: TrendingUp, label: 'ยอดนิยม' },
  { to: '/search', icon: Search, label: 'ค้นหา' },
  { to: '/category', icon: Grid, label: 'หมวดหมู่' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-white/5 z-50 md:hidden">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-red-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-red-500/20' : ''
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
