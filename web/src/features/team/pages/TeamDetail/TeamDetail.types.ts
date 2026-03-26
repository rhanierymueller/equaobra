import type { Team } from '@/src/types/team.types'

export interface DialogConfig {
  title: string
  description?: string
  confirmLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
}

export function teamTotalCost(team: Team): { total: number | null; perMember: (number | null)[] } {
  const perMember = team.members.map((m) =>
    m.hourlyRate != null ? m.hourlyRate * 8 * team.estimatedDays : null,
  )
  const allHave = perMember.every((v) => v != null)
  return {
    total: allHave ? perMember.reduce((s, v) => s! + v!, 0) : null,
    perMember,
  }
}
