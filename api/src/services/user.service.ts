import { geocodeAddress } from '../lib/geocode'
import { prisma } from '../lib/prisma'
import type { UpdateUserInput } from '../models/user.model'
import { sanitizeUser } from '../models/user.model'

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return null
  return sanitizeUser(user)
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const updateData: Record<string, unknown> = {
    ...data,
    roles: data.roles !== undefined ? JSON.stringify(data.roles) : undefined,
    professions: data.professions !== undefined ? JSON.stringify(data.professions) : undefined,
    tags: data.tags !== undefined ? JSON.stringify(data.tags) : undefined,
  }

  const hasCity = data.addrCity !== undefined
  const missingCoords = data.addrLat == null && data.addrLng == null
  if (hasCity && missingCoords) {
    const geo = await geocodeAddress({
      street: data.addrStreet,
      neighborhood: data.addrNeighborhood,
      city: data.addrCity,
      state: data.addrState,
      cep: data.addrCep,
    })
    if (geo) {
      updateData.addrLat = geo.lat
      updateData.addrLng = geo.lng
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
  })
  return sanitizeUser(updated)
}

export async function addReview(targetId: string, rating: number) {
  const user = await prisma.user.findUnique({ where: { id: targetId } })
  if (!user) return null

  // Média ponderada incremental: (ratingAtual * total + novoRating) / (total + 1)
  const newCount = user.reviewCount + 1
  const newRating = parseFloat(((user.rating * user.reviewCount + rating) / newCount).toFixed(2))

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { rating: newRating, reviewCount: newCount },
  })
  return sanitizeUser(updated)
}

export async function listProfessionals(filters: {
  search?: string
  city?: string
  profession?: string
  minRating?: string
  available?: string
}) {
  const users = await prisma.user.findMany({
    where: {
      roles: { contains: 'profissional' },
      ...(filters.profession ? { professions: { contains: filters.profession } } : {}),
      ...(filters.minRating ? { rating: { gte: parseFloat(filters.minRating) } } : {}),
      ...(filters.available === 'true' ? { available: true } : {}),
    },
    orderBy: { rating: 'desc' },
  })

  const searchLc = filters.search?.toLowerCase() ?? null
  const cityLc = filters.city?.toLowerCase() ?? null

  const filtered = users.filter((u) => {
    if (
      searchLc &&
      !u.name.toLowerCase().includes(searchLc) &&
      !(u.profession ?? '').toLowerCase().includes(searchLc)
    )
      return false
    if (
      cityLc &&
      !(u.addrCity ?? '').toLowerCase().includes(cityLc) &&
      !(u.addrNeighborhood ?? '').toLowerCase().includes(cityLc)
    )
      return false
    return true
  })

  return filtered.map(sanitizeUser)
}
