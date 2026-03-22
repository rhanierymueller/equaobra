import { Router } from 'express'

import { getMe, patchMe, getProfessionals, getById } from '../controllers/user.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.get('/me', requireAuth, getMe)
router.patch('/me', requireAuth, patchMe)
router.get('/professionals', getProfessionals)
router.get('/:id', getById)

export default router
