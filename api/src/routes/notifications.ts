import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as ctrl from '../controllers/notification.controller'

const router = Router()

router.get('/', requireAuth, ctrl.list)
router.post('/', requireAuth, ctrl.create)
router.patch('/read-all', requireAuth, ctrl.markAllRead)
router.patch('/:id/read', requireAuth, ctrl.markRead)
router.delete('/:id', requireAuth, ctrl.remove)

export default router
