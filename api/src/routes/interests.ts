import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const p = (v: string | string[]) => String(v)

const interestSchema = z.object({
  contractorId: z.string(),
  professionalName: z.string(),
  professionalInitials: z.string(),
  professionalAvatarUrl: z.string().optional(),
  profession: z.string().optional(),
  location: z.string().optional(),
  rating: z.number().optional(),
})

// ── GET /api/interests ────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId
  const asContractor = req.query.as === 'contractor'

  const interests = await prisma.interest.findMany({
    where: asContractor ? { contractorId: userId } : { professionalId: userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(interests)
})

// ── GET /api/interests/contractor/:contractorId ───────────────────────────────

router.get('/contractor/:contractorId', async (req: Request, res: Response): Promise<void> => {
  const interests = await prisma.interest.findMany({
    where: { contractorId: p(req.params.contractorId) },
    orderBy: { createdAt: 'desc' },
  })
  res.json(interests)
})

// ── POST /api/interests ───────────────────────────────────────────────────────

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = interestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const professionalId = req.user!.userId
  const contractorId = parsed.data.contractorId

  const existing = await prisma.interest.findUnique({
    where: { contractorId_professionalId: { contractorId, professionalId } },
  })
  if (existing) {
    res.status(409).json({ error: 'Interesse já registrado', interest: existing })
    return
  }

  const interest = await prisma.interest.create({
    data: { professionalId, ...parsed.data },
  })
  res.status(201).json(interest)
})

// ── DELETE /api/interests/:id ─────────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const interest = await prisma.interest.findUnique({ where: { id: p(req.params.id) } })
  if (!interest) { res.status(404).json({ error: 'Interesse não encontrado' }); return }
  if (interest.professionalId !== req.user!.userId) { res.status(403).json({ error: 'Sem permissão' }); return }

  await prisma.interest.delete({ where: { id: p(req.params.id) } })
  res.status(204).send()
})

export default router
