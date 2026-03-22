'use client'

import { useState, useCallback, useEffect } from 'react'
import { api } from '@/src/services/api'
import type { Conversation, ChatMessage } from '@/src/types/chat.types'

function mapConversation(raw: Record<string, unknown>): Conversation {
  return {
    id: raw.id as string,
    professionalId: raw.professionalId as string,
    professionalName: raw.professionalName as string,
    professionalInitials: raw.professionalInitials as string,
    professionalAvatarUrl: raw.professionalAvatarUrl as string | undefined,
    messages: (Array.isArray(raw.messages) ? raw.messages : []).map(mapMessage),
  }
}

function mapMessage(raw: Record<string, unknown>): ChatMessage {
  return {
    id: raw.id as string,
    senderId: raw.senderId as string,
    senderName: raw.senderName as string,
    text: raw.text as string,
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : new Date(raw.timestamp as string | number).toISOString(),
  }
}

export function useChat(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (!userId) return
    api.get<Record<string, unknown>[]>('/api/chats')
      .then(data => setConversations(data.map(mapConversation)))
      .catch(() => setConversations([]))
  }, [userId])

  const getOrCreateConversation = useCallback((
    professionalId: string,
    professionalName: string,
    professionalInitials: string,
    professionalAvatarUrl?: string,
  ): Conversation => {
    const convId = `${userId}_${professionalId}`
    const existing = conversations.find(c => c.id === convId)
    if (existing) return existing

    const conv: Conversation = { id: convId, professionalId, professionalName, professionalInitials, professionalAvatarUrl, messages: [] }
    setConversations(prev => [...prev, conv])

    api.post<Record<string, unknown>>('/api/chats', { professionalId, professionalName, professionalInitials, professionalAvatarUrl })
      .then(data => {
        const mapped = mapConversation(data)
        setConversations(prev => prev.map(c => c.id === mapped.id ? { ...mapped, messages: c.messages } : c))
      })
      .catch(() => {})

    return conv
  }, [userId, conversations])

  const sendMessage = useCallback((conversationId: string, senderId: string, senderName: string, text: string): ChatMessage => {
    const tempId = `msg-${Date.now()}`
    const message: ChatMessage = { id: tempId, senderId, senderName, text, timestamp: new Date().toISOString() }

    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
    ))

    api.post<Record<string, unknown>>(`/api/chats/${conversationId}/messages`, { senderName, text })
      .then(data => {
        const real = mapMessage(data)
        setConversations(prev => prev.map(c => {
          if (c.id !== conversationId) return c
          return { ...c, messages: c.messages.map(m => m.id === tempId ? real : m) }
        }))
      })
      .catch(() => {
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
