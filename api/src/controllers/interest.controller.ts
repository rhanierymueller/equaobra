import type { Request, Response } from 'express'

import { isServiceError } from '../lib/errors'
import type { AuthRequest } from '../middleware/auth'
import { interestSchema } from '../models/interest.model'
import * as service from '../services/interest.service'

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const asContractor = req.query.as === 'contractor'
  res.json(await service.listInterests(req.user!.userId, asContractor))
}

export async function listByContractor(req: Request, res: Response): Promise<void> {
  res.json(await service.listInterestsByContractor(String(req.params.contractorId)))
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const parsed = interestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const result = await service.createInterest(req.user!.userId, parsed.data)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error, interest: result.interest })
    return
  }
  res.status(201).json(result.data)
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.deleteInterest(String(req.params.id), req.user!.userId)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.status(204).send()
}
