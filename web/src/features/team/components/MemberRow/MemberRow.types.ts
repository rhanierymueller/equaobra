import type { TeamMember } from '@/src/types/team.types'

export interface MemberRowProps {
  member: TeamMember
  memberCost: number | null
  isCurrentUser: boolean
  isTeamOwner: boolean
  onSetLeader: () => void
  onRemove: () => void
  onLeave: () => void
  onEditProfession: (profession: string) => void
  onChat: () => void
}
