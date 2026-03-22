import bcrypt from 'bcrypt'

import { signToken } from '../lib/jwt'
import { prisma } from '../lib/prisma'
import type { RegisterInput, LoginInput } from '../models/user.model'
import { sanitizeUser } from '../models/user.model'

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) return { error: 'E-mail já cadastrado', status: 409 }

  const passwordHash = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      roles: JSON.stringify(data.roles),
      profession: data.profession,
      professions: data.professions ? JSON.stringify(data.professions) : null,
      hourlyRate: data.hourlyRate,
      phone: data.phone,
      companyName: data.companyName,
      cnpj: data.cnpj,
      addrCep: data.addrCep,
      addrStreet: data.addrStreet,
      addrNeighborhood: data.addrNeighborhood,
      addrCity: data.addrCity,
      addrState: data.addrState,
      addrNumber: data.addrNumber,
      addrLat: data.addrLat,
      addrLng: data.addrLng,
      compAddrCep: data.compAddrCep,
      compAddrStreet: data.compAddrStreet,
      compAddrNeighborhood: data.compAddrNeighborhood,
      compAddrCity: data.compAddrCity,
      compAddrState: data.compAddrState,
      compAddrNumber: data.compAddrNumber,
    },
  })

  const token = signToken({ userId: user.id, email: user.email })
  return { token, user: sanitizeUser(user) }
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } })
  if (!user) return { error: 'E-mail ou senha incorretos', status: 401 }

  const valid = await bcrypt.compare(data.password, user.passwordHash)
  if (!valid) return { error: 'E-mail ou senha incorretos', status: 401 }

  const token = signToken({ userId: user.id, email: user.email })
  return { token, user: sanitizeUser(user) }
}
