'use client'

import { useState } from 'react'

import { useNotifications } from '../../hooks/useNotifications'

import { api } from '@/src/services/api'
import type { AppNotification } from '@/src/types/notification.types'

function NotifIcon({ type }: { type: AppNotification['type'] }) {
  if (type === 'team_invite') {
    return (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'rgba(224,123,42,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      </div>
    )
  }
  if (type === 'invite_accepted') {
    return (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'rgba(76,175,80,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    )
  }
  if (type === 'invite_rejected') {
    return (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'rgba(255,107,107,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-danger-light)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    )
  }
  if (type === 'log_delete_request') {
    return (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'rgba(255,209,102,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-star)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </div>
    )
  }
  if (type === 'log_deleted') {
    return (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'rgba(255,107,107,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-danger-light)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </div>
    )
  }
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: 'rgba(116,185,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-info)"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function InviteActions({
  notif,
  onRespond,
}: {
  notif: AppNotification
  onRespond: (id: string, action: 'accept' | 'reject') => void
}) {
  const [loading, setLoading] = useState(false)

  async function handle(action: 'accept' | 'reject') {
    setLoading(true)
    await api
      .patch(`/api/teams/${notif.teamId}/members/${notif.toMemberId}/respond`, { action })
      .catch(() => {})
    onRespond(notif.id, action)
    setLoading(false)
  }

  return (
    <div className="flex gap-2 mt-2">
      <button
        disabled={loading}
        onClick={(e) => {
          e.stopPropagation()
          handle('accept')
        }}
        style={{
          flex: 1,
          padding: '5px 0',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          background: 'rgba(76,175,80,0.15)',
          color: '#4CAF50',
          border: '1px solid rgba(76,175,80,0.3)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        Aceitar
      </button>
      <button
        disabled={loading}
        onClick={(e) => {
          e.stopPropagation()
          handle('reject')
        }}
        style={{
          flex: 1,
          padding: '5px 0',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          background: 'rgba(255,107,107,0.12)',
          color: 'var(--color-danger-light)',
          border: '1px solid rgba(255,107,107,0.25)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        Recusar
      </button>
    </div>
  )
}

interface NotificationPanelProps {
  userId: string
}

export function NotificationPanel({ userId }: NotificationPanelProps) {
  const { mine, unreadCount, markRead, markAllRead, remove, refresh } = useNotifications(userId)

  function handleRespond(id: string, action: 'accept' | 'reject') {
    markRead(id)
    remove(id)
    refresh()
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 340,
        maxHeight: 480,
        background: 'rgba(15,14,12,0.99)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">Notificações</span>
          {unreadCount > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs"
            style={{
              color: 'rgba(245,240,235,0.4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Marcar todas lidas
          </button>
        )}
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {mine.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(245,240,235,0.15)"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
              Nenhuma notificação
            </p>
          </div>
        ) : (
          mine.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 px-4 py-3 transition-all"
              style={{
                background: n.read ? 'transparent' : 'rgba(224,123,42,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer',
              }}
              onClick={() => markRead(n.id)}
            >
              <NotifIcon type={n.type} />
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: n.read ? 'rgba(245,240,235,0.5)' : 'rgba(245,240,235,0.85)' }}
                >
                  {n.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
                    {n.teamName} · {timeAgo(n.createdAt)}
                  </p>
                  {!n.read && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
                {n.type === 'team_invite' && <InviteActions notif={n} onRespond={handleRespond} />}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  remove(n.id)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(245,240,235,0.2)',
                  padding: 2,
                  flexShrink: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 2L10 10M10 2L2 10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
