'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { HiShieldCheck } from 'react-icons/hi2'
import { IoChatbubblesSharp } from 'react-icons/io5'
import { MdConstruction } from 'react-icons/md'

import { LandingCanvas } from './LandingCanvas'

interface Feature {
  icon: ReactNode
  title: string
  desc: string
}

interface Step {
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    icon: <HiShieldCheck size={26} color="#E07B2A" />,
    title: 'Profissionais Verificados',
    desc: 'Todos passam por validação de documentos e avaliações de obras anteriores antes de aparecerem na busca.',
  },
  {
    icon: <IoChatbubblesSharp size={26} color="#E07B2A" />,
    title: 'Chat Integrado',
    desc: 'Converse diretamente com os candidatos antes de fechar. Rápido, sem intermediários e com histórico.',
  },
  {
    icon: <MdConstruction size={26} color="#E07B2A" />,
    title: 'Gestão de Obras',
    desc: 'Organize múltiplas obras, acompanhe equipes ativas e veja o histórico completo de contratações.',
  },
]

const STEPS: Step[] = [
  {
    title: 'Cadastre sua obra',
    desc: 'Informe o tipo, localização e as especialidades que você precisa. Leva menos de 2 minutos.',
  },
  {
    title: 'Encontre profissionais',
    desc: 'Filtre por especialidade, avaliação e distância. Leia perfis completos com histórico real.',
  },
  {
    title: 'Monte sua equipe',
    desc: 'Adicione os escolhidos, combine os detalhes pelo chat e comece a obra com confiança.',
  },
]

type PhaseId = 0 | 1 | 2 | 3

function getPhase(progress: number): PhaseId {
  if (progress < 0.22) return 0
  if (progress < 0.5) return 1
  if (progress < 0.76) return 2
  return 3
}

function PhaseContent({ phase }: { phase: PhaseId }) {
  return (
    <>
      <div
        className="absolute inset-x-0 flex flex-col items-center transition-all duration-700"
        style={{
          opacity: phase === 0 ? 1 : 0,
          transform: `translateY(${phase === 0 ? 0 : phase > 0 ? -24 : 24}px)`,
          pointerEvents: phase === 0 ? 'auto' : 'none',
        }}
      >
        <p
          className="text-xl font-light tracking-[0.35em] uppercase"
          style={{ color: 'rgba(245,240,235,0.7)' }}
        >
          A plataforma que constrói equipes
        </p>
        <div className="mt-5 w-14 h-px" style={{ background: '#E07B2A' }} />
      </div>

      <div
        className="absolute inset-x-0 flex flex-col items-center transition-all duration-700"
        style={{
          opacity: phase === 1 ? 1 : 0,
          transform: `translateY(${phase === 1 ? 0 : phase > 1 ? -24 : 24}px)`,
          pointerEvents: phase === 1 ? 'auto' : 'none',
        }}
      >
        <span
          className="text-xs tracking-[0.45em] uppercase mb-4 font-medium"
          style={{ color: '#E07B2A' }}
        >
          Profissionais
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Encontre os melhores
          <br />
          <span style={{ color: '#E07B2A' }}>do mercado</span>
        </h2>
        <p className="text-lg max-w-md leading-relaxed" style={{ color: 'rgba(245,240,235,0.62)' }}>
          Pedreiros, eletricistas, encanadores e mais — filtrados por localidade e avaliação real
        </p>
      </div>

      <div
        className="absolute inset-x-0 flex flex-col items-center transition-all duration-700"
        style={{
          opacity: phase === 2 ? 1 : 0,
          transform: `translateY(${phase === 2 ? 0 : phase > 2 ? -24 : 24}px)`,
          pointerEvents: phase === 2 ? 'auto' : 'none',
        }}
      >
        <span
          className="text-xs tracking-[0.45em] uppercase mb-4 font-medium"
          style={{ color: '#E07B2A' }}
        >
          Equipes
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Monte equipes para
          <br />
          <span style={{ color: '#E07B2A' }}>qualquer obra</span>
        </h2>
        <p className="text-lg max-w-md leading-relaxed" style={{ color: 'rgba(245,240,235,0.62)' }}>
          Do acabamento à estrutura — forme equipes completas com poucos cliques e sem burocracia
        </p>
      </div>

      <div
        className="absolute inset-x-0 flex flex-col items-center transition-all duration-700"
        style={{
          opacity: phase === 3 ? 1 : 0,
          transform: `translateY(${phase === 3 ? 0 : 28}px)`,
          pointerEvents: phase === 3 ? 'auto' : 'none',
        }}
      >
        <h2 className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
          Sua obra
          <br />
          <span style={{ color: '#E07B2A' }}>começa aqui</span>
        </h2>
        <p
          className="text-xl max-w-md leading-relaxed mb-10"
          style={{ color: 'rgba(245,240,235,0.65)' }}
        >
          Cadastre-se gratuitamente e monte sua primeira equipe ainda hoje
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/auth"
            className="px-9 py-4 rounded-full font-bold text-white text-lg transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
            style={{ background: '#E07B2A' }}
          >
            Começar agora
          </Link>
          <Link
            href="/home"
            className="px-9 py-4 rounded-full font-semibold text-white text-lg border transition-all duration-200 hover:bg-white/10 active:scale-95"
            style={{ borderColor: 'rgba(255,255,255,0.22)' }}
          >
            Ver profissionais
          </Link>
        </div>
      </div>
    </>
  )
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const [phase, setPhase] = useState<PhaseId>(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrolled = -rect.top
      const total = el.scrollHeight - window.innerHeight
      const p = Math.max(0, Math.min(1, scrolled / total))
      progressRef.current = p
      const next = getPhase(p)
      setPhase((prev) => (prev !== next ? next : prev))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main style={{ background: 'var(--color-background)', color: 'var(--color-text)' }}>
      <div ref={containerRef} style={{ height: '600vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <LandingCanvas progressRef={progressRef} />

          <div
            className="absolute inset-0 z-1 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(13,12,11,0.82) 0%, rgba(13,12,11,0.45) 55%, transparent 100%)',
            }}
          />

          <div className="relative z-10 h-full flex flex-col items-center pointer-events-none select-none px-6">
            <div
              className="mt-[30vh] flex items-baseline gap-0 transition-opacity duration-700"
              style={{ opacity: phase < 3 ? 1 : 0.55 }}
            >
              <span
                className="font-black text-6xl md:text-7xl tracking-[0.18em] uppercase"
                style={{ color: '#E07B2A' }}
              >
                Equa
              </span>
              <span
                className="font-black text-6xl md:text-7xl tracking-[0.18em] uppercase"
                style={{ color: 'var(--color-text)' }}
              >
                Obra
              </span>
            </div>

            <div className="relative w-full flex justify-center mt-10" style={{ minHeight: 280 }}>
              <PhaseContent phase={phase} />
            </div>
          </div>

          <div
            className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 transition-opacity duration-500"
            style={{ opacity: phase < 3 ? 1 : 0 }}
          >
            <div
              className="w-px h-11 animate-pulse"
              style={{ background: 'linear-gradient(to bottom, transparent, #E07B2A)' }}
            />
            <span
              className="text-[10px] tracking-[0.38em] uppercase font-medium"
              style={{ color: 'rgba(224,123,42,0.58)' }}
            >
              Role para explorar
            </span>
          </div>

          <div className="absolute right-7 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
            {([0, 1, 2, 3] as PhaseId[]).map((p) => (
              <div
                key={p}
                className="rounded-full transition-all duration-300"
                style={{
                  width: p === phase ? 8 : 5,
                  height: p === phase ? 8 : 5,
                  background: p === phase ? '#E07B2A' : 'rgba(255,255,255,0.2)',
                  transform: p === phase ? 'scale(1.35)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <section style={{ background: '#F5F0EB' }} className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p
            className="text-center text-[11px] tracking-[0.45em] uppercase mb-3 font-semibold"
            style={{ color: '#E07B2A' }}
          >
            Recursos
          </p>
          <h2
            className="text-3xl md:text-4xl font-black text-center mb-3"
            style={{ color: '#1A1A1A' }}
          >
            Tudo o que você precisa
          </h2>
          <p
            className="text-center mb-16 text-lg max-w-lg mx-auto leading-relaxed"
            style={{ color: '#6B6B6B' }}
          >
            Recursos pensados para obras de pequeno a grande porte
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-3xl"
                  style={{ background: 'rgba(224,123,42,0.1)' }}
                >
                  {feat.icon}
                </div>
                <h3 className="font-bold text-xl mb-3" style={{ color: '#1A1A1A' }}>
                  {feat.title}
                </h3>
                <p className="leading-relaxed" style={{ color: '#6B6B6B' }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#3B3B3B' }} className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-center text-[11px] tracking-[0.45em] uppercase mb-3 font-semibold"
            style={{ color: '#E07B2A' }}
          >
            Processo
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-3">
            Como funciona
          </h2>
          <p className="text-center mb-16 text-lg" style={{ color: 'rgba(255,255,255,0.48)' }}>
            Em 3 passos simples
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div
              className="hidden md:block absolute top-7 h-px"
              style={{
                left: '16.66%',
                right: '16.66%',
                background:
                  'linear-gradient(to right, transparent, rgba(224,123,42,0.35), transparent)',
              }}
            />
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-black text-white text-xl mb-5 shadow-lg"
                  style={{ background: '#E07B2A' }}
                >
                  {i + 1}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.48)' }} className="leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#E07B2A' }} className="py-28 px-6 text-center">
        <p
          className="text-[11px] tracking-[0.45em] uppercase mb-4 font-semibold"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Comece hoje
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Sua próxima obra
          <br />
          começa aqui
        </h2>
        <p
          className="text-xl mb-12 max-w-xl mx-auto leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.72)' }}
        >
          Junte-se a centenas de contratantes que já usam o EquaObra para montar equipes de
          excelência
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/auth"
            className="px-10 py-4 bg-white font-bold rounded-full text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            style={{ color: '#E07B2A' }}
          >
            Criar conta gratuita
          </Link>
          <Link
            href="/auth"
            className="px-10 py-4 border-2 border-white text-white font-bold rounded-full text-lg transition-all duration-200 hover:bg-white/15 active:scale-95"
          >
            Sou profissional
          </Link>
        </div>
      </section>
    </main>
  )
}
