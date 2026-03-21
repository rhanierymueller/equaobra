'use client'

import { useState, useCallback, useEffect } from 'react'
import { api } from '@/src/services/api'
import type { Conversation, ChatMessage } from '@/src/types/chat.types'

// ── Map API response to frontend type ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapConversation(raw: any): Conversation {
  return {
    id: raw.id,
    professionalId: raw.professionalId,
    professionalName: raw.professionalName,
    professionalInitials: raw.professionalInitials,
    professionalAvatarUrl: raw.professionalAvatarUrl,
    messages: (raw.messages ?? []).map(mapMessage),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(raw: any): ChatMessage {
  return {
    id: raw.id,
    senderId: raw.senderId,
    senderName: raw.senderName,
    text: raw.text,
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : new Date(raw.timestamp).toISOString(),
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useChat(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (!userId) return
    api.get<unknown[]>('/api/chats')
      .then(data => setConversations(data.map(mapConversation)))
      .catch(() => setConversations([]))
  }, [userId])

  // Sync (optimistic) — finds from state or creates one optimistically + calls API
  const getOrCreateConversation = useCallback((
    professionalId: string,
    professionalName: string,
    professionalInitials: string,
    professionalAvatarUrl?: string,
  ): Conversation => {
    const convId = `${userId}_${professionalId}`
    const existing = conversations.find(c => c.id === convId)
    if (existing) return existing

    // Create optimistically
    const conv: Conversation = { id: convId, professionalId, professionalName, professionalInitials, professionalAvatarUrl, messages: [] }
    setConversations(prev => [...prev, conv])

    // Sync with API in background
    api.post<unknown>('/api/chats', { professionalId, professionalName, professionalInitials, professionalAvatarUrl })
      .then(data => {
        const mapped = mapConversation(data)
        setConversations(prev => prev.map(c => c.id === mapped.id ? { ...mapped, messages: c.messages } : c))
      })
      .catch(() => {})

    return conv
  }, [userId, conversations])

  // Optimistic send — state updates immediately, API syncs in background
  const sendMessage = useCallback((conversationId: string, senderId: string, senderName: string, text: string): ChatMessage => {
    const tempId = `msg-${Date.now()}`
    const message: ChatMessage = { id: tempId, senderId, senderName, text, timestamp: new Date().toISOString() }

    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
    ))

    api.post<unknown>(`/api/chats/${conversationId}/messages`, { senderName, text })
      .then(data => {
        const real = mapMessage(data)
        setConversations(prev => prev.map(c => {
          if (c.id !== conversationId) return c
          return { ...c, messages: c.messages.map(m => m.id === tempId ? real : m) }
        }))
      })
      .catch(() => {
        // Remove failed message
        setConversations(prev => prev.map(c => {
          if (c.id !== conversationId) return c
          return { ...c, messages: c.messages.filter(m => m.id !== tempId) }
        }))
      })

    return message
  }, [])

  const getConversation = useCallback((conversationId: string): Conversation | undefined =>
    conversations.find(c => c.id === conversationId),
  [conversations])

  return { conversations, getOrCreateConversation, sendMessage, getConversation }
}
