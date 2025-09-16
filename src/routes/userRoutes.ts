import { Router } from 'express'
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getUsers
} from '../controllers/userController'
import { authenticateToken } from '../middleware/auth'
import {
  validateUserRegistration,
  validateUserLogin
} from '../middleware/validation'

const router = Router()

// 公开路由
router.post('/register', validateUserRegistration, register)
router.post('/login', validateUserLogin, login)
router.post('/logout', logout)

// 需要认证的路由
router.use(authenticateToken)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.put('/change-password', changePassword)
router.get('/', getUsers)

export default router
