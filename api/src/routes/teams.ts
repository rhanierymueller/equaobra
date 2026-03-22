import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as ctrl from '../controllers/team.controller'

const router = Router()

router.get('/', requireAuth, ctrl.list)
router.post('/', requireAuth, ctrl.create)
router.get('/:id', requireAuth, ctrl.getById)
router.patch('/:id', requireAuth, ctrl.update)
router.delete('/:id', requireAuth, ctrl.remove)
router.post('/:id/members', requireAuth, ctrl.addMember)
router.patch('/:id/members/:professionalId', requireAuth, ctrl.updateMember)
router.delete('/:id/members/:professionalId', requireAuth, ctrl.removeMember)

export default router
