import { Router } from 'express'
import userRoutes from './userRoutes'
import taskRoutes from './taskRoutes'
import approvalRoutes from './approvalRoutes'
import noticeRoutes from './noticeRoutes'

const router = Router()

const API_PREFIX = '/api'

router.use(`${API_PREFIX}/users`, userRoutes)
router.use(`${API_PREFIX}/tasks`, taskRoutes)
router.use(`${API_PREFIX}/approvals`, approvalRoutes)
router.use(`${API_PREFIX}/notices`, noticeRoutes)

export default router
