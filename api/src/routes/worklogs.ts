import { Router } from 'express'

import * as ctrl from '../controllers/worklog.controller'
import { requireAuth } from '../middleware/auth'

const router = Router({ mergeParams: true })

router.get('/', requireAuth, ctrl.list)
router.post('/', requireAuth, ctrl.create)
router.delete('/:logId', requireAuth, ctrl.remove)

export default router
