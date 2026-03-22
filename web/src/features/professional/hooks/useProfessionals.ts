'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'

import { MOCK_PROFESSIONALS } from '../professional.mock'

import { api } from '@/src/services/api'
import type { Professional, ProfessionalFilters, Profession } from '@/src/types/professional.types'

const DEFAULT_FILTERS: ProfessionalFilters = {
  search: '',
  locality: '',
  professions: [],
  minRating: 0,
  maxDistanceKm: 50,
  availableOnly: false,
}

interface RawUser {
  id: string
  name: string
  profession?: string
  rating?: number
  reviewCount?: number
  available?: boolean
  phone?: string
  bio?: string
  address?: { lat?: number; lng?: number; neighborhood?: string; city?: string }
  avatarUrl?: string
  tags?: string[]
  hourlyRate?: number
}

function userToProfessional(u: RawUser): Professional {
  return {
    id: u.id,
    name: u.name,
    profession: (u.profession ?? '') as Profession,
    rating: u.rating ?? 0,
    reviewCount: u.reviewCount ?? 0,
    distanceKm: 0,
    available: u.available ?? true,
    phone: u.phone ?? '',
    bio: u.bio ?? '',
    location: {
      lat: u.address?.lat ?? 0,
      lng: u.address?.lng ?? 0,
      neighborhood: u.address?.neighborhood ?? '',
      city: u.address?.city ?? '',
    },
    completedJobs: 0,
    avatarInitials: u.name
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase(),
    avatarUrl: u.avatarUrl ?? undefined,
    tags: u.tags ?? [],
    hourlyRate: u.hourlyRate ?? undefined,
  }
}

function matchesFilters(p: Professional, f: ProfessionalFilters): boolean {
  if (f.search) {
    const q = f.search.toLowerCase()
    const matches =
      p.name.toLowerCase().includes(q) ||
      p.profession.toLowerCase().includes(q) ||
      p.location.neighborhood.toLowerCase().includes(q) ||
      p.location.city.toLowerCase().includes(q)
    if (!matches) return false
  }
  if (f.locality) {
    const loc = f.locality.toLowerCase()
    const city = p.location.city.toLowerCase()
    const hood = p.location.neighborhood.toLowerCase()
    const matches =
      hood.includes(loc) || loc.includes(hood) || city.includes(loc) || loc.includes(city)
    if (!matches) return false
  }
  if (f.professions.length > 0 && !f.professions.includes(p.profession)) return false
  if (p.rating < f.minRating) return false
  if (p.distanceKm > f.maxDistanceKm) return false
  if (f.availableOnly && !p.available) return false
  return true
}

export interface UseProfessionalsReturn {
  professionals: Professional[]
  filters: ProfessionalFilters
  selected: Professional | null
  resultCount: number
  setSearch: (search: string) => void
  setLocality: (locality: string) => void
  toggleProfession: (profession: Profession) => void
  setMinRating: (rating: number) => void
  setMaxDistance: (km: number) => void
  setAvailableOnly: (only: boolean) => void
  selectProfessional: (p: Professional | null) => void
  resetFilters: () => void
}

export function useProfessionals(): UseProfessionalsReturn {
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>(MOCK_PROFESSIONALS)
  const [filters, setFilters] = useState<ProfessionalFilters>(DEFAULT_FILTERS)
  const [selected, setSelected] = useState<Professional | null>(null)

  useEffect(() => {
    api
      .get<RawUser[]>('/api/users/professionals')
      .then((data) => setAllProfessionals(data.map(userToProfessional)))
      .catch(() => setAllProfessionals(MOCK_PROFESSIONALS))
  }, [])

  const professionals = useMemo(
    () => allProfessionals.filter((p) => matchesFilters(p, filters)),
    [allProfessionals, filters],
  )

  const setSearch = useCallback((search: string) => setFilters((prev) => ({ ...prev, search })), [])
  const setLocality = useCallback(
    (locality: string) => setFilters((prev) => ({ ...prev, locality })),
    [],
  )
  const toggleProfession = useCallback((profession: Profession) => {
    setFilters((prev) => ({
      ...prev,
      professions: prev.professions.includes(profession)
        ? prev.professions.filter((p) => p !== profession)
        : [...prev.professions, profession],
    }))
  }, [])
  const setMinRating = useCallback(
    (minRating: number) => setFilters((prev) => ({ ...prev, minRating })),
    [],
  )
  const setMaxDistance = useCallback(
    (maxDistanceKm: number) => setFilters((prev) => ({ ...prev, maxDistanceKm })),
    [],
  )
  const setAvailableOnly = useCallback(
    (availableOnly: boolean) => setFilters((prev) => ({ ...prev, availableOnly })),
    [],
  )
  const selectProfessional = useCallback((p: Professional | null) => setSelected(p), [])
  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  return {
    professionals,
    filters,
    selected,
    resultCount: professionals.length,
    setSearch,
    setLocality,
    toggleProfession,
    setMinRating,
    setMaxDistance,
    setAvailableOnly,
    selectProfessional,
    resetFilters,
  }
}
