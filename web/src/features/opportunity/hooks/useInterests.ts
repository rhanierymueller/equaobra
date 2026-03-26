'use client'

import { useCallback, useEffect, useState } from 'react'

import { useToast } from '@/src/hooks/useToast'
import { api } from '@/src/services/api'

export interface Interest {
  id: string
  contractorId: string
  professionalId: string
  professionalName: string
  professionalInitials: string
  professionalAvatarUrl?: string
  profession?: string
  location?: string
  rating?: number
  createdAt: string
}

export function useInterests(contractorId?: string) {
  const [interests, setInterests] = useState<Interest[]>([])
  const toast = useToast()

  useEffect(() => {
    const url = contractorId ? `/api/interests/contractor/${contractorId}` : '/api/interests'
    api
      .get<Interest[]>(url)
      .then((data) => setInterests(data))
      .catch(() => setInterests([]))
  }, [contractorId])

  const addInterest = useCallback(async (interest: Omit<Interest, 'id' | 'createdAt'>) => {
    try {
      const created = await api.post<Interest>('/api/interests', interest)
      setInterests((prev) => {
        const alreadyExists = prev.some(
          (i) =>
            i.contractorId === interest.contractorId &&
            i.professionalId === interest.professionalId,
        )
        return alreadyExists ? prev : [...prev, created]
      })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('já registrado')) return
      toast.error('Erro ao salvar interesse.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { interests, addInterest }
}
