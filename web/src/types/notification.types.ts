export type NotificationType =
  | 'log_delete_request'
  | 'log_deleted'
  | 'log_edited'
  | 'team_invite'
  | 'invite_accepted'
  | 'invite_rejected'

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
  responded?: boolean
}
