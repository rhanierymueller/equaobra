import { z } from 'zod'

export const workLogSchema = z.object({
  memberId: z.string(),
  memberName: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours: z.number().positive().max(24),
  description: z.string().optional(),
})

export type WorkLogInput = z.infer<typeof workLogSchema>
