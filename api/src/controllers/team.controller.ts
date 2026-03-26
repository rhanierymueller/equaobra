import type { Response } from 'express'

import { isServiceError } from '../lib/errors'
import type { AuthRequest } from '../middleware/auth'
import { teamSchema, memberSchema, updateMemberSchema, respondInviteSchema } from '../models/team.model'
import * as service from '../services/team.service'

export async function list(req: AuthRequest, res: Response): Promise<void> {
  res.json(await service.listTeams(req.user!.userId))
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const parsed = teamSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }
  res.status(201).json(await service.createTeam(req.user!.userId, parsed.data))
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.getTeamById(String(req.params.id), req.user!.userId)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.json(result.data)
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const partial = teamSchema.omit({ members: true }).partial().safeParse(req.body)
  if (!partial.success) {
    res.status(400).json({ error: 'Dados inválidos' })
    return
  }

  const result = await service.updateTeam(String(req.params.id), req.user!.userId, partial.data)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.json(result.data)
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.deleteTeam(String(req.params.id), req.user!.userId)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.status(204).send()
}

export async function addMember(req: AuthRequest, res: Response): Promise<void> {
  const parsed = memberSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const result = await service.addMember(String(req.params.id), req.user!.userId, parsed.data)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.status(201).json(result.data)
}

export async function updateMember(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateMemberSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' })
    return
  }

  const result = await service.updateMember(
    String(req.params.id),
    String(req.params.professionalId),
    req.user!.userId,
    parsed.data,
  )
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.json(result.data)
}

export async function removeMember(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.removeMember(
    String(req.params.id),
    String(req.params.professionalId),
    req.user!.userId,
  )
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.status(204).send()
}

export async function leaveTeam(req: AuthRequest, res: Response): Promise<void> {
  const result = await service.leaveTeam(
    String(req.params.id),
    String(req.params.professionalId),
    req.user!.userId,
  )
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.status(204).send()
}

export async function respondToInvite(req: AuthRequest, res: Response): Promise<void> {
  const parsed = respondInviteSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Ação inválida. Use "accept" ou "reject".' })
    return
  }

  const result = await service.respondToInvite(
    String(req.params.id),
    String(req.params.professionalId),
    req.user!.userId,
    parsed.data.action,
  )
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.json(result.data)
}
