'use client'

import { useContext } from 'react'

import { ToastContext } from '@/src/components/Toast'
import type { ToastContextValue } from '@/src/components/Toast'

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
