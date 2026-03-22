import { Router } from 'express'

import * as ctrl from '../controllers/notification.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.get('/', requireAuth, ctrl.list)
router.post('/', requireAuth, ctrl.create)
router.patch('/read-all', requireAuth, ctrl.markAllRead)
router.patch('/:id/read', requireAuth, ctrl.markRead)
router.delete('/:id', requireAuth, ctrl.remove)

export default router
