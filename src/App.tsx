import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import Toaster from './components/Toaster'
import Antigravity from './components/Antigravity'
import { useState, useEffect, useRef } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AlertTriangle, Hammer, Cog } from 'lucide-react'
import './index.css'

const SECRET = 'gravity'

function AppContent({ antigravityActive, setAntigravityActive }: { antigravityActive: boolean, setAntigravityActive: (v: boolean) => void }) {
  const { settings, profile, isLoading } = useAuth();

  if (!isLoading && settings?.maintenanceMode && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-red-500/10 text-red-500 rounded-3xl border border-red-500/20 animate-bounce">
                <Hammer size={40} />
              </div>
              <div className="p-4 bg-orange-500/10 text-orange-500 rounded-3xl border border-orange-500/20 animate-spin-slow">
                <Cog size={40} />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">ระบบกำลังปรับปรุง</h1>
            <p className="text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
              ขออภัยในความไม่สะดวก ขณะนี้ระบบกำลังอยู่ในช่วงปรับปรุงเพื่อเพิ่มประสิทธิภาพการใช้งาน โปรดกลับมาใหม่อีกครั้งในภายหลัง
            </p>
            <div className="mt-8 pt-8 border-t border-zinc-800/50">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                <AlertTriangle size={12} className="text-red-500" />
                Maintenance Status: Active
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AppRoutes />
      <Toaster />
      <Antigravity
        active={antigravityActive}
        onDeactivate={() => setAntigravityActive(false)}
      />
    </div>
  );
}

export default function App() {
  const [antigravityActive, setAntigravityActive] = useState(false)
  const bufferRef = useRef('')

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      bufferRef.current = (bufferRef.current + e.key).slice(-SECRET.length)
      if (bufferRef.current === SECRET) {
        setAntigravityActive(prev => !prev)
        bufferRef.current = ''
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent antigravityActive={antigravityActive} setAntigravityActive={setAntigravityActive} />
      </BrowserRouter>
    </AuthProvider>
  )
}

