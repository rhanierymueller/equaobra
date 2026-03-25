import { z } from 'zod'

export const memberSchema = z.object({
  professionalId: z.string(),
  name: z.string(),
  profession: z.string(),
  phone: z.string(),
  avatarUrl: z.string().optional(),
  avatarInitials: z.string(),
  hourlyRate: z.number().optional(),
  isLeader: z.boolean().default(false),
  invitationMessage: z.string().max(500).optional(),
})

export const teamSchema = z.object({
  name: z.string().min(2),
  obraLocation: z.string().min(2),
  estimatedDays: z.number().int().positive(),
  observations: z.string().default(''),
  scheduledStart: z.string(),
  members: z.array(memberSchema).default([]),
})

export const updateMemberSchema = z.object({
  isLeader: z.boolean().optional(),
  profession: z.string().optional(),
  phone: z.string().optional(),
  hourlyRate: z.number().nullable().optional(),
})

export const respondInviteSchema = z.object({
  action: z.enum(['accept', 'reject']),
})

export type MemberInput = z.infer<typeof memberSchema>
export type TeamInput = z.infer<typeof teamSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
export type RespondInviteInput = z.infer<typeof respondInviteSchema>
