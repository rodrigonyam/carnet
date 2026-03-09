import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Archive from './pages/Archive'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
      </main>
      <footer className="text-center text-xs text-stone-400 py-4 border-t border-stone-200">
        © {new Date().getFullYear()} — Family Archive · Carnet
      </footer>
    </div>
  )
}
