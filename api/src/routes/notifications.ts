import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const p = (v: string | string[]) => String(v)

const notifSchema = z.object({
  type: z.enum(['log_delete_request', 'log_deleted', 'log_edited']),
  teamId: z.string(),
  teamName: z.string(),
  toMemberId: z.string(),
  fromMemberName: z.string(),
  logId: z.string().optional(),
  logDate: z.string().optional(),
  logHours: z.number().optional(),
  message: z.string(),
})

// ── GET /api/notifications ────────────────────────────────────────────────────

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const notifs = await prisma.notification.findMany({
    where: { toMemberId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(notifs)
})

// ── POST /api/notifications ───────────────────────────────────────────────────

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = notifSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const notif = await prisma.notification.create({
    data: { fromMemberId: req.user!.userId, ...parsed.data },
  })
  res.status(201).json(notif)
})

// ── PATCH /api/notifications/read-all ────────────────────────────────────────

router.patch('/read-all', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.notification.updateMany({
    where: { toMemberId: req.user!.userId, read: false },
    data: { read: true },
  })
  res.json({ ok: true })
})

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────

router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const notif = await prisma.notification.findUnique({ where: { id: p(req.params.id) } })
  if (!notif) { res.status(404).json({ error: 'Notificação não encontrada' }); return }
  if (notif.toMemberId !== req.user!.userId) { res.status(403).json({ error: 'Sem permissão' }); return }

  const updated = await prisma.notification.update({
    where: { id: p(req.params.id) },
    data: { read: true },
  })
  res.json(updated)
})

// ── DELETE /api/notifications/:id ─────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const notif = await prisma.notification.findUnique({ where: { id: p(req.params.id) } })
  if (!notif) { res.status(404).json({ error: 'Notificação não encontrada' }); return }
  if (notif.toMemberId !== req.user!.userId) { res.status(403).json({ error: 'Sem permissão' }); return }

  await prisma.notification.delete({ where: { id: p(req.params.id) } })
  res.status(204).send()
})

export default router
