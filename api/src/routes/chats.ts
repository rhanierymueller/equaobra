import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const p = (v: string | string[]) => String(v)

const convSchema = z.object({
  professionalId: z.string(),
  professionalName: z.string(),
  professionalInitials: z.string(),
  professionalAvatarUrl: z.string().optional(),
})

const messageSchema = z.object({
  senderName: z.string(),
  text: z.string().min(1),
})

// ── GET /api/chats ────────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userId }, { professionalId: userId }] },
    include: { messages: { orderBy: { timestamp: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })

  res.json(conversations)
})

// ── POST /api/chats ───────────────────────────────────────────────────────────

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = convSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const userId = req.user!.userId
  const convId = `${userId}_${parsed.data.professionalId}`

  const conv = await prisma.conversation.upsert({
    where: { id: convId },
    create: { id: convId, userId, ...parsed.data },
    update: {},
    include: { messages: { orderBy: { timestamp: 'asc' } } },
  })

  res.json(conv)
})

// ── GET /api/chats/:id ────────────────────────────────────────────────────────

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId
  const conv = await prisma.conversation.findUnique({
    where: { id: p(req.params.id) },
    include: { messages: { orderBy: { timestamp: 'asc' } } },
  })
  if (!conv) { res.status(404).json({ error: 'Conversa não encontrada' }); return }

  if (conv.userId !== userId && conv.professionalId !== userId) {
    res.status(403).json({ error: 'Sem permissão' }); return
  }

  res.json(conv)
})

// ── POST /api/chats/:id/messages ──────────────────────────────────────────────

router.post('/:id/messages', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = messageSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const convId = p(req.params.id)
  const conv = await prisma.conversation.findUnique({ where: { id: convId } })
  if (!conv) { res.status(404).json({ error: 'Conversa não encontrada' }); return }

  const userId = req.user!.userId
  if (conv.userId !== userId && conv.professionalId !== userId) {
    res.status(403).json({ error: 'Sem permissão' }); return
  }

  const message = await prisma.message.create({
    data: { convId, senderId: userId, senderName: parsed.data.senderName, text: parsed.data.text },
  })

  res.status(201).json(message)
})

export default router
