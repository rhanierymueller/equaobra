export interface WorkLog {
  id: string
  teamId: string
  memberId: string
  memberName: string
  date: string
  hours: number
  description?: string
  createdAt: string
}
