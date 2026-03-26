'use client'

import { useRef, useState } from 'react'

import { ImageCropModal } from './ImageCropModal'

import type { User } from '@/src/types/user.types'

interface AvatarUploadProps {
  user: User
  /** Preview URL a exibir (gerada após o crop, controlada pelo pai) */
  pendingPreview: string | null
  /** Chamado quando o usuário confirma o crop; pai guarda o arquivo */
  onFileReady: (file: File, preview: string) => void
  /** Chamado quando o usuário remove a foto pendente ou a atual */
  onClear: () => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function AvatarUpload({ user, pendingPreview, onFileReady, onClear }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rawSrc, setRawSrc] = useState<string | null>(null)

  const displayUrl = pendingPreview ?? user.avatarUrl ?? null
  const initials = getInitials(user.name)
  const hasPending = !!pendingPreview

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (e.target) e.target.value = ''

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => setRawSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <>
      <div className="flex gap-5 items-start">
        {/* Square avatar */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 16,
            flexShrink: 0,
            background: displayUrl ? 'transparent' : 'var(--color-primary-alpha-10)',
            border: `2px solid ${hasPending ? 'var(--color-primary-alpha-50)' : displayUrl ? 'var(--color-border-medium)' : 'var(--color-border-subtle)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={user.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: 'var(--color-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              {initials}
            </span>
          )}

          {hasPending && (
            <div
              style={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                background: 'var(--color-primary)',
                borderRadius: 8,
                padding: '2px 6px',
              }}
            >
              <span
                style={{ fontSize: 9, fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}
              >
                NOVO
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2.5 pt-1 flex-1">
          <p className="text-sm font-semibold text-white" style={{ lineHeight: 1.3 }}>
            {displayUrl
              ? hasPending
                ? 'Foto pronta para salvar'
                : 'Foto de perfil'
              : 'Sem foto de perfil'}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {hasPending
              ? 'A foto será salva ao clicar em "Salvar perfil" abaixo.'
              : 'Selecione uma imagem para ajustar antes de salvar.'}
          </p>

          <div className="flex flex-wrap gap-2 mt-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{
                background: 'var(--color-primary-alpha-10)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-alpha-30)',
                cursor: 'pointer',
              }}
            >
              {displayUrl ? 'Trocar foto' : 'Adicionar foto'}
            </button>

            {(hasPending || user.avatarUrl) && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                style={{
                  background: 'var(--color-danger-alpha-08)',
                  color: 'var(--color-danger-light)',
                  border: '1px solid var(--color-danger-alpha-15)',
                  cursor: 'pointer',
                }}
              >
                {hasPending ? 'Descartar' : 'Remover foto'}
              </button>
            )}
          </div>

          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            JPEG, PNG ou WebP · máx. 5MB
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {rawSrc && (
        <ImageCropModal
          src={rawSrc}
          onConfirm={(file, preview) => {
            setRawSrc(null)
            onFileReady(file, preview)
          }}
          onCancel={() => setRawSrc(null)}
        />
      )}
    </>
  )
}
