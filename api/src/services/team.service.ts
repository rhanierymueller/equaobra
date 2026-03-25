import { prisma } from '../lib/prisma'
import type { TeamInput, MemberInput, UpdateMemberInput } from '../models/team.model'

export async function listTeams(userId: string) {
  return prisma.team.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { professionalId: userId } } }],
    },
    include: { members: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createTeam(userId: string, data: TeamInput) {
  const { members, ...teamData } = data
  // Members created along with the team are accepted immediately (owner-initiated)
  const membersWithStatus = members.map((m) => ({ ...m, status: 'accepted' }))
  return prisma.team.create({
    data: { ...teamData, ownerId: userId, members: { create: membersWithStatus } },
    include: { members: true },
  })
}

export async function getTeamById(id: string, userId: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: { members: true },
  })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }
  if (team.ownerId !== userId && !team.members.some((m) => m.professionalId === userId)) {
    return { error: 'Sem permissão', status: 403 }
  }
  return { data: team }
}

export async function updateTeam(
  id: string,
  userId: string,
  data: Partial<Omit<TeamInput, 'members'>>,
) {
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
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { members: true } })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }
  if (team.ownerId !== userId) return { error: 'Sem permissão', status: 403 }

  const already = team.members.some((m) => m.professionalId === data.professionalId)
  if (already) return { error: 'Profissional já está na equipe', status: 409 }

  const inviter = await prisma.user.findUnique({ where: { id: userId } })
  if (!inviter) return { error: 'Usuário não encontrado', status: 404 }

  const { invitationMessage, ...memberData } = data
  const member = await prisma.teamMember.create({
    data: { teamId, ...memberData, status: 'pending', invitationMessage: invitationMessage ?? null },
  })

  // Notify the invited professional directly (bypass team membership check)
  await prisma.notification.create({
    data: {
      type: 'team_invite',
      teamId,
      teamName: team.name,
      fromMemberId: userId,
      fromMemberName: inviter.companyName ?? inviter.name,
      toMemberId: data.professionalId,
      message: invitationMessage
        ? `${inviter.companyName ?? inviter.name} convidou você para a equipe "${team.name}": ${invitationMessage}`
        : `${inviter.companyName ?? inviter.name} convidou você para a equipe "${team.name}"`,
    },
  })

  return { data: member }
}

export async function respondToInvite(
  teamId: string,
  professionalId: string,
  userId: string,
  action: 'accept' | 'reject',
) {
  if (professionalId !== userId) return { error: 'Sem permissão', status: 403 }

  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team) return { error: 'Equipe não encontrada', status: 404 }

  const member = await prisma.teamMember.findFirst({
    where: { teamId, professionalId, status: 'pending' },
  })
  if (!member) return { error: 'Convite não encontrado ou já respondido', status: 404 }

  const newStatus = action === 'accept' ? 'accepted' : 'rejected'
  const updated = await prisma.teamMember.update({
    where: { id: member.id },
    data: { status: newStatus },
  })

  const professional = await prisma.user.findUnique({ where: { id: userId } })
  const notifType = action === 'accept' ? 'invite_accepted' : 'invite_rejected'
  const notifMessage =
    action === 'accept'
      ? `${professional?.name ?? 'Profissional'} aceitou o convite para a equipe "${team.name}"`
      : `${professional?.name ?? 'Profissional'} recusou o convite para a equipe "${team.name}"`

  await prisma.notification.create({
    data: {
      type: notifType,
      teamId,
      teamName: team.name,
      fromMemberId: userId,
      fromMemberName: professional?.name ?? 'Profissional',
      toMemberId: team.ownerId,
      message: notifMessage,
    },
  })

  if (action === 'reject') {
    await prisma.teamMember.delete({ where: { id: member.id } })
  } else {
    // Reactivate team if it was deactivated due to having no members
    if (!team.active) {
      await prisma.team.update({ where: { id: teamId }, data: { active: true } })
    }
  }

  return { data: updated }
}

export async function updateMember(
  teamId: string,
  professionalId: string,
  userId: string,
  data: UpdateMemberInput,
) {
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

  const remainingAccepted = await prisma.teamMember.count({
    where: { teamId, status: 'accepted' },
  })

  if (remainingAccepted === 0) {
    await prisma.team.update({ where: { id: teamId }, data: { active: false } })
  }

  return { success: true }
}
