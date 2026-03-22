'use client'

import { useState, useRef, useEffect } from 'react'

interface FaqEntry {
  question: string
  answer: string
  follow?: string[]
}

const FAQ: Record<string, FaqEntry> = {
  how_works: {
    question: 'Como funciona a plataforma?',
    answer:
      'A EquaObra conecta contratantes e empreiteiros a profissionais qualificados para obras de pequeno a grande porte. Você busca profissionais por localidade e especialidade, monta a equipe ideal, acompanha o registro de horas e gerencia tudo em um só lugar.',
    follow: ['how_register', 'how_create_team', 'is_safe'],
  },
  how_register: {
    question: 'Como me cadastro?',
    answer:
      'Basta clicar em "Entrar" no menu superior, depois em "Criar conta". Escolha seu perfil — Profissional ou Contratante — preencha nome, e-mail e senha. Pronto! A conta é gratuita para ambos os tipos.',
    follow: ['how_works', 'how_create_team'],
  },
  how_create_team: {
    question: 'Como crio minha equipe?',
    answer:
      'Encontre profissionais na tela de busca e clique em "+ Equipe" no perfil de cada um. Você será guiado para criar uma equipe (ou adicionar a uma existente), definindo nome da obra, localização e prazo estimado. O profissional entra e você pode acompanhar tudo no painel.',
    follow: ['how_add_member', 'how_worklogs'],
  },
  how_add_member: {
    question: 'Posso adicionar vários profissionais?',
    answer:
      'Sim! Não há limite de membros por equipe. Você pode adicionar pedreiros, eletricistas, encanadores e qualquer outro especialista. Cada membro tem seu próprio registro de horas e você vê o custo total estimado automaticamente.',
    follow: ['how_worklogs', 'how_payment'],
  },
  how_worklogs: {
    question: 'Como funciona o registro de horas?',
    answer:
      'Dentro de cada equipe há uma seção de "Registro de Horas". O líder pode adicionar horas para qualquer membro; os demais só registram as próprias horas. Membros podem solicitar exclusão de registros, mas só o líder confirma. Todos recebem notificações das alterações.',
    follow: ['how_create_team', 'how_payment'],
  },
  is_safe: {
    question: 'A plataforma é segura?',
    answer:
      'Sim. Os dados ficam protegidos e nunca compartilhamos suas informações com terceiros sem consentimento. Os profissionais são avaliados por contratantes anteriores, garantindo transparência. Você pode ocultar informações sensíveis (como valor/hora) do seu perfil quando quiser.',
    follow: ['payment', 'is_free'],
  },
  payment: {
    question: 'O pagamento é feito pela plataforma?',
    answer:
      'Ainda não. Por enquanto a EquaObra é uma plataforma de conexão e gestão de equipes. O pagamento entre contratante e profissional é combinado diretamente entre as partes, fora da plataforma. Estamos desenvolvendo integração de pagamento para versões futuras.',
    follow: ['is_free', 'how_works'],
  },
  is_free: {
    question: 'A plataforma é gratuita?',
    answer:
      'O cadastro e o uso básico — busca, montagem de equipes e registro de horas — são totalmente gratuitos. Funcionalidades avançadas (relatórios, pagamentos integrados, verificação de profissionais) serão parte de planos premium em breve.',
    follow: ['how_register', 'payment'],
  },
  find_professional: {
    question: 'Como encontro um profissional?',
    answer:
      'Na tela "Minhas Equipes" clique em qualquer profissional ou use a busca no topo. Você pode filtrar por especialidade, localidade, nota mínima e valor máximo por hora. No mapa interativo você vê quem está perto de você.',
    follow: ['how_create_team', 'how_add_member'],
  },
  whatsapp: {
    question: 'Posso contatar o profissional diretamente?',
    answer:
      'Sim! Cada membro da equipe tem um ícone de WhatsApp (quando o número está cadastrado) e um ícone de chat interno. Pelo chat interno você conversa direto pela plataforma sem sair dela; pelo WhatsApp você vai para o app de mensagens.',
    follow: ['how_works', 'is_safe'],
  },
}
const INITIAL_SUGGESTIONS = ['how_works', 'how_register', 'is_safe', 'payment', 'find_professional']

type MessageType = 'bot' | 'user'
interface Message {
  id: string
  type: MessageType
  text: string
  suggestions?: string[]
}

function uid() {
  return Math.random().toString(36).slice(2)
}

export function SupportChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      type: 'bot',
      text: 'Olá! 👋 Sou o assistente da EquaObra. Como posso te ajudar?',
      suggestions: INITIAL_SUGGESTIONS,
    },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  function handleSelect(key: string) {
    const entry = FAQ[key]
    if (!entry) return

    const userMsg: Message = { id: uid(), type: 'user', text: entry.question }
    const botMsg: Message = {
      id: uid(),
      type: 'bot',
      text: entry.answer,
      suggestions: entry.follow,
    }
    setMessages((prev) => [...prev, userMsg, botMsg])
  }

  function handleReset() {
    setMessages([
      {
        id: uid(),
        type: 'bot',
        text: 'Tudo bem! Sobre o que mais posso te ajudar?',
        suggestions: INITIAL_SUGGESTIONS,
      },
    ])
  }

  const lastMsg = messages[messages.length - 1]
  const hasSuggestions = lastMsg?.suggestions && lastMsg.suggestions.length > 0

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Suporte"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open ? 'rgba(224,123,42,0.9)' : '#E07B2A',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(224,123,42,0.45), 0 2px 8px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, background 0.2s',
          transform: open ? 'rotate(45deg) scale(0.95)' : 'scale(1)',
        }}
      >
        {open ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            zIndex: 999,
            width: 340,
            maxHeight: 520,
            background: 'rgba(13,12,11,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(224,123,42,0.15)',
                border: '1.5px solid rgba(224,123,42,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E07B2A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Suporte EquaObra</p>
              <p className="text-xs" style={{ color: 'rgba(245,240,235,0.35)' }}>
                Respostas rápidas e automáticas
              </p>
            </div>
            <div
              style={{
                marginLeft: 'auto',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4CAF50',
                boxShadow: '0 0 6px #4CAF50',
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.map((msg, i) => (
              <div key={msg.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {msg.type === 'bot' && (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'rgba(224,123,42,0.15)',
                        border: '1px solid rgba(224,123,42,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginRight: 8,
                        marginTop: 2,
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#E07B2A"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '8px 12px',
                      borderRadius:
                        msg.type === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                      background: msg.type === 'user' ? '#E07B2A' : 'rgba(255,255,255,0.06)',
                      border: msg.type === 'user' ? 'none' : '1px solid rgba(255,255,255,0.07)',
                      fontSize: 12.5,
                      lineHeight: 1.5,
                      color: msg.type === 'user' ? 'white' : 'rgba(245,240,235,0.85)',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>

                {msg.type === 'bot' && msg.suggestions && i === messages.length - 1 && (
                  <div
                    style={{
                      marginLeft: 30,
                      marginTop: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                    }}
                  >
                    {msg.suggestions.map((key) => {
                      const entry = FAQ[key]
                      if (!entry) return null
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelect(key)}
                          style={{
                            textAlign: 'left',
                            padding: '7px 12px',
                            borderRadius: 12,
                            fontSize: 11.5,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            color: 'rgba(245,240,235,0.7)',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = 'rgba(224,123,42,0.1)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')
                          }
                        >
                          {entry.question}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
          >
            {hasSuggestions ? (
              <p style={{ fontSize: 10.5, color: 'rgba(245,240,235,0.25)' }}>
                Selecione uma pergunta acima
              </p>
            ) : (
              <button
                onClick={handleReset}
                style={{
                  fontSize: 11,
                  color: '#E07B2A',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ← Ver todas as perguntas
              </button>
            )}
            <p style={{ fontSize: 10, color: 'rgba(245,240,235,0.2)' }}>EquaObra Suporte</p>
          </div>
        </div>
      )}
    </>
  )
}
