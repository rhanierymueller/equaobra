'use client'

import { useState, useCallback, useEffect } from 'react'

import { useToast } from '@/src/hooks/useToast'
import { api } from '@/src/services/api'
import type { Team, TeamMember } from '@/src/types/team.types'

export function useTeams(ownerId?: string) {
  const [teams, setTeams] = useState<Team[]>([])
  const toast = useToast()

  useEffect(() => {
    api
      .get<Team[]>('/api/teams')
      .then((data) => setTeams(data))
      .catch(() => setTeams([]))
  }, [])

  const createTeam = useCallback(
    async (
      data: Omit<Team, 'id' | 'createdAt' | 'members' | 'ownerId' | 'active'>,
      professional: Omit<TeamMember, 'isLeader' | 'status'>,
      userId: string,
      ownerMember?: Omit<TeamMember, 'isLeader' | 'status'>,
    ): Promise<Team> => {
      const members = ownerMember
        ? [
            { ...ownerMember, isLeader: true },
            { ...professional, isLeader: false },
          ]
        : [{ ...professional, isLeader: true }]
      const team = await api.post<Team>('/api/teams', { ...data, ownerId: userId, members })
      setTeams((prev) => [team, ...prev])
      return team
    },

    [],
  )

  const addMemberToTeam = useCallback(
    async (
      teamId: string,
      member: Omit<TeamMember, 'isLeader' | 'status'>,
      invitationMessage?: string,
    ) => {
      try {
        const newMember = await api.post<TeamMember>(`/api/teams/${teamId}/members`, {
          ...member,
          isLeader: false,
          invitationMessage,
        })
        setTeams((prev) =>
          prev.map((t) => (t.id === teamId ? { ...t, members: [...t.members, newMember] } : t)),
        )
      } catch {
        toast.error('Erro ao adicionar membro. Tente novamente.')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const respondToInvite = useCallback(
    async (teamId: string, professionalId: string, action: 'accept' | 'reject') => {
      try {
        await api.patch(`/api/teams/${teamId}/members/${professionalId}/respond`, { action })
        if (action === 'accept') {
          setTeams((prev) =>
            prev.map((t) =>
              t.id === teamId
                ? {
                    ...t,
                    members: t.members.map((m) =>
                      m.professionalId === professionalId
                        ? { ...m, status: 'accepted' as const }
                        : m,
                    ),
                  }
                : t,
            ),
          )
        } else {
          setTeams((prev) =>
            prev.map((t) =>
              t.id === teamId
                ? { ...t, members: t.members.filter((m) => m.professionalId !== professionalId) }
                : t,
            ),
          )
        }
      } catch {
        toast.error('Erro ao responder convite. Tente novamente.')
        throw new Error('respondToInvite failed')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const removeMember = useCallback(async (teamId: string, professionalId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t
        const members = t.members.filter((m) => m.professionalId !== professionalId)
        if (members.length > 0 && !members.some((m) => m.isLeader)) members[0].isLeader = true
        return { ...t, members }
      }),
    )
    try {
      await api.delete(`/api/teams/${teamId}/members/${professionalId}`)
    } catch {
      toast.error('Erro ao remover membro.')
      api
        .get<Team[]>('/api/teams')
        .then((data) => setTeams(data))
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLeader = useCallback(async (teamId: string, professionalId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t
        return {
          ...t,
          members: t.members.map((m) => ({ ...m, isLeader: m.professionalId === professionalId })),
        }
      }),
    )
    try {
      await api.patch(`/api/teams/${teamId}/members/${professionalId}`, { isLeader: true })
    } catch {
      toast.error('Erro ao definir líder.')
      api
        .get<Team[]>('/api/teams')
        .then((data) => setTeams(data))
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateMemberProfession = useCallback(
    async (teamId: string, professionalId: string, profession: string) => {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id !== teamId) return t
          return {
            ...t,
            members: t.members.map((m) =>
              m.professionalId === professionalId ? { ...m, profession } : m,
            ),
          }
        }),
      )
      try {
        await api.patch(`/api/teams/${teamId}/members/${professionalId}`, { profession })
      } catch {
        toast.error('Erro ao atualizar função.')
        api
          .get<Team[]>('/api/teams')
          .then((data) => setTeams(data))
          .catch(() => {})
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const leaveTeam = useCallback(async (teamId: string, professionalId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId))
    try {
      await api.delete(`/api/teams/${teamId}/members/${professionalId}/leave`)
    } catch {
      toast.error('Erro ao sair da equipe.')
      api
        .get<Team[]>('/api/teams')
        .then((data) => setTeams(data))
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteTeam = useCallback(async (teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId))
    try {
      await api.delete(`/api/teams/${teamId}`)
    } catch {
      toast.error('Erro ao excluir equipe.')
      api
        .get<Team[]>('/api/teams')
        .then((data) => setTeams(data))
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isInTeam = useCallback(
    (professionalId: string, teamId: string): boolean =>
      teams.some(
        (t) => t.id === teamId && t.members.some((m) => m.professionalId === professionalId),
      ),
    [teams],
  )

  const isInAnyTeam = useCallback(
    (professionalId: string): boolean =>
      teams.some((t) => t.members.some((m) => m.professionalId === professionalId)),
    [teams],
  )

  const myTeams = ownerId ? teams.filter((t) => t.ownerId === ownerId) : teams

  return {
    teams,
    myTeams,
    createTeam,
    addMemberToTeam,
    respondToInvite,
    removeMember,
    leaveTeam,
    setLeader,
    updateMemberProfession,
    deleteTeam,
    isInTeam,
    isInAnyTeam,
  }
}
