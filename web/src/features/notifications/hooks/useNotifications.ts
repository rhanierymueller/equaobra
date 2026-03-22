'use client'

import { useState, useCallback, useEffect } from 'react'

import { api } from '@/src/services/api'
import type { AppNotification, NotificationType } from '@/src/types/notification.types'

export function useNotifications(userId: string) {
  const [all, setAll] = useState<AppNotification[]>([])

  const refresh = useCallback(() => {
    if (!userId) return
    api
      .get<AppNotification[]>('/api/notifications')
      .then((data) => setAll(data))
      .catch(() => setAll([]))
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const mine = all.filter((n) => n.toMemberId === userId)
  const unreadCount = mine.filter((n) => !n.read).length

  const push = useCallback(
    (
      type: NotificationType,
      toMemberId: string,
      teamId: string,
      teamName: string,
      fromMemberId: string,
      fromMemberName: string,
      message: string,
      extra?: { logId?: string; logDate?: string; logHours?: number },
    ) => {
      api
        .post<AppNotification>('/api/notifications', {
          type,
          toMemberId,
          teamId,
          teamName,
          fromMemberName: fromMemberName,
          message,
          ...extra,
        })
        .then((n) => setAll((prev) => [n, ...prev]))
        .catch(() => {})
    },
    [],
  )

  const markRead = useCallback((id: string) => {
    setAll((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    api.patch(`/api/notifications/${id}/read`).catch(() => {})
  }, [])

  const markAllRead = useCallback(() => {
    setAll((prev) => prev.map((n) => (n.toMemberId === userId ? { ...n, read: true } : n)))
    api.patch('/api/notifications/read-all').catch(() => {})
  }, [userId])

  const remove = useCallback((id: string) => {
    setAll((prev) => prev.filter((n) => n.id !== id))
    api.delete(`/api/notifications/${id}`).catch(() => {})
  }, [])

  return { mine, unreadCount, push, markRead, markAllRead, remove, refresh }
}
