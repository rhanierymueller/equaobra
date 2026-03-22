import { Request, Response } from 'express'
import { registerSchema, loginSchema } from '../models/user.model'
import { registerUser, loginUser } from '../services/auth.service'
import { isServiceError } from '../lib/errors'

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const result = await registerUser(parsed.data)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }

  res.status(201).json(result)
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' })
    return
  }

  const result = await loginUser(parsed.data)
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }

  res.json(result)
}
