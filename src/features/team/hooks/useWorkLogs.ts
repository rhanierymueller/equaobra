'use client'

import { useState, useCallback, useEffect } from 'react'
import { api } from '@/src/services/api'
import type { WorkLog } from '@/src/types/worklog.types'

export function useWorkLogs(teamId: string) {
  const [logs, setLogs] = useState<WorkLog[]>([])

  const refresh = useCallback(() => {
    api.get<WorkLog[]>(`/api/teams/${teamId}/worklogs`)
      .then(data => setLogs(data))
      .catch(() => setLogs([]))
  }, [teamId])

  useEffect(() => { refresh() }, [refresh])

  const addLog = useCallback(async (memberId: string, memberName: string, date: string, hours: number, description?: string) => {
    const log = await api.post<WorkLog>(`/api/teams/${teamId}/worklogs`, { memberId, memberName, date, hours, description })
    setLogs(prev => [log, ...prev])
  }, [teamId])

  const removeLog = useCallback(async (logId: string) => {
    setLogs(prev => prev.filter(l => l.id !== logId))
    try {
      await api.delete(`/api/teams/${teamId}/worklogs/${logId}`)
    } catch {
      refresh()
    }
  }, [teamId, refresh])

  const getLogsForMember = useCallback((memberId: string) =>
    logs.filter(l => l.memberId === memberId),
  [logs])

  const getTotalHours = useCallback((memberId: string) =>
    logs.filter(l => l.memberId === memberId).reduce((s, l) => s + l.hours, 0),
  [logs])

  return { logs, addLog, removeLog, getLogsForMember, getTotalHours, refresh }
}
