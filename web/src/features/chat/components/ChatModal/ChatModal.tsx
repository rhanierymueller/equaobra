'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '../../hooks/useChat'
import type { User } from '@/src/types/user.types'
import type { TeamMember } from '@/src/types/team.types'

interface ChatModalProps {
  user: User
  professional: Pick<TeamMember, 'professionalId' | 'name' | 'avatarInitials' | 'avatarUrl' | 'profession'>
  onClose: () => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoje'
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function ChatModal({ user, professional, onClose }: ChatModalProps) {
  const { getOrCreateConversation, sendMessage, getConversation, conversations } = useChat(user.id)
  const [text, setText] = useState('')
  const [convId, setConvId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const conv = getOrCreateConversation(
      professional.professionalId,
      professional.name,
      professional.avatarInitials,
      professional.avatarUrl,
    )
    setConvId(conv.id)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, convId])

  const conv = convId ? getConversation(convId) : null
  const messages = conv?.messages ?? []

  function handleSend() {
    if (!text.trim() || !convId) return
    sendMessage(convId, user.id, user.name, text.trim())
    setText('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const grouped: { day: string; messages: typeof messages }[] = []
  for (const msg of messages) {
    const day = formatDay(msg.timestamp)
    const last = grouped[grouped.length - 1]
    if (last?.day === day) last.messages.push(msg)
    else grouped.push({ day, messages: [msg] })
  }

  const userInitials = user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <>
            <div
        style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

            <div style={{
        position: 'fixed', bottom: 0, right: 0,
        zIndex: 3001, width: '100%', maxWidth: 400,
        height: '100%', maxHeight: 580,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(15,14,12,0.99)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -16px 64px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>
                <div style={{ height: 3, background: 'linear-gradient(to right, #E07B2A, #E07B2A44)' }} />

                <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: 'rgba(224,123,42,0.15)', color: '#E07B2A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, border: '1.5px solid rgba(224,123,42,0.3)',
          }}>
            {professional.avatarUrl
              ? <img src={professional.avatarUrl} alt={professional.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : professional.avatarInitials
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{professional.name}</p>
            <p className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>{professional.profession}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: 'rgba(245,240,235,0.4)', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

                <div className="flex-1 overflow-y-auto px-4 py-4" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div style={{ fontSize: 32 }}>💬</div>
              <p className="text-sm font-semibold text-white">Iniciar conversa</p>
              <p className="text-xs text-center" style={{ color: 'rgba(245,240,235,0.4)' }}>
                Mande uma mensagem para {professional.name.split(' ')[0]}
              </p>
            </div>
          )}

          {grouped.map(group => (
            <div key={group.day}>
              <div className="flex items-center gap-3 my-4">
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-xs px-2" style={{ color: 'rgba(245,240,235,0.3)' }}>{group.day}</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>
              {group.messages.map(msg => {
                const isMe = msg.senderId === user.id
                return (
                  <div
                    key={msg.id}
                    className="flex items-end gap-2 mb-3"
                    style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}
                  >
                    {!isMe && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                        background: 'rgba(224,123,42,0.15)', color: '#E07B2A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 11,
                      }}>
                        {professional.avatarUrl
                          ? <img src={professional.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : professional.avatarInitials
                        }
                      </div>
                    )}
                    {isMe && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,0.08)', color: 'rgba(245,240,235,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 11,
                      }}>
                        {userInitials}
                      </div>
                    )}
                    <div style={{ maxWidth: '72%' }}>
                      <div
                        className="text-sm px-3 py-2 rounded-2xl"
                        style={{
                          background: isMe ? '#E07B2A' : 'rgba(255,255,255,0.07)',
                          color: isMe ? 'white' : '#F5F0EB',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          lineHeight: 1.45,
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.text}
                      </div>
                      <p className="mt-1 text-right" style={{ fontSize: 10, color: 'rgba(245,240,235,0.3)', textAlign: isMe ? 'right' : 'left' }}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

                <div className="px-3 pb-4 pt-2" style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Mensagem para ${professional.name.split(' ')[0]}...`}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.09)',
                color: '#F5F0EB',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(224,123,42,0.5)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              style={{
                width: 40, height: 40, borderRadius: 12, border: 'none', cursor: text.trim() ? 'pointer' : 'default',
                background: text.trim() ? '#E07B2A' : 'rgba(255,255,255,0.06)',
                color: text.trim() ? 'white' : 'rgba(245,240,235,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
