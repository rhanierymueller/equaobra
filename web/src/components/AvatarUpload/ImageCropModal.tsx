'use client'

import { useCallback, useRef, useState } from 'react'
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropModalProps {
  src: string
  onConfirm: (file: File, preview: string) => void
  onCancel: () => void
}

function initCrop(width: number, height: number): Crop {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height)
}

async function cropToFile(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
): Promise<{ file: File; preview: string }> {
  const canvas = document.createElement('canvas')
  const size = 512
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    size,
    size,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Falha ao processar imagem'))
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
        const preview = canvas.toDataURL('image/jpeg', 0.92)
        resolve({ file, preview })
      },
      'image/jpeg',
      0.92,
    )
  })
}

export function ImageCropModal({ src, onConfirm, onCancel }: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [loading, setLoading] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(initCrop(width, height))
  }, [])

  async function handleConfirm() {
    if (!imgRef.current || !completedCrop) return
    setLoading(true)
    try {
      const result = await cropToFile(imgRef.current, completedCrop)
      onConfirm(result.file, result.preview)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1600,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        style={{
          background: 'var(--color-background)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white" style={{ fontSize: 17 }}>
              Ajustar foto
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Arraste para posicionar e redimensionar o recorte
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-faint)',
              padding: 4,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M3 3L15 15M15 3L3 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Crop area */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 12,
            overflow: 'hidden',
            maxHeight: 400,
          }}
        >
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop={false}
            minWidth={60}
            minHeight={60}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Ajustar foto"
              onLoad={onImageLoad}
              style={{ maxHeight: 400, maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:opacity-80 disabled:opacity-50"
            style={{
              background: 'var(--color-surface-overlay)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border-medium)',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !completedCrop}
            className="text-sm font-semibold px-5 py-2 rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Processando…' : 'Usar esta área'}
          </button>
        </div>
      </div>
    </div>
  )
}
