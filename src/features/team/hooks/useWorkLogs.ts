'use client'

import { useState, useCallback } from 'react'
import type { WorkLog } from '@/src/types/worklog.types'

const STORAGE_KEY = 'equobra_worklogs'

function load(): WorkLog[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as WorkLog[] }
  catch { return [] }
}

function save(logs: WorkLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
}

export function useWorkLogs(teamId: string) {
  const [logs, setLogs] = useState<WorkLog[]>(() => load().filter(l => l.teamId === teamId))

  const refresh = useCallback(() => {
    setLogs(load().filter(l => l.teamId === teamId))
  }, [teamId])

  const addLog = useCallback((memberId: string, memberName: string, date: string, hours: number, description?: string) => {
    const entry: WorkLog = {
      id: `wl-${Date.now()}`,
      teamId,
      memberId,
      memberName,
      date,
      hours,
      description,
      createdAt: new Date().toISOString(),
    }
    const all = load()
    const next = [...all, entry]
    save(next)
    setLogs(next.filter(l => l.teamId === teamId))
  }, [teamId])

  const removeLog = useCallback((logId: string) => {
    const all = load()
    const next = all.filter(l => l.id !== logId)
    save(next)
    setLogs(next.filter(l => l.teamId === teamId))
  }, [teamId])

  const getLogsForMember = useCallback((memberId: string) =>
    logs.filter(l => l.memberId === memberId),
  [logs])

  const getTotalHours = useCallback((memberId: string) =>
    logs.filter(l => l.memberId === memberId).reduce((s, l) => s + l.hours, 0),
  [logs])

  return { logs, addLog, removeLog, getLogsForMember, getTotalHours, refresh }
}
