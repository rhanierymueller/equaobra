import type { Request, Response } from 'express'
import { z } from 'zod'

import { isServiceError } from '../lib/errors'
import type { AuthRequest } from '../middleware/auth'
import { registerSchema, loginSchema } from '../models/user.model'
import { registerUser, loginUser, changePassword } from '../services/auth.service'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^a-zA-Z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
})

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

export async function changePasswordHandler(req: AuthRequest, res: Response): Promise<void> {
  const parsed = changePasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const result = await changePassword(
    req.user!.userId,
    parsed.data.currentPassword,
    parsed.data.newPassword,
  )
  if (isServiceError(result)) {
    res.status(result.status).json({ error: result.error })
    return
  }

  res.json({ message: 'Senha alterada com sucesso' })
}
