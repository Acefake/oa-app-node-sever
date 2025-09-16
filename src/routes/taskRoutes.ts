import { Router } from 'express'
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../controllers/taskController'
import { authenticateToken } from '../middleware/auth'
import { validateTaskCreation } from '../middleware/validation'

const router = Router()

router.use(authenticateToken)
router.post('/create', validateTaskCreation, createTask)
router.get('/list', getTasks)
router.get('/detail/:id', getTaskById)
router.put('/update/:id', updateTask)
router.delete('/delete/:id', deleteTask)
router.patch('/update-status/:id', updateTaskStatus)

export default router
