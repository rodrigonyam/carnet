import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollection } from '../hooks/useCollection'
import { BookOpen, Image, Scan, FileText, Film, ArrowRight } from 'lucide-react'
import UploadModal from '../components/UploadModal'

const STAT_CARDS = [
  { category: 'photo',    label: 'Photos',    icon: Image,    color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { category: 'scan',     label: 'Scans',     icon: Scan,     color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { category: 'document', label: 'Documents', icon: FileText, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { category: 'video',    label: 'Videos',    icon: Film,     color: 'bg-purple-50 text-purple-600 border-purple-100' },
]

export default function Home() {
  const { entries, loading } = useCollection()
  const [uploadOpen, setUploadOpen] = useState(false)

  const counts = entries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {})

  const recent = [...entries]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    .slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

      {/* Hero */}
      <section className="bg-gradient-to-br from-sepia-600 to-sepia-800 rounded-3xl px-8 py-12 text-white text-center shadow-lg">
        <div className="flex justify-center mb-4">
          <BookOpen className="w-12 h-12 opacity-90" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">Family Archive</h1>
        <p className="text-sepia-100 text-lg max-w-xl mx-auto">
          Preserve your photos, scans, letters, and documents — all in one place, forever.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setUploadOpen(true)}
            className="bg-white text-sepia-700 hover:bg-sepia-50 font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Upload Something
          </button>
          <Link
            to="/archive"
            className="border border-white/40 hover:bg-white/10 text-white font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1"
          >
            Browse Archive <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="text-xl font-serif font-semibold text-stone-700 mb-4">Your Collection</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0,1,2,3].map(i => (
              <div key={i} className="h-24 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STAT_CARDS.map(({ category, label, icon: Icon, color }) => (
              <Link
                key={category}
                to={`/archive?cat=${category}`}
                className={`card p-5 flex flex-col items-center gap-2 border ${color} hover:scale-105 transition-transform`}
              >
                <Icon className="w-7 h-7" />
                <p className="text-2xl font-bold font-serif">{counts[category] ?? 0}</p>
                <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Uploads */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-semibold text-stone-700">Recently Added</h2>
            <Link to="/archive" className="text-sm text-sepia-600 hover:text-sepia-800 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recent.map((entry) => (
              <a
                key={entry.id}
                href={entry.downloadURL}
                target="_blank"
                rel="noreferrer"
                className="card group overflow-hidden"
              >
                {entry.fileType?.startsWith('image/') ? (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={entry.downloadURL}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-stone-100 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-stone-300" />
                  </div>
                )}
                <div className="p-2 text-xs text-stone-600 font-medium line-clamp-1">{entry.title}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <section className="text-center py-20">
          <BookOpen className="w-14 h-14 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-semibold text-stone-500">Your archive is empty</h3>
          <p className="text-sm text-stone-400 mt-1 mb-6">Start by uploading a photo, scan, or document.</p>
          <button onClick={() => setUploadOpen(true)} className="btn-primary">
            Upload First File
          </button>
        </section>
      )}

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  )
}
