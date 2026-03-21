import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router({ mergeParams: true })

const p = (v: string | string[]) => String(v)

const logSchema = z.object({
  memberId: z.string(),
  memberName: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours: z.number().positive().max(24),
  description: z.string().optional(),
})

// ── GET /api/teams/:id/worklogs ───────────────────────────────────────────────

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const teamId = p(req.params.id)
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  })
  if (!team) { res.status(404).json({ error: 'Equipe não encontrada' }); return }

  const userId = req.user!.userId
  if (team.ownerId !== userId && !team.members.some(m => m.professionalId === userId)) {
    res.status(403).json({ error: 'Sem permissão' }); return
  }

  const logs = await prisma.workLog.findMany({
    where: { teamId },
    orderBy: { date: 'desc' },
  })
  res.json(logs)
})

// ── POST /api/teams/:id/worklogs ──────────────────────────────────────────────

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = logSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const teamId = p(req.params.id)
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  })
  if (!team) { res.status(404).json({ error: 'Equipe não encontrada' }); return }

  const userId = req.user!.userId
  if (team.ownerId !== userId && !team.members.some(m => m.professionalId === userId)) {
    res.status(403).json({ error: 'Sem permissão' }); return
  }

  const log = await prisma.workLog.create({ data: { teamId, ...parsed.data } })
  res.status(201).json(log)
})

// ── DELETE /api/teams/:id/worklogs/:logId ─────────────────────────────────────

router.delete('/:logId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const logId = p(req.params.logId)
  const teamId = p(req.params.id)

  const log = await prisma.workLog.findUnique({ where: { id: logId } })
  if (!log) { res.status(404).json({ error: 'Registro não encontrado' }); return }
  if (log.teamId !== teamId) { res.status(400).json({ error: 'Registro não pertence à equipe' }); return }

  const team = await prisma.team.findUnique({ where: { id: teamId } })
  const userId = req.user!.userId
  if (team?.ownerId !== userId && log.memberId !== userId) {
    res.status(403).json({ error: 'Sem permissão' }); return
  }

  await prisma.workLog.delete({ where: { id: logId } })
  res.status(204).send()
})

export default router
