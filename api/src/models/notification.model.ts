import { z } from 'zod'

export const notificationSchema = z.object({
  type: z.enum(['log_delete_request', 'log_deleted', 'log_edited']),
  teamId: z.string(),
  teamName: z.string(),
  toMemberId: z.string(),
  fromMemberName: z.string(),
  logId: z.string().optional(),
  logDate: z.string().optional(),
  logHours: z.number().optional(),
  message: z.string(),
})

export type NotificationInput = z.infer<typeof notificationSchema>
