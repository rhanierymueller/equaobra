import { Router } from 'express'

import { register, login, changePasswordHandler } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/change-password', requireAuth, changePasswordHandler)

export default router
