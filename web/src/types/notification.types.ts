export type NotificationType =
  | 'log_delete_request'
  | 'log_deleted'
  | 'log_edited'

export interface AppNotification {
  id: string
  type: NotificationType
  teamId: string
  teamName: string
  fromMemberId: string
  fromMemberName: string
  toMemberId: string
  logId?: string
  logDate?: string
  logHours?: number
  message: string
  read: boolean
  createdAt: string
}
