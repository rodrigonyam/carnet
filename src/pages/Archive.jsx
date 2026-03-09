import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCollection } from '../hooks/useCollection'
import FileCard from '../components/FileCard'
import CategoryFilter from '../components/CategoryFilter'
import { Search, Archive as ArchiveIcon } from 'lucide-react'

export default function Archive() {
  const { entries, loading, setEntries } = useCollection()
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all')
  const [searchQuery,    setSearchQuery]    = useState('')

  // Sync URL param → local state
  useEffect(() => {
    const cat = searchParams.get('cat')
    if (cat) setActiveCategory(cat)
  }, [searchParams])

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setSearchParams(cat !== 'all' ? { cat } : {})
  }

  const counts = useMemo(() => entries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {}), [entries])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return entries.filter((e) => {
      const matchesCat = activeCategory === 'all' || e.category === activeCategory
      const matchesQ   = !q || e.title?.toLowerCase().includes(q) || e.notes?.toLowerCase().includes(q)
      return matchesCat && matchesQ
    })
  }, [entries, activeCategory, searchQuery])

  const handleDeleted = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-800 flex items-center gap-2">
            <ArchiveIcon className="w-7 h-7 text-sepia-600" />
            Archive
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {entries.length} item{entries.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by title or notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sepia-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category filter */}
      <CategoryFilter active={activeCategory} onChange={handleCategoryChange} counts={counts} />

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-56 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <ArchiveIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">Nothing found</p>
          <p className="text-stone-400 text-xs mt-1">Try a different filter or upload more files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((entry) => (
            <FileCard key={entry.id} entry={entry} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  )
}
