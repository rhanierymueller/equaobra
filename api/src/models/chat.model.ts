import { z } from 'zod'

export const conversationSchema = z.object({
  professionalId: z.string().max(50),
  professionalName: z.string().max(100),
  professionalInitials: z.string().max(5),
  professionalAvatarUrl: z.string().url().max(500).optional(),
})

export const messageSchema = z.object({
  senderName: z.string().max(100),
  text: z.string().min(1).max(5000),
})

export type ConversationInput = z.infer<typeof conversationSchema>
export type MessageInput = z.infer<typeof messageSchema>
