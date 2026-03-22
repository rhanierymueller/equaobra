import { Router } from 'express'

import * as ctrl from '../controllers/chat.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.get('/', requireAuth, ctrl.list)
router.post('/', requireAuth, ctrl.create)
router.get('/:id', requireAuth, ctrl.getById)
router.post('/:id/messages', requireAuth, ctrl.sendMessage)

export default router
