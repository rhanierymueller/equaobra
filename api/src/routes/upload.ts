import path from 'path'
import fs from 'fs'

import type { Response } from 'express'
import { Router } from 'express'
import multer from 'multer'

import { prisma } from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'
import { requireAuth } from '../middleware/auth'
import { sanitizeUser } from '../models/user.model'

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads/avatars')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, _file, cb) => {
    const userId = (req as AuthRequest).user?.userId ?? 'unknown'
    cb(null, `${userId}.jpg`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Apenas imagens JPEG, PNG ou WebP são aceitas.'))
    }
  },
})

const router = Router()

router.post('/avatar', requireAuth, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId
  if (!userId || !req.file) {
    res.status(400).json({ error: 'Arquivo não enviado.' })
    return
  }

  const PORT = process.env.PORT ?? 3001
  const BASE_URL = process.env.API_URL ?? `http://localhost:${PORT}`
  const avatarUrl = `${BASE_URL}/uploads/avatars/${userId}.jpg`

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  })

  // Sync avatar in all team member records for this user
  await prisma.teamMember.updateMany({
    where: { professionalId: userId },
    data: { avatarUrl },
  })

  res.json(sanitizeUser(updated))
})

router.delete('/avatar', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId
  if (!userId) {
    res.status(401).json({ error: 'Não autorizado.' })
    return
  }

  const filePath = path.join(UPLOADS_DIR, `${userId}.jpg`)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  })

  await prisma.teamMember.updateMany({
    where: { professionalId: userId },
    data: { avatarUrl: null },
  })

  res.json(sanitizeUser(updated))
})

export default router
