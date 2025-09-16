import { Router } from 'express'
import {
  createApproval,
  getApprovals,
  getApprovalById,
  processApproval,
  deleteApproval,
  getMyApprovals,
  getPendingApprovals
} from '../controllers/approvalController'
import { authenticateToken } from '../middleware/auth'
import { validateApprovalCreation } from '../middleware/validation'

const router = Router()

// 所有审批路由都需要认证
router.use(authenticateToken)

router.post('/create', validateApprovalCreation, createApproval)
router.get('/list', getApprovals)
router.get('/myList', getMyApprovals)
router.get('/pending', getPendingApprovals)
router.get('/detail/:id', getApprovalById)
router.patch('/process/:id', processApproval)
router.delete('/delete/:id', deleteApproval)

export default router
