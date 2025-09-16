import { Router } from 'express'
import {
  createNotice,
  getNotices,
  getNoticeById,
  markAsRead,
  markAllAsRead,
  deleteNotice,
  getUnreadCount
} from '../controllers/noticeController'
import { authenticateToken } from '../middleware/auth'
import { validateNoticeCreation } from '../middleware/validation'

const router = Router()

// 所有通知路由都需要认证
router.use(authenticateToken)

router.post('/', validateNoticeCreation, createNotice)
router.get('/', getNotices)
router.get('/unread-count', getUnreadCount)
router.get('/:id', getNoticeById)
router.patch('/:id/read', markAsRead)
router.patch('/mark-all-read', markAllAsRead)
router.delete('/:id', deleteNotice)

export default router
