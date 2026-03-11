import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { uploadFileToS3 } from '../services/s3Upload'
import { X, UploadCloud, FileText, Image, Scan, Film } from 'lucide-react'

const CATEGORIES = [
  { value: 'photo',    label: 'Photo',     icon: Image },
  { value: 'scan',     label: 'Scan',      icon: Scan },
  { value: 'document', label: 'Document',  icon: FileText },
  { value: 'video',    label: 'Video',     icon: Film },
  { value: 'other',    label: 'Other',     icon: FileText },
]

export default function UploadModal({ onClose }) {
  const [files,      setFiles]      = useState([])
  const [category,   setCategory]   = useState('photo')
  const [title,      setTitle]      = useState('')
  const [notes,      setNotes]      = useState('')
  const [uploading,  setUploading]  = useState(false)
  const [progress,   setProgress]   = useState(0)
  const [error,      setError]      = useState(null)

  const onDrop = useCallback((accepted) => {
    setFiles(accepted)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50 MB
  })

  const handleUpload = async () => {
    if (!files.length) return
    setUploading(true)
    setError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const uploaded = await uploadFileToS3({
          file,
          category,
          onProgress: (pct) => {
            setProgress(Math.round(((i + pct / 100) / files.length) * 100))
          },
        })

        await addDoc(collection(db, 'entries'), {
          title:       title || file.name,
          notes,
          category,
          fileName:    file.name,
          fileType:    file.type,
          fileSize:    file.size,
          downloadURL: uploaded.fileUrl,
          storagePath: uploaded.key,
          createdAt:   serverTimestamp(),
        })
      }
      onClose()
    } catch (err) {
      console.error(err)
      const details = err?.code ? `${err.code}: ${err.message}` : (err?.message || 'Unknown Firebase error')
      setError(`Upload failed. ${details}`)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-serif font-semibold text-stone-800">Add to Archive</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-sepia-500 bg-sepia-50' : 'border-stone-300 hover:border-sepia-400 hover:bg-stone-50'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto w-10 h-10 text-sepia-400 mb-2" />
            {files.length > 0 ? (
              <p className="text-sm font-medium text-sepia-700">
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-stone-600">Drop files here, or click to browse</p>
                <p className="text-xs text-stone-400 mt-1">Photos, scans, PDFs, Word docs — up to 50 MB each</p>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grandma's 1962 Birthday"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sepia-400 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                    ${category === value
                      ? 'bg-sepia-600 text-white border-sepia-600'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-sepia-400'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any context, date, names, or memories..."
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sepia-400 focus:border-transparent"
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className="w-full bg-stone-200 rounded-full h-2">
              <div
                className="bg-sepia-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost text-sm" disabled={uploading}>
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!files.length || uploading}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? `Uploading… ${progress}%` : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}
