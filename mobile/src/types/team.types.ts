export interface TeamMember {
  id: string
  professionalId: string
  name: string
  profession: string
  avatarInitials: string
  avatarUrl?: string
  phone?: string
  whatsapp?: string
  rating?: number
  dailyRate?: number
  status?: string
  joinedAt?: string
}

export interface WorkLog {
  id: string
  memberId: string
  memberName: string
  date: string
  hours: number
  note?: string
  createdAt: string
}

export interface Team {
  id: string
  name: string
  obraName: string
  location?: string
  status: string
  startDate?: string
  endDate?: string
  members: TeamMember[]
  workLogs?: WorkLog[]
  createdAt: string
  userId: string
}
