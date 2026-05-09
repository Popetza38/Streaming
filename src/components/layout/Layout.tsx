import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <Header />
      <main className="pt-16 pb-20 px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
