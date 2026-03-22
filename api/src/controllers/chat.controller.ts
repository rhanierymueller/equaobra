import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { conversationSchema, messageSchema } from '../models/chat.model'
import * as service from '../services/chat.service'
import { isServiceError } from '../lib/errors'

export async function list(req: AuthRequest, res: Response): Promise<void> {
  res.json(await service.listConversations(req.user!.userId))
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const parsed = conversationSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }
  res.json(await service.createOrGetConversation(req.user!.userId, parsed.data))
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.getConversationById(String(req.params.id), req.user!.userId)
  if (isServiceError(result)) { res.status(result.status).json({ error: result.error }); return }
  res.json(result.data)
}

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  const parsed = messageSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const result = await service.sendMessage(String(req.params.id), req.user!.userId, parsed.data)
  if (isServiceError(result)) { res.status(result.status).json({ error: result.error }); return }
  res.status(201).json(result.data)
}
