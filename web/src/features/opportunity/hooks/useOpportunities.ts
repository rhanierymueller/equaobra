'use client'

import { useCallback, useEffect, useState } from 'react'

import { useToast } from '@/src/hooks/useToast'
import { api, getToken } from '@/src/services/api'
import type { Opportunity } from '@/src/types/opportunity.types'

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const toast = useToast()

  const refresh = useCallback(async () => {
    try {
      const feedPromise = api.get<Opportunity[]>('/api/opportunities')

      const minePromise = getToken()
        ? api.get<Opportunity[]>('/api/opportunities/mine').catch(() => [] as Opportunity[])
        : Promise.resolve([] as Opportunity[])

      const [feed, mine] = await Promise.all([feedPromise, minePromise])

      const myIds = new Set(mine.map((o) => o.id))
      const merged = [...mine, ...feed.filter((o) => !myIds.has(o.id))]
      setOpportunities(merged)
    } catch {
      setOpportunities([])
    }
  }, [])

  useEffect(() => {
    const feedPromise = api.get<Opportunity[]>('/api/opportunities')
    const minePromise = getToken()
      ? api.get<Opportunity[]>('/api/opportunities/mine').catch(() => [] as Opportunity[])
      : Promise.resolve([] as Opportunity[])

    Promise.all([feedPromise, minePromise])
      .then(([feed, mine]) => {
        const myIds = new Set(mine.map((o) => o.id))
        setOpportunities([...mine, ...feed.filter((o) => !myIds.has(o.id))])
      })
      .catch(() => setOpportunities([]))
  }, [])

  const publish = useCallback(
    async (opp: Omit<Opportunity, 'id' | 'createdAt' | 'active'>): Promise<Opportunity> => {
      const created = await api.post<Opportunity>('/api/opportunities', opp)
      setOpportunities((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const updateOpportunity = useCallback(
    async (id: string, data: Partial<Omit<Opportunity, 'id' | 'createdAt'>>) => {
      setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)))
      try {
        const updated = await api.patch<Opportunity>(`/api/opportunities/${id}`, data)
        setOpportunities((prev) => prev.map((o) => (o.id === id ? updated : o)))
      } catch {
        toast.error('Erro ao atualizar oportunidade.')
        refresh()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh],
  )

  const deleteOpportunity = useCallback(
    async (id: string) => {
      setOpportunities((prev) => prev.filter((o) => o.id !== id))
      try {
        await api.delete(`/api/opportunities/${id}`)
      } catch {
        toast.error('Erro ao remover oportunidade.')
        refresh()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh],
  )

  const getContractorOpportunities = useCallback(
    (contractorId: string): Opportunity[] => {
      return opportunities.filter((o) => o.contractorId === contractorId)
    },
    [opportunities],
  )

  return {
    opportunities,
    publish,
    updateOpportunity,
    deleteOpportunity,
    getContractorOpportunities,
    refresh,
  }
}
