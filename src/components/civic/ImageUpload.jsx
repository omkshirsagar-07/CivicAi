import { useRef, useState } from 'react'
import { ImagePlus, X, UploadCloud } from 'lucide-react'

export default function ImageUpload({ image, onImageChange }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    // object URLs only — no upload, no persistence of sensitive data
    const url = URL.createObjectURL(file)
    onImageChange?.({ url, name: file.name })
  }

  const remove = () => {
    if (image?.url) URL.revokeObjectURL(image.url)
    onImageChange?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (image) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-slate-200">
        <img src={image.url} alt="Uploaded issue preview" className="h-52 w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-navy-950/80 to-transparent px-4 py-3">
          <span className="truncate text-xs font-medium text-white/90">{image.name}</span>
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-white"
          >
            <X size={14} /> Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFile(e.dataTransfer.files?.[0])
      }}
      aria-label="Upload an image of the issue"
      className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/40'
      }`}
    >
      <span className={`grid h-12 w-12 place-items-center rounded-full transition-colors ${dragging ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
        {dragging ? <UploadCloud size={22} /> : <ImagePlus size={22} />}
      </span>
      <span className="mt-3 text-sm font-semibold text-navy-900">Upload an Image</span>
      <span className="mt-1 text-xs text-slate-500">Drag &amp; drop or click to browse — JPG, PNG up to 10 MB</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </button>
  )
}
