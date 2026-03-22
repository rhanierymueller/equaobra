import { prisma } from '../lib/prisma'
import type { NotificationInput } from '../models/notification.model'

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { toMemberId: userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createNotification(fromMemberId: string, data: NotificationInput) {
  const team = await prisma.team.findUnique({
    where: { id: data.teamId },
    include: { members: true },
  })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }

  const memberIds = [team.ownerId, ...team.members.map((m) => m.professionalId)]
  if (!memberIds.includes(fromMemberId) || !memberIds.includes(data.toMemberId)) {
    return { error: 'Sem permissão', status: 403 }
  }

  return prisma.notification.create({
    data: { fromMemberId, ...data },
  })
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { toMemberId: userId, read: false },
    data: { read: true },
  })
}

export async function markAsRead(id: string, userId: string) {
  const notif = await prisma.notification.findUnique({ where: { id } })
  if (!notif) return { error: 'Notificação não encontrada', status: 404 }
  if (notif.toMemberId !== userId) return { error: 'Sem permissão', status: 403 }

  return prisma.notification.update({ where: { id }, data: { read: true } })
}

export async function deleteNotification(id: string, userId: string) {
  const notif = await prisma.notification.findUnique({ where: { id } })
  if (!notif) return { error: 'Notificação não encontrada', status: 404 }
  if (notif.toMemberId !== userId) return { error: 'Sem permissão', status: 403 }

  await prisma.notification.delete({ where: { id } })
  return { success: true }
}
