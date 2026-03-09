import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Archive, Plus } from 'lucide-react'
import { useState } from 'react'
import UploadModal from './UploadModal'

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 text-sepia-700 hover:text-sepia-900 transition-colors">
            <BookOpen className="w-6 h-6" />
            <span className="font-serif text-xl font-semibold tracking-wide">Carnet</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`btn-ghost text-sm ${pathname === '/' ? 'bg-sepia-100 text-sepia-800' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/archive"
              className={`btn-ghost text-sm flex items-center gap-1 ${pathname === '/archive' ? 'bg-sepia-100 text-sepia-800' : ''}`}
            >
              <Archive className="w-4 h-4" /> Archive
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="btn-primary text-sm flex items-center gap-1 ml-2"
            >
              <Plus className="w-4 h-4" /> Upload
            </button>
          </nav>

        </div>
      </header>

      {open && <UploadModal onClose={() => setOpen(false)} />}
    </>
  )
}
