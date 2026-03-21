'use client'

import { useCallback, useEffect, useState } from 'react'

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

const STORAGE_KEY = 'equobra_interests'

function load(): Interest[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Interest[]) : []
  } catch { return [] }
}

function save(list: Interest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function useInterests(contractorId?: string) {
  const [interests, setInterests] = useState<Interest[]>([])

  useEffect(() => {
    const all = load()
    setInterests(contractorId ? all.filter(i => i.contractorId === contractorId) : all)
  }, [contractorId])

  const addInterest = useCallback((interest: Omit<Interest, 'id' | 'createdAt'>) => {
    const all = load()
    if (all.some(i => i.contractorId === interest.contractorId && i.professionalId === interest.professionalId)) return
    const entry: Interest = { ...interest, id: `int-${Date.now()}`, createdAt: new Date().toISOString() }
    const next = [...all, entry]
    save(next)
    if (contractorId) setInterests(next.filter(i => i.contractorId === contractorId))
  }, [contractorId])

  return { interests, addInterest }
}
