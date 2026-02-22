import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <main className="pt-14 sm:pt-16 pb-20 px-3 sm:px-4 md:px-6 max-w-5xl mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
