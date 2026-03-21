import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'

const router = Router()

// ── Schemas ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['profissional', 'contratante']),
  roles: z.array(z.enum(['profissional', 'contratante'])).min(1),
  profession: z.string().optional(),
  professions: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),
  // Professional address
  addrCep: z.string().optional(),
  addrStreet: z.string().optional(),
  addrNeighborhood: z.string().optional(),
  addrCity: z.string().optional(),
  addrState: z.string().optional(),
  addrNumber: z.string().optional(),
  addrLat: z.number().optional(),
  addrLng: z.number().optional(),
  // Company address
  compAddrCep: z.string().optional(),
  compAddrStreet: z.string().optional(),
  compAddrNeighborhood: z.string().optional(),
  compAddrCity: z.string().optional(),
  compAddrState: z.string().optional(),
  compAddrNumber: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const data = parsed.data

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    res.status(409).json({ error: 'E-mail já cadastrado' })
    return
  }

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
  res.status(201).json({ token, user: sanitizeUser(user) })
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' })
    return
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: 'E-mail ou senha incorretos' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'E-mail ou senha incorretos' })
    return
  }

  const token = signToken({ userId: user.id, email: user.email })
  res.json({ token, user: sanitizeUser(user) })
})

// ── Helper ────────────────────────────────────────────────────────────────────

export function sanitizeUser(user: {
  id: string; name: string; email: string; role: string; roles: string
  profession: string | null; professions: string | null; hourlyRate: number | null
  showHourlyRate: boolean; avatarUrl: string | null; bio: string | null
  rating: number; reviewCount: number; available: boolean; phone: string | null
  tags: string | null; companyName: string | null; cnpj: string | null
  website: string | null; instagram: string | null; facebook: string | null
  addrCep: string | null; addrStreet: string | null; addrNeighborhood: string | null
  addrCity: string | null; addrState: string | null; addrNumber: string | null
  addrLat: number | null; addrLng: number | null
  compAddrCep: string | null; compAddrStreet: string | null; compAddrNeighborhood: string | null
  compAddrCity: string | null; compAddrState: string | null; compAddrNumber: string | null
  createdAt: Date
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roles: JSON.parse(user.roles),
    profession: user.profession,
    professions: user.professions ? JSON.parse(user.professions) : [],
    hourlyRate: user.hourlyRate,
    showHourlyRate: user.showHourlyRate,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    rating: user.rating,
    reviewCount: user.reviewCount,
    available: user.available,
    phone: user.phone,
    tags: user.tags ? JSON.parse(user.tags) : [],
    companyName: user.companyName,
    cnpj: user.cnpj,
    website: user.website,
    instagram: user.instagram,
    facebook: user.facebook,
    address: user.addrCity ? {
      cep: user.addrCep,
      street: user.addrStreet,
      neighborhood: user.addrNeighborhood,
      city: user.addrCity,
      state: user.addrState,
      number: user.addrNumber,
      lat: user.addrLat,
      lng: user.addrLng,
    } : null,
    companyAddress: user.compAddrCity ? {
      cep: user.compAddrCep,
      street: user.compAddrStreet,
      neighborhood: user.compAddrNeighborhood,
      city: user.compAddrCity,
      state: user.compAddrState,
      number: user.compAddrNumber,
    } : null,
    createdAt: user.createdAt,
  }
}

export default router
