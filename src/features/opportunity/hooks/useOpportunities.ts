'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Opportunity } from '@/src/types/opportunity.types'

const STORAGE_KEY = 'equobra_opportunities'

// ── Mock seed data ─────────────────────────────────────────────────────────────

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-mock-1', contractorId: 'mock-contractor-1', contractorName: 'Carlos Mendonça',
    companyName: 'Construtora Mendonça', avatarInitials: 'CM',
    obraDescription: 'Reforma completa de edifício residencial de 8 andares. Precisamos de equipe experiente para acabamento e instalações.',
    obraLocation: 'São Paulo, SP', lat: -23.5505, lng: -46.6333,
    obraStart: '2026-04-01', obraDuration: '60 dias',
    lookingForProfessions: ['Pedreiro', 'Eletricista', 'Pintor'],
    contactEmail: 'carlos@construtoramendonca.com.br', contactPhone: '11999990001',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), active: true,
  },
  {
    id: 'opp-mock-2', contractorId: 'mock-contractor-2', contractorName: 'Ana Ferreira',
    companyName: 'AF Engenharia', avatarInitials: 'AF',
    obraDescription: 'Construção de galpão industrial 2.000m². Estrutura metálica já contratada, precisamos de acabamento civil.',
    obraLocation: 'Guarulhos, SP', lat: -23.4628, lng: -46.5330,
    obraStart: '2026-04-15', obraDuration: '45 dias',
    lookingForProfessions: ['Pedreiro', 'Encanador'],
    contactEmail: 'ana@afengenharia.com', contactPhone: '11988880002',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), active: true,
  },
  {
    id: 'opp-mock-3', contractorId: 'mock-contractor-3', contractorName: 'Roberto Lima',
    avatarInitials: 'RL',
    obraDescription: 'Casa térrea nova de 180m² em condomínio fechado. Projeto aprovado, terreno preparado.',
    obraLocation: 'Campinas, SP', lat: -22.9071, lng: -47.0627,
    obraStart: '2026-05-01', obraDuration: '90 dias',
    lookingForProfessions: ['Pedreiro', 'Eletricista', 'Encanador', 'Azulejista'],
    contactEmail: 'roberto.lima@gmail.com',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), active: true,
  },
  {
    id: 'opp-mock-4', contractorId: 'mock-contractor-4', contractorName: 'Mariana Costa',
    companyName: 'Reformas Costa', avatarInitials: 'MC',
    obraDescription: 'Reforma de apartamento 80m² — troca de revestimentos, pintura, elétrica e hidráulica.',
    obraLocation: 'Santo André, SP', lat: -23.6639, lng: -46.5338,
    obraStart: '2026-03-25', obraDuration: '20 dias',
    lookingForProfessions: ['Azulejista', 'Eletricista', 'Pintor'],
    contactEmail: 'mariana@reformascosta.com', contactPhone: '11977770004',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), active: true,
  },
  {
    id: 'opp-mock-5', contractorId: 'mock-contractor-5', contractorName: 'Fernando Braga',
    companyName: 'Braga Construções', avatarInitials: 'FB',
    obraDescription: 'Obra de condomínio horizontal com 12 casas. Etapa atual: fundação e alvenaria.',
    obraLocation: 'Osasco, SP', lat: -23.5329, lng: -46.7916,
    obraStart: '2026-04-10', obraDuration: '120 dias',
    lookingForProfessions: ['Pedreiro', 'Carpinteiro', 'Servente de Obras'],
    contactEmail: 'fernando@bragaconstrucoes.com', contactPhone: '11966660005',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), active: true,
  },
]

// ── Storage helpers ────────────────────────────────────────────────────────────

function loadStored(): Opportunity[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Opportunity[]) : []
  } catch { return [] }
}

function persistStored(list: Opportunity[]) {
  const real = list.filter(o => !o.id.startsWith('opp-mock-'))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(real))
}

function buildFeed(stored: Opportunity[]): Opportunity[] {
  const realContractorIds = new Set(stored.map(o => o.contractorId))
  const mocks = MOCK_OPPORTUNITIES.filter(m => !realContractorIds.has(m.contractorId))
  return [...mocks, ...stored].filter(o => o.active)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])

  const refresh = useCallback(() => {
    setOpportunities(buildFeed(loadStored()))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Always creates a new opportunity (no upsert)
  const publish = useCallback((opp: Omit<Opportunity, 'id' | 'createdAt' | 'active'>): Opportunity => {
    const stored = loadStored()
    const entry: Opportunity = {
      ...opp, id: `opp-${Date.now()}`,
      createdAt: new Date().toISOString(), active: true,
    }
    const next = [...stored, entry]
    persistStored(next)
    setOpportunities(buildFeed(next))
    return entry
  }, [])

  const updateOpportunity = useCallback((id: string, data: Partial<Omit<Opportunity, 'id' | 'createdAt'>>) => {
    const stored = loadStored()
    const next = stored.map(o => o.id === id ? { ...o, ...data } : o)
    persistStored(next)
    setOpportunities(buildFeed(next))
  }, [])

  const deleteOpportunity = useCallback((id: string) => {
    const stored = loadStored()
    const next = stored.filter(o => o.id !== id)
    persistStored(next)
    setOpportunities(buildFeed(next))
  }, [])

  // Returns all opportunities for a specific contractor (active + inactive)
  const getContractorOpportunities = useCallback((contractorId: string): Opportunity[] => {
    return loadStored().filter(o => o.contractorId === contractorId)
  }, [])

  return { opportunities, publish, updateOpportunity, deleteOpportunity, getContractorOpportunities, refresh }
}
