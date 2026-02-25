import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import Toaster from './components/Toaster'
import Antigravity from './components/Antigravity'
import { useState, useEffect, useRef } from 'react'
import './index.css'

const SECRET = 'gravity'

export default function App() {
  const [antigravityActive, setAntigravityActive] = useState(false)
  const bufferRef = useRef('')

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore keys when typing in inputs/textareas/etc.
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
    <BrowserRouter>
      <div className="min-h-screen bg-black">
        <AppRoutes />
        <Toaster />
        <Antigravity
          active={antigravityActive}
          onDeactivate={() => setAntigravityActive(false)}
        />
      </div>
    </BrowserRouter>
  )
}

