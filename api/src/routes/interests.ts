import { Router } from 'express'

import * as ctrl from '../controllers/interest.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.get('/', requireAuth, ctrl.list)
router.get('/contractor/:contractorId', requireAuth, ctrl.listByContractor)
router.post('/', requireAuth, ctrl.create)
router.delete('/:id', requireAuth, ctrl.remove)

export default router
