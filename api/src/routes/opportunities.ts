import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as ctrl from '../controllers/opportunity.controller'

const router = Router()

router.get('/', ctrl.list)
router.get('/mine', requireAuth, ctrl.listMine)
router.get('/:id', ctrl.getById)
router.post('/', requireAuth, ctrl.create)
router.patch('/:id', requireAuth, ctrl.update)
router.delete('/:id', requireAuth, ctrl.remove)

export default router
