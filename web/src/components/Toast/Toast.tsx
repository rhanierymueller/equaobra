'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'

import type { ToastContextValue, ToastItem, ToastVariant } from './Toast.types'
import { ToastItemView } from './ToastItemView'

export const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const add = useCallback((message: string, variant: ToastVariant, duration = DEFAULT_DURATION) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, message, variant, duration }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const ctx: ToastContextValue = {
    success: useCallback((msg, dur) => add(msg, 'success', dur), [add]),
    error: useCallback((msg, dur) => add(msg, 'error', dur), [add]),
    warning: useCallback((msg, dur) => add(msg, 'warning', dur), [add]),
    info: useCallback((msg, dur) => add(msg, 'info', dur), [add]),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div
        aria-label="Notificações"
        data-toast-container
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'flex-end',
          pointerEvents: 'auto',
        }}
      >
        {toasts.map((t) => (
          <ToastItemView key={t.id} item={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
