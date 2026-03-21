export type NotificationType =
  | 'log_delete_request'  // member asks leader to delete a log
  | 'log_deleted'         // leader deleted a member's log
  | 'log_edited'          // leader edited a member's log

export interface AppNotification {
  id: string
  type: NotificationType
  teamId: string
  teamName: string
  fromMemberId: string
  fromMemberName: string
  toMemberId: string       // who should receive this notification
  logId?: string
  logDate?: string
  logHours?: number
  message: string
  read: boolean
  createdAt: string
}
