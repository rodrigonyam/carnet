import { useState } from 'react'
import { doc, deleteDoc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { FileText, Image, Scan, Film, Trash2, ExternalLink, FileQuestion } from 'lucide-react'

const CATEGORY_ICONS = {
  photo:    Image,
  scan:     Scan,
  document: FileText,
  video:    Film,
  other:    FileQuestion,
}

const CATEGORY_COLORS = {
  photo:    'bg-blue-100 text-blue-700',
  scan:     'bg-amber-100 text-amber-700',
  document: 'bg-emerald-100 text-emerald-700',
  video:    'bg-purple-100 text-purple-700',
  other:    'bg-stone-100 text-stone-600',
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

export default function FileCard({ entry, onDeleted }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const Icon = CATEGORY_ICONS[entry.category] || FileQuestion
  const colorClass = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other

  const isImage = entry.fileType?.startsWith('image/')

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'entries', entry.id))
      if (entry.storagePath) {
        await deleteObject(ref(storage, entry.storagePath))
      }
      onDeleted(entry.id)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="card flex flex-col overflow-hidden">

      {/* Thumbnail / Preview */}
      <div className="h-40 bg-stone-100 flex items-center justify-center overflow-hidden relative group">
        {isImage ? (
          <img
            src={entry.downloadURL}
            alt={entry.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="w-14 h-14 text-stone-300" />
        )}

        {/* Hover overlay */}
        <a
          href={entry.downloadURL}
          target="_blank"
          rel="noreferrer"
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <ExternalLink className="w-6 h-6 text-white" />
        </a>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-stone-800 leading-snug line-clamp-1 flex-1">
            {entry.title}
          </p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${colorClass}`}>
            {entry.category}
          </span>
        </div>

        {entry.notes && (
          <p className="text-xs text-stone-500 line-clamp-2">{entry.notes}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-[10px] text-stone-400">
            {entry.createdAt?.toDate
              ? entry.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : ''}
            {entry.fileSize ? ` · ${formatSize(entry.fileSize)}` : ''}
          </span>

          {/* Delete */}
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="text-stone-300 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                {deleting ? '…' : 'Delete'}
              </button>
              <span className="text-stone-300">|</span>
              <button onClick={() => setConfirming(false)} className="text-stone-500">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
