import { prisma } from '../lib/prisma'
import type { ConversationInput, MessageInput } from '../models/chat.model'

export async function listConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { OR: [{ userId }, { professionalId: userId }] },
    include: { messages: { orderBy: { timestamp: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createOrGetConversation(userId: string, data: ConversationInput) {
  const convId = `${userId}_${data.professionalId}`
  return prisma.conversation.upsert({
    where: { id: convId },
    create: { id: convId, userId, ...data },
    update: {},
    include: { messages: { orderBy: { timestamp: 'asc' } } },
  })
}

export async function getConversationById(id: string, userId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { timestamp: 'asc' } } },
  })
  if (!conv) return { error: 'Conversa não encontrada', status: 404 }
  if (conv.userId !== userId && conv.professionalId !== userId) {
    return { error: 'Sem permissão', status: 403 }
  }
  return { data: conv }
}

export async function sendMessage(convId: string, userId: string, data: MessageInput) {
  const conv = await prisma.conversation.findUnique({ where: { id: convId } })
  if (!conv) return { error: 'Conversa não encontrada', status: 404 }
  if (conv.userId !== userId && conv.professionalId !== userId) {
    return { error: 'Sem permissão', status: 403 }
  }

  const message = await prisma.message.create({
    data: { convId, senderId: userId, senderName: data.senderName, text: data.text },
  })
  return { data: message }
}
