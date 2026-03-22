import { prisma } from '../lib/prisma'
import { TeamInput, MemberInput, UpdateMemberInput } from '../models/team.model'

export async function listTeams(userId: string) {
  return prisma.team.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { professionalId: userId } } },
      ],
    },
    include: { members: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createTeam(userId: string, data: TeamInput) {
  const { members, ...teamData } = data
  return prisma.team.create({
    data: { ...teamData, ownerId: userId, members: { create: members } },
    include: { members: true },
  })
}

export async function getTeamById(id: string, userId: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: { members: true },
  })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }
  if (team.ownerId !== userId && !team.members.some(m => m.professionalId === userId)) {
    return { error: 'Sem permissão', status: 403 }
  }
  return { data: team }
}

export async function updateTeam(id: string, userId: string, data: Partial<Omit<TeamInput, 'members'>>) {
  const team = await prisma.team.findUnique({ where: { id } })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }
  if (team.ownerId !== userId) return { error: 'Sem permissão', status: 403 }

  const updated = await prisma.team.update({
    where: { id },
    data,
    include: { members: true },
  })
  return { data: updated }
}

export async function deleteTeam(id: string, userId: string) {
  const team = await prisma.team.findUnique({ where: { id } })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }
  if (team.ownerId !== userId) return { error: 'Sem permissão', status: 403 }

  await prisma.team.delete({ where: { id } })
  return { success: true }
}

export async function addMember(teamId: string, userId: string, data: MemberInput) {
  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }
  if (team.ownerId !== userId) return { error: 'Sem permissão', status: 403 }

  const member = await prisma.teamMember.create({ data: { teamId, ...data } })
  return { data: member }
}

export async function updateMember(teamId: string, professionalId: string, userId: string, data: UpdateMemberInput) {
  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }
  if (team.ownerId !== userId) return { error: 'Sem permissão', status: 403 }

  const member = await prisma.teamMember.findFirst({ where: { teamId, professionalId } })
  if (!member) return { error: 'Membro não encontrado', status: 404 }

  const updated = await prisma.teamMember.update({ where: { id: member.id }, data })
  return { data: updated }
}

export async function removeMember(teamId: string, professionalId: string, userId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }
  if (team.ownerId !== userId) return { error: 'Sem permissão', status: 403 }

  const member = await prisma.teamMember.findFirst({ where: { teamId, professionalId } })
  if (!member) return { error: 'Membro não encontrado', status: 404 }

  await prisma.teamMember.delete({ where: { id: member.id } })
  return { success: true }
}
