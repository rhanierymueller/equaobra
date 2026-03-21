'use client'

import { useState, useCallback } from 'react'
import type { AppNotification, NotificationType } from '@/src/types/notification.types'

const STORAGE_KEY = 'equobra_notifications'

function load(): AppNotification[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AppNotification[] }
  catch { return [] }
}

function save(items: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useNotifications(userId: string) {
  const [all, setAll] = useState<AppNotification[]>(() => load())

  const mine = all.filter(n => n.toMemberId === userId)
  const unreadCount = mine.filter(n => !n.read).length

  const push = useCallback((
    type: NotificationType,
    toMemberId: string,
    teamId: string,
    teamName: string,
    fromMemberId: string,
    fromMemberName: string,
    message: string,
    extra?: { logId?: string; logDate?: string; logHours?: number },
  ) => {
    const n: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      toMemberId,
      teamId,
      teamName,
      fromMemberId,
      fromMemberName,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      ...extra,
    }
    const next = [n, ...load()]
    save(next)
    setAll(next)
  }, [])

  const markRead = useCallback((id: string) => {
    const next = load().map(n => n.id === id ? { ...n, read: true } : n)
    save(next)
    setAll(next)
  }, [])

  const markAllRead = useCallback(() => {
    const next = load().map(n => n.toMemberId === userId ? { ...n, read: true } : n)
    save(next)
    setAll(next)
  }, [userId])

  const remove = useCallback((id: string) => {
    const next = load().filter(n => n.id !== id)
    save(next)
    setAll(next)
  }, [])

  const refresh = useCallback(() => {
    setAll(load())
  }, [])

  return { mine, unreadCount, push, markRead, markAllRead, remove, refresh }
}
