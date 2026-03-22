import { prisma } from '../lib/prisma'
import { WorkLogInput } from '../models/worklog.model'

export async function listWorkLogs(teamId: string, userId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }
  if (team.ownerId !== userId && !team.members.some(m => m.professionalId === userId)) {
    return { error: 'Sem permissão', status: 403 }
  }

  const logs = await prisma.workLog.findMany({
    where: { teamId },
    orderBy: { date: 'desc' },
  })
  return { data: logs }
}

export async function createWorkLog(teamId: string, userId: string, data: WorkLogInput) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }
  if (team.ownerId !== userId && !team.members.some(m => m.professionalId === userId)) {
    return { error: 'Sem permissão', status: 403 }
  }

  const log = await prisma.workLog.create({ data: { teamId, ...data } })
  return { data: log }
}

export async function deleteWorkLog(teamId: string, logId: string, userId: string) {
  const log = await prisma.workLog.findUnique({ where: { id: logId } })
  if (!log) return { error: 'Registro não encontrado', status: 404 }
  if (log.teamId !== teamId) return { error: 'Registro não pertence à equipe', status: 400 }

  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (team?.ownerId !== userId && log.memberId !== userId) {
    return { error: 'Sem permissão', status: 403 }
  }

  await prisma.workLog.delete({ where: { id: logId } })
  return { success: true }
}
