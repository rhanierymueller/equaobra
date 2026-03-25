export type InviteStatus = 'pending' | 'accepted' | 'rejected'

export interface TeamMember {
  professionalId: string
  name: string
  profession: string
  phone: string
  avatarUrl?: string
  avatarInitials: string
  hourlyRate?: number
  isLeader: boolean
  status: InviteStatus
  invitationMessage?: string
}

export interface Team {
  id: string
  name: string
  obraLocation: string
  estimatedDays: number
  observations: string
  scheduledStart: string
  members: TeamMember[]
  ownerId: string
  active: boolean
  createdAt: string
}
