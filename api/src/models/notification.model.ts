import { z } from 'zod'

export const notificationSchema = z.object({
  type: z.enum(['log_delete_request', 'log_deleted', 'log_edited', 'team_invite', 'invite_accepted', 'invite_rejected']),
  teamId: z.string().max(50),
  teamName: z.string().max(200),
  toMemberId: z.string().max(50),
  fromMemberName: z.string().max(100),
  logId: z.string().max(50).optional(),
  logDate: z.string().max(20).optional(),
  logHours: z.number().optional(),
  message: z.string().max(1000),
})

export type NotificationInput = z.infer<typeof notificationSchema>
