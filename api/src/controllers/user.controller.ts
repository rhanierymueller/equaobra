import type { Response } from 'express'

import type { AuthRequest } from '../middleware/auth'
import { updateUserSchema } from '../models/user.model'
import { getUserById, updateUser, listProfessionals, addReview } from '../services/user.service'

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await getUserById(req.user!.userId)
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' })
    return
  }
  res.json(user)
}

export async function patchMe(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateUserSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const user = await updateUser(req.user!.userId, parsed.data)
  res.json(user)
}

export async function getProfessionals(req: AuthRequest, res: Response): Promise<void> {
  const { search, city, profession, minRating, available } = req.query
  const result = await listProfessionals({
    search: search as string | undefined,
    city: city as string | undefined,
    profession: profession as string | undefined,
    minRating: minRating as string | undefined,
    available: available as string | undefined,
  })
  res.json(result)
}

export async function postReview(req: AuthRequest, res: Response): Promise<void> {
  const { rating } = req.body as { rating: unknown }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'rating deve ser um número entre 1 e 5' })
    return
  }

  const updated = await addReview(String(req.params.id), rating)
  if (!updated) {
    res.status(404).json({ error: 'Usuário não encontrado' })
    return
  }

  res.json(updated)
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const user = await getUserById(String(req.params.id))
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' })
    return
  }
  res.json(user)
}
