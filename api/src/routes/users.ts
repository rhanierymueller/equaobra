import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getMe, patchMe, getProfessionals, getById } from '../controllers/user.controller'

const router = Router()

router.get('/me', requireAuth, getMe)
router.patch('/me', requireAuth, patchMe)
router.get('/professionals', getProfessionals)
router.get('/:id', getById)

export default router
