import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as ctrl from '../controllers/chat.controller'

const router = Router()

router.get('/', requireAuth, ctrl.list)
router.post('/', requireAuth, ctrl.create)
router.get('/:id', requireAuth, ctrl.getById)
router.post('/:id/messages', requireAuth, ctrl.sendMessage)

export default router
