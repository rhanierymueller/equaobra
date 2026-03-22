import { useState, useEffect, useCallback } from 'react'

import { api } from '../services/api'
import type { Team, TeamMember, WorkLog } from '../types'

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<Team[]>('/api/teams')
      setTeams(data)
    } catch {
      setTeams([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createTeam = useCallback(
    async (
      input: Omit<Team, 'id' | 'createdAt' | 'userId' | 'members' | 'workLogs'> & {
        members?: TeamMember[]
      },
    ) => {
      const created = await api.post<Team>('/api/teams', { ...input, members: [] })
      setTeams((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const addMember = useCallback(async (teamId: string, member: Omit<TeamMember, 'id'>) => {
    const updated = await api.post<Team>(`/api/teams/${teamId}/members`, member)
    setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)))
    return updated
  }, [])

  const removeMember = useCallback(
    async (teamId: string, memberId: string) => {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId ? { ...t, members: t.members.filter((m) => m.id !== memberId) } : t,
        ),
      )
      try {
        await api.delete(`/api/teams/${teamId}/members/${memberId}`)
      } catch {
        await refresh()
      }
    },
    [refresh],
  )

  const addWorkLog = useCallback(
    async (
      teamId: string,
      memberId: string,
      log: {
        memberName: string
        date: string
        hours: number
        note?: string
      },
    ) => {
      const created = await api.post<WorkLog>(`/api/teams/${teamId}/worklogs`, { memberId, ...log })
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId ? { ...t, workLogs: [created, ...(t.workLogs ?? [])] } : t,
        ),
      )
      return created
    },
    [],
  )

  const removeWorkLog = useCallback(
    async (teamId: string, logId: string) => {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId
            ? { ...t, workLogs: (t.workLogs ?? []).filter((l) => l.id !== logId) }
            : t,
        ),
      )
      try {
        await api.delete(`/api/teams/${teamId}/worklogs/${logId}`)
      } catch {
        await refresh()
      }
    },
    [refresh],
  )

  return { teams, loading, refresh, createTeam, addMember, removeMember, addWorkLog, removeWorkLog }
}
