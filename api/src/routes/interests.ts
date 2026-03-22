import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as ctrl from '../controllers/interest.controller'

const router = Router()

router.get('/', requireAuth, ctrl.list)
router.get('/contractor/:contractorId', ctrl.listByContractor)
router.post('/', requireAuth, ctrl.create)
router.delete('/:id', requireAuth, ctrl.remove)

export default router
