'use client'

import { useState, useCallback, useEffect } from 'react'
import { api } from '@/src/services/api'
import type { Team, TeamMember } from '@/src/types/team.types'

export function useTeams(ownerId?: string) {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    api.get<Team[]>('/api/teams')
      .then(data => setTeams(data))
      .catch(() => setTeams([]))
  }, [])

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createTeam = useCallback(async (
    data: Omit<Team, 'id' | 'createdAt' | 'members' | 'ownerId'>,
    professional: Omit<TeamMember, 'isLeader'>,
    userId: string,
    ownerMember?: Omit<TeamMember, 'isLeader'>,
  ): Promise<Team> => {
    const members = ownerMember
      ? [{ ...ownerMember, isLeader: true }, { ...professional, isLeader: false }]
      : [{ ...professional, isLeader: true }]
    const team = await api.post<Team>('/api/teams', { ...data, ownerId: userId, members })
    setTeams(prev => [team, ...prev])
    return team
  }, [])

  const addMemberToTeam = useCallback(async (teamId: string, member: Omit<TeamMember, 'isLeader'>) => {
    const newMember = await api.post<TeamMember>(`/api/teams/${teamId}/members`, { ...member, isLeader: false })
    setTeams(prev => prev.map(t =>
      t.id === teamId ? { ...t, members: [...t.members, newMember] } : t
    ))
  }, [])

  const removeMember = useCallback(async (teamId: string, professionalId: string) => {
    // Optimistic
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t
      const members = t.members.filter(m => m.professionalId !== professionalId)
      if (members.length > 0 && !members.some(m => m.isLeader)) members[0].isLeader = true
      return { ...t, members }
    }))
    try {
      await api.delete(`/api/teams/${teamId}/members/${professionalId}`)
    } catch {
      api.get<Team[]>('/api/teams').then(data => setTeams(data)).catch(() => {})
    }
  }, [])

  const setLeader = useCallback(async (teamId: string, professionalId: string) => {
    // Optimistic
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t
      return { ...t, members: t.members.map(m => ({ ...m, isLeader: m.professionalId === professionalId })) }
    }))
    try {
      await api.patch(`/api/teams/${teamId}/members/${professionalId}`, { isLeader: true })
    } catch {
      api.get<Team[]>('/api/teams').then(data => setTeams(data)).catch(() => {})
    }
  }, [])

  const updateMemberProfession = useCallback(async (teamId: string, professionalId: string, profession: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t
      return { ...t, members: t.members.map(m => m.professionalId === professionalId ? { ...m, profession } : m) }
    }))
    try {
      await api.patch(`/api/teams/${teamId}/members/${professionalId}`, { profession })
    } catch {
      api.get<Team[]>('/api/teams').then(data => setTeams(data)).catch(() => {})
    }
  }, [])

  const deleteTeam = useCallback(async (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId))
    try {
      await api.delete(`/api/teams/${teamId}`)
    } catch {
      api.get<Team[]>('/api/teams').then(data => setTeams(data)).catch(() => {})
    }
  }, [])

  // ── Derived ───────────────────────────────────────────────────────────────

  const isInTeam = useCallback((professionalId: string, teamId: string): boolean =>
    teams.some(t => t.id === teamId && t.members.some(m => m.professionalId === professionalId)),
  [teams])

  const isInAnyTeam = useCallback((professionalId: string): boolean =>
    teams.some(t => t.members.some(m => m.professionalId === professionalId)),
  [teams])

  const myTeams = ownerId ? teams.filter(t => t.ownerId === ownerId) : teams

  return {
    teams,
    myTeams,
    createTeam,
    addMemberToTeam,
    removeMember,
    setLeader,
    updateMemberProfession,
    deleteTeam,
    isInTeam,
    isInAnyTeam,
  }
}
