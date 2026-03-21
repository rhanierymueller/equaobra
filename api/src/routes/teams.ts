import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

/** Express 5 types param values as string | string[] — always a string at runtime */
const p = (v: string | string[]) => String(v)

const memberSchema = z.object({
  professionalId: z.string(),
  name: z.string(),
  profession: z.string(),
  phone: z.string(),
  avatarUrl: z.string().optional(),
  avatarInitials: z.string(),
  hourlyRate: z.number().optional(),
  isLeader: z.boolean().default(false),
})

const teamSchema = z.object({
  name: z.string().min(2),
  obraLocation: z.string().min(2),
  estimatedDays: z.number().int().positive(),
  observations: z.string().default(''),
  scheduledStart: z.string(),
  members: z.array(memberSchema).default([]),
})

// ── GET /api/teams ────────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId

  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { professionalId: userId } } },
      ],
    },
    include: { members: true },
    orderBy: { createdAt: 'desc' },
  })

  res.json(teams)
})

// ── POST /api/teams ───────────────────────────────────────────────────────────

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = teamSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const { members, ...teamData } = parsed.data
  const team = await prisma.team.create({
    data: { ...teamData, ownerId: req.user!.userId, members: { create: members } },
    include: { members: true },
  })

  res.status(201).json(team)
})

// ── GET /api/teams/:id ────────────────────────────────────────────────────────

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await prisma.team.findUnique({
    where: { id: p(req.params.id) },
    include: { members: true },
  })
  if (!team) { res.status(404).json({ error: 'Equipe não encontrada' }); return }

  const userId = req.user!.userId
  if (team.ownerId !== userId && !team.members.some(m => m.professionalId === userId)) {
    res.status(403).json({ error: 'Sem permissão' }); return
  }

  res.json(team)
})

// ── PATCH /api/teams/:id ──────────────────────────────────────────────────────

router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await prisma.team.findUnique({ where: { id: p(req.params.id) } })
  if (!team) { res.status(404).json({ error: 'Equipe não encontrada' }); return }
  if (team.ownerId !== req.user!.userId) { res.status(403).json({ error: 'Sem permissão' }); return }

  const partial = teamSchema.omit({ members: true }).partial().safeParse(req.body)
  if (!partial.success) { res.status(400).json({ error: 'Dados inválidos' }); return }

  const updated = await prisma.team.update({
    where: { id: p(req.params.id) },
    data: partial.data,
    include: { members: true },
  })
  res.json(updated)
})

// ── DELETE /api/teams/:id ─────────────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await prisma.team.findUnique({ where: { id: p(req.params.id) } })
  if (!team) { res.status(404).json({ error: 'Equipe não encontrada' }); return }
  if (team.ownerId !== req.user!.userId) { res.status(403).json({ error: 'Sem permissão' }); return }

  await prisma.team.delete({ where: { id: p(req.params.id) } })
  res.status(204).send()
})

// ── POST /api/teams/:id/members ───────────────────────────────────────────────

router.post('/:id/members', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await prisma.team.findUnique({ where: { id: p(req.params.id) } })
  if (!team) { res.status(404).json({ error: 'Equipe não encontrada' }); return }
  if (team.ownerId !== req.user!.userId) { res.status(403).json({ error: 'Sem permissão' }); return }

  const parsed = memberSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const member = await prisma.teamMember.create({
    data: { teamId: p(req.params.id), ...parsed.data },
  })
  res.status(201).json(member)
})

// ── PATCH /api/teams/:id/members/:professionalId ──────────────────────────────

router.patch('/:id/members/:professionalId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await prisma.team.findUnique({ where: { id: p(req.params.id) } })
  if (!team) { res.status(404).json({ error: 'Equipe não encontrada' }); return }
  if (team.ownerId !== req.user!.userId) { res.status(403).json({ error: 'Sem permissão' }); return }

  const schema = z.object({
    isLeader: z.boolean().optional(),
    profession: z.string().optional(),
    phone: z.string().optional(),
    hourlyRate: z.number().nullable().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos' }); return }

  const member = await prisma.teamMember.findFirst({
    where: { teamId: p(req.params.id), professionalId: p(req.params.professionalId) },
  })
  if (!member) { res.status(404).json({ error: 'Membro não encontrado' }); return }

  const updated = await prisma.teamMember.update({ where: { id: member.id }, data: parsed.data })
  res.json(updated)
})

// ── DELETE /api/teams/:id/members/:professionalId ─────────────────────────────

router.delete('/:id/members/:professionalId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await prisma.team.findUnique({ where: { id: p(req.params.id) } })
  if (!team) { res.status(404).json({ error: 'Equipe não encontrada' }); return }
  if (team.ownerId !== req.user!.userId) { res.status(403).json({ error: 'Sem permissão' }); return }

  const member = await prisma.teamMember.findFirst({
    where: { teamId: p(req.params.id), professionalId: p(req.params.professionalId) },
  })
  if (!member) { res.status(404).json({ error: 'Membro não encontrado' }); return }

  await prisma.teamMember.delete({ where: { id: member.id } })
  res.status(204).send()
})

export default router
