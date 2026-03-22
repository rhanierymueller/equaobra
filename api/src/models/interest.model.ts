import { z } from 'zod'

export const interestSchema = z.object({
  contractorId: z.string(),
  professionalName: z.string(),
  professionalInitials: z.string(),
  professionalAvatarUrl: z.string().optional(),
  profession: z.string().optional(),
  location: z.string().optional(),
  rating: z.number().optional(),
})

export type InterestInput = z.infer<typeof interestSchema>
