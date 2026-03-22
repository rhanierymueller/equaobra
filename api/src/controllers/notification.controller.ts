import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { notificationSchema } from '../models/notification.model'
import * as service from '../services/notification.service'
import { isServiceError } from '../lib/errors'

export async function list(req: AuthRequest, res: Response): Promise<void> {
  res.json(await service.listNotifications(req.user!.userId))
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const parsed = notificationSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }
  res.status(201).json(await service.createNotification(req.user!.userId, parsed.data))
}

export async function markAllRead(req: AuthRequest, res: Response): Promise<void> {
  await service.markAllAsRead(req.user!.userId)
  res.json({ ok: true })
}

export async function markRead(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.markAsRead(String(req.params.id), req.user!.userId)
  if (isServiceError(result)) { res.status(result.status).json({ error: result.error }); return }
  res.json(result)
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.deleteNotification(String(req.params.id), req.user!.userId)
  if (isServiceError(result)) { res.status(result.status).json({ error: result.error }); return }
  res.status(204).send()
}
