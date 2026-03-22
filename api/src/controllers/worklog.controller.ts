import type { Response } from 'express'

import { isServiceError } from '../lib/errors'
import type { AuthRequest } from '../middleware/auth'
import { workLogSchema } from '../models/worklog.model'
import * as service from '../services/worklog.service'

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.listWorkLogs(String(req.params.id), req.user!.userId)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.json(result.data)
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const parsed = workLogSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const result = await service.createWorkLog(String(req.params.id), req.user!.userId, parsed.data)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.status(201).json(result.data)
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.deleteWorkLog(
    String(req.params.id),
    String(req.params.logId),
    req.user!.userId,
  )
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.status(204).send()
}
