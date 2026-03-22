import { z } from 'zod'

import { prisma } from '../lib/prisma'
import { opportunitySchema, deserializeOpportunity } from '../models/opportunity.model'

export async function listOpportunities(filters: { city?: string; profession?: string }) {
  const opps = await prisma.opportunity.findMany({
    where: {
      active: true,
      ...(filters.profession ? { lookingForProfessions: { contains: filters.profession } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  const cityLc = filters.city?.toLowerCase() ?? null
  const filtered = cityLc ? opps.filter((o) => o.obraLocation.toLowerCase().includes(cityLc)) : opps
  return filtered.map(deserializeOpportunity)
}

export async function listMyOpportunities(userId: string) {
  const opps = await prisma.opportunity.findMany({
    where: { contractorId: userId },
    orderBy: { createdAt: 'desc' },
  })
  return opps.map(deserializeOpportunity)
}

export async function getOpportunityById(id: string) {
  const opp = await prisma.opportunity.findUnique({ where: { id } })
  if (!opp) return null
  return deserializeOpportunity(opp)
}

export async function createOpportunity(userId: string, data: z.infer<typeof opportunitySchema>) {
  const opp = await prisma.opportunity.create({
    data: {
      contractorId: userId,
      contractorName: data.contractorName,
      companyName: data.companyName,
      avatarInitials: data.avatarInitials,
      obraDescription: data.obraDescription,
      obraLocation: data.obraLocation,
      lat: data.lat,
      lng: data.lng,
      obraStart: data.obraStart,
      obraDuration: data.obraDuration,
      lookingForProfessions: JSON.stringify(data.lookingForProfessions),
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    },
  })
  return deserializeOpportunity(opp)
}

export async function updateOpportunity(id: string, userId: string, body: unknown) {
  const opp = await prisma.opportunity.findUnique({ where: { id } })
  if (!opp) return { error: 'Oportunidade não encontrada', status: 404 }
  if (opp.contractorId !== userId) return { error: 'Sem permissão', status: 403 }

  const partial = opportunitySchema
    .partial()
    .extend({ active: z.boolean().optional() })
    .safeParse(body)
  if (!partial.success)
    return { error: 'Dados inválidos', status: 400, details: partial.error.flatten() }

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      ...partial.data,
      lookingForProfessions: partial.data.lookingForProfessions
        ? JSON.stringify(partial.data.lookingForProfessions)
        : undefined,
    },
  })
  return { data: deserializeOpportunity(updated) }
}

export async function deleteOpportunity(id: string, userId: string) {
  const opp = await prisma.opportunity.findUnique({ where: { id } })
  if (!opp) return { error: 'Oportunidade não encontrada', status: 404 }
  if (opp.contractorId !== userId) return { error: 'Sem permissão', status: 403 }

  await prisma.opportunity.delete({ where: { id } })
  return { success: true }
}
