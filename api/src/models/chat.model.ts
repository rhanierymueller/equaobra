import { z } from 'zod'

export const conversationSchema = z.object({
  professionalId: z.string(),
  professionalName: z.string(),
  professionalInitials: z.string(),
  professionalAvatarUrl: z.string().optional(),
})

export const messageSchema = z.object({
  senderName: z.string(),
  text: z.string().min(1),
})

export type ConversationInput = z.infer<typeof conversationSchema>
export type MessageInput = z.infer<typeof messageSchema>
