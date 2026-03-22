'use client'

import { useCallback, useEffect, useState } from 'react'
import { api, getToken } from '@/src/services/api'
import type { Opportunity } from '@/src/types/opportunity.types'

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
]

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])

  const refresh = useCallback(async () => {
    try {
      const feedPromise = api.get<Opportunity[]>('/api/opportunities')

      const minePromise = getToken()
        ? api.get<Opportunity[]>('/api/opportunities/mine').catch(() => [] as Opportunity[])
        : Promise.resolve([] as Opportunity[])

      const [feed, mine] = await Promise.all([feedPromise, minePromise])

      const myIds = new Set(mine.map(o => o.id))
      const merged = [...mine, ...feed.filter(o => !myIds.has(o.id))]
      setOpportunities(merged)
    } catch {
      setOpportunities(MOCK_OPPORTUNITIES)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const publish = useCallback(async (opp: Omit<Opportunity, 'id' | 'createdAt' | 'active'>): Promise<Opportunity> => {
    const created = await api.post<Opportunity>('/api/opportunities', opp)
    setOpportunities(prev => [created, ...prev])
    return created
  }, [])

  const updateOpportunity = useCallback(async (id: string, data: Partial<Omit<Opportunity, 'id' | 'createdAt'>>) => {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, ...data } : o))
    try {
      const updated = await api.patch<Opportunity>(`/api/opportunities/${id}`, data)
      setOpportunities(prev => prev.map(o => o.id === id ? updated : o))
    } catch {
      refresh()
    }
  }, [refresh])

  const deleteOpportunity = useCallback(async (id: string) => {
    setOpportunities(prev => prev.filter(o => o.id !== id))
    try {
      await api.delete(`/api/opportunities/${id}`)
    } catch {
      refresh()
    }
  }, [refresh])

  const getContractorOpportunities = useCallback((contractorId: string): Opportunity[] => {
    return opportunities.filter(o => o.contractorId === contractorId)
  }, [opportunities])

  return { opportunities, publish, updateOpportunity, deleteOpportunity, getContractorOpportunities, refresh }
}
