export interface WorkLog {
  id: string
  teamId: string
  memberId: string
  memberName: string
  date: string // YYYY-MM-DD
  hours: number
  description?: string
  createdAt: string
}
