import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import Toaster from './components/Toaster'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black">
        <AppRoutes />
        <Toaster />
      </div>
    </BrowserRouter>
  )
}
