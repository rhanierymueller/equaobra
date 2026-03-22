import { prisma } from '../lib/prisma'
import { InterestInput } from '../models/interest.model'

export async function listInterests(userId: string, asContractor: boolean) {
  return prisma.interest.findMany({
    where: asContractor ? { contractorId: userId } : { professionalId: userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function listInterestsByContractor(contractorId: string) {
  return prisma.interest.findMany({
    where: { contractorId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createInterest(professionalId: string, data: InterestInput) {
  const existing = await prisma.interest.findUnique({
    where: { contractorId_professionalId: { contractorId: data.contractorId, professionalId } },
  })
  if (existing) return { error: 'Interesse já registrado', status: 409, interest: existing }

  const interest = await prisma.interest.create({
    data: { professionalId, ...data },
  })
  return { data: interest }
}

export async function deleteInterest(id: string, userId: string) {
  const interest = await prisma.interest.findUnique({ where: { id } })
  if (!interest) return { error: 'Interesse não encontrado', status: 404 }
  if (interest.professionalId !== userId) return { error: 'Sem permissão', status: 403 }

  await prisma.interest.delete({ where: { id } })
  return { success: true }
}
