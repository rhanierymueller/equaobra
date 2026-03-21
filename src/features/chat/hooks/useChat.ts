'use client'

import { useState, useCallback } from 'react'
import type { Conversation, ChatMessage } from '@/src/types/chat.types'

const STORAGE_KEY = 'equobra_chats'

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Conversation[]
  } catch {
    return []
  }
}

function persist(updater: (prev: Conversation[]) => Conversation[]) {
  const current = loadConversations()
  const next = updater(current)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function useChat(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations())

  const getOrCreateConversation = useCallback((
    professionalId: string,
    professionalName: string,
    professionalInitials: string,
    professionalAvatarUrl?: string,
  ): Conversation => {
    const existing = loadConversations().find(c => c.id === `${userId}_${professionalId}`)
    if (existing) return existing
    const conv: Conversation = {
      id: `${userId}_${professionalId}`,
      professionalId,
      professionalName,
      professionalInitials,
      professionalAvatarUrl,
      messages: [],
    }
    const next = persist(prev => [...prev, conv])
    setConversations(next)
    return conv
  }, [userId])

  const sendMessage = useCallback((conversationId: string, senderId: string, senderName: string, text: string) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
    }
    const next = persist(prev => prev.map(c =>
      c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
    ))
    setConversations(next)
    return message
  }, [])

  const getConversation = useCallback((conversationId: string): Conversation | undefined => {
    return conversations.find(c => c.id === conversationId)
  }, [conversations])

  return { conversations, getOrCreateConversation, sendMessage, getConversation }
}
