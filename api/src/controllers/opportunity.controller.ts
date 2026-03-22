import type { Request, Response } from 'express'

import { isServiceError } from '../lib/errors'
import type { AuthRequest } from '../middleware/auth'
import { opportunitySchema } from '../models/opportunity.model'
import * as service from '../services/opportunity.service'

export async function list(req: Request, res: Response): Promise<void> {
  const { city, profession } = req.query
  const result = await service.listOpportunities({
    city: city as string | undefined,
    profession: profession as string | undefined,
  })
  res.json(result)
}

export async function listMine(req: AuthRequest, res: Response): Promise<void> {
  res.json(await service.listMyOpportunities(req.user!.userId))
}

export async function getById(req: Request, res: Response): Promise<void> {
  const opp = await service.getOpportunityById(String(req.params.id))
  if (!opp) {
    res.status(404).json({ error: 'Oportunidade não encontrada' })
    return
  }
  res.json(opp)
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const parsed = opportunitySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const opp = await service.createOpportunity(req.user!.userId, parsed.data)
  res.status(201).json(opp)
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.updateOpportunity(String(req.params.id), req.user!.userId, req.body)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.json(result.data)
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.deleteOpportunity(String(req.params.id), req.user!.userId)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.status(204).send()
}
