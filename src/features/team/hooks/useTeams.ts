'use client'

import { useState, useCallback } from 'react'
import type { Team, TeamMember } from '@/src/types/team.types'

const STORAGE_KEY = 'equobra_teams'

function loadTeams(): Team[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Team[]
  } catch {
    return []
  }
}

export function useTeams(ownerId?: string) {
  const [teams, setTeams] = useState<Team[]>(() => loadTeams())

  const persist = useCallback((updater: (prev: Team[]) => Team[]) => {
    const current = loadTeams()
    const next = updater(current)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setTeams(next)
  }, [])

  const createTeam = useCallback((
    data: Omit<Team, 'id' | 'createdAt' | 'members' | 'ownerId'>,
    professional: Omit<TeamMember, 'isLeader'>,
    userId: string,
    ownerMember?: Omit<TeamMember, 'isLeader'>,
  ): Team => {
    const members: TeamMember[] = ownerMember
      ? [{ ...ownerMember, isLeader: true }, { ...professional, isLeader: false }]
      : [{ ...professional, isLeader: true }]
    const team: Team = {
      ...data,
      id: `team-${Date.now()}`,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      members,
    }
    persist(prev => [...prev, team])
    return team
  }, [persist])

  const addMemberToTeam = useCallback((teamId: string, member: Omit<TeamMember, 'isLeader'>) => {
    persist(prev => prev.map(t => {
      if (t.id !== teamId) return t
      if (t.members.some(m => m.professionalId === member.professionalId)) return t
      return { ...t, members: [...t.members, { ...member, isLeader: false }] }
    }))
  }, [persist])

  const removeMember = useCallback((teamId: string, professionalId: string) => {
    persist(prev => prev.map(t => {
      if (t.id !== teamId) return t
      const members = t.members.filter(m => m.professionalId !== professionalId)
      if (members.length > 0 && !members.some(m => m.isLeader)) members[0].isLeader = true
      return { ...t, members }
    }))
  }, [persist])

  const setLeader = useCallback((teamId: string, professionalId: string) => {
    persist(prev => prev.map(t => {
      if (t.id !== teamId) return t
      return {
        ...t,
        members: t.members.map(m => ({ ...m, isLeader: m.professionalId === professionalId })),
      }
    }))
  }, [persist])

  const updateMemberProfession = useCallback((teamId: string, professionalId: string, profession: string) => {
    persist(prev => prev.map(t => {
      if (t.id !== teamId) return t
      return {
        ...t,
        members: t.members.map(m =>
          m.professionalId === professionalId ? { ...m, profession } : m
        ),
      }
    }))
  }, [persist])

  const deleteTeam = useCallback((teamId: string) => {
    persist(prev => prev.filter(t => t.id !== teamId))
  }, [persist])

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
