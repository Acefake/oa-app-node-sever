const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { validateUser } = require('../middleware/validation')

// 获取所有用户
router.get('/', userController.getUsers)

// 根据ID获取用户
router.get('/:id', validateUser.id, userController.getUserById)

// 创建用户
router.post('/', validateUser.create, userController.createUser)

// 更新用户
router.put('/:id', validateUser.id, validateUser.update, userController.updateUser)

// 删除用户
router.delete('/:id', validateUser.id, userController.deleteUser)

module.exports = router