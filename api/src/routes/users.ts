import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { sanitizeUser } from './auth'

const router = Router()

// ── GET /api/users/me ─────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return }
  res.json(sanitizeUser(user))
})

// ── PATCH /api/users/me ───────────────────────────────────────────────────────

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  profession: z.string().optional(),
  professions: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().nullable().optional(),
  showHourlyRate: z.boolean().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  bio: z.string().optional(),
  available: z.boolean().optional(),
  phone: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  companyName: z.string().nullable().optional(),
  cnpj: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  // Professional address
  addrCep: z.string().nullable().optional(),
  addrStreet: z.string().nullable().optional(),
  addrNeighborhood: z.string().nullable().optional(),
  addrCity: z.string().nullable().optional(),
  addrState: z.string().nullable().optional(),
  addrNumber: z.string().nullable().optional(),
  addrLat: z.number().nullable().optional(),
  addrLng: z.number().nullable().optional(),
  // Company address
  compAddrCep: z.string().nullable().optional(),
  compAddrStreet: z.string().nullable().optional(),
  compAddrNeighborhood: z.string().nullable().optional(),
  compAddrCity: z.string().nullable().optional(),
  compAddrState: z.string().nullable().optional(),
  compAddrNumber: z.string().nullable().optional(),
})

router.patch('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const data = parsed.data

  const updated = await prisma.user.update({
    where: { id: req.user!.userId },
    data: {
      ...data,
      professions: data.professions !== undefined ? JSON.stringify(data.professions) : undefined,
      tags: data.tags !== undefined ? JSON.stringify(data.tags) : undefined,
    },
  })

  res.json(sanitizeUser(updated))
})

// ── GET /api/users/professionals ──────────────────────────────────────────────
// List professionals with optional filters

router.get('/professionals', async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, city, profession, minRating, available } = req.query

  // SQLite uses case-sensitive LIKE; filter further in JS for case-insensitive search
  const users = await prisma.user.findMany({
    where: {
      roles: { contains: 'profissional' },
      ...(profession ? { professions: { contains: String(profession) } } : {}),
      ...(minRating ? { rating: { gte: parseFloat(String(minRating)) } } : {}),
      ...(available === 'true' ? { available: true } : {}),
    },
    orderBy: { rating: 'desc' },
  })

  const searchLc = search ? String(search).toLowerCase() : null
  const cityLc = city ? String(city).toLowerCase() : null

  const filtered = users.filter(u => {
    if (searchLc && !u.name.toLowerCase().includes(searchLc) && !(u.profession ?? '').toLowerCase().includes(searchLc)) return false
    if (cityLc && !(u.addrCity ?? '').toLowerCase().includes(cityLc) && !(u.addrNeighborhood ?? '').toLowerCase().includes(cityLc)) return false
    return true
  })

  res.json(filtered.map(sanitizeUser))
})

const p = (v: string | string[]) => String(v)

// ── GET /api/users/:id ────────────────────────────────────────────────────────

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: p(req.params.id) } })
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return }
  res.json(sanitizeUser(user))
})

export default router
