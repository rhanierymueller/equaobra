import { useState, useEffect, useCallback } from 'react'

import { api } from '../services/api'
import type { Opportunity } from '../types'

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const [pub, mine] = await Promise.allSettled([
        api.get<Opportunity[]>('/api/opportunities'),
        api.get<Opportunity[]>('/api/opportunities/mine'),
      ])
      const pubList = pub.status === 'fulfilled' ? pub.value : []
      const mineList = mine.status === 'fulfilled' ? mine.value : []
      const merged = [...mineList]
      for (const opp of pubList) {
        if (!merged.some((m) => m.id === opp.id)) merged.push(opp)
      }
      setOpportunities(merged)
    } catch {
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const applyToOpportunity = useCallback(
    async (
      opp: Opportunity,
      user: {
        id: string
        name: string
        initials: string
        profession?: string
        location?: string
        rating?: number
      },
    ) => {
      await api.post('/api/interests', {
        contractorId: opp.contractorId,
        professionalId: user.id,
        professionalName: user.name,
        professionalInitials: user.initials,
        profession: user.profession,
        location: user.location,
        rating: user.rating,
      })
    },
    [],
  )

  return { opportunities, loading, refresh, applyToOpportunity }
}
