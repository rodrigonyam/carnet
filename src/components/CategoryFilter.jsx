import { Image, Scan, FileText, Film, FileQuestion, LayoutGrid } from 'lucide-react'

const FILTERS = [
  { value: 'all',      label: 'All',      icon: LayoutGrid },
  { value: 'photo',    label: 'Photos',   icon: Image },
  { value: 'scan',     label: 'Scans',    icon: Scan },
  { value: 'document', label: 'Documents',icon: FileText },
  { value: 'video',    label: 'Videos',   icon: Film },
  { value: 'other',    label: 'Other',    icon: FileQuestion },
]

export default function CategoryFilter({ active, onChange, counts = {} }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ value, label, icon: Icon }) => {
        const count = value === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[value] ?? 0)

        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
              ${active === value
                ? 'bg-sepia-600 text-white border-sepia-600 shadow-sm'
                : 'bg-white text-stone-600 border-stone-300 hover:border-sepia-400 hover:text-sepia-700'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === value ? 'bg-white/20' : 'bg-stone-100'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
