const express = require('express')
const router = express.Router()
const systemConfigController = require('../controllers/systemConfigController')
const { validateSystemConfig } = require('../middleware/validation')

// 获取系统配置
router.get('/', systemConfigController.getSystemConfigs)

// 根据键获取配置
router.get('/:key', validateSystemConfig.key, systemConfigController.getSystemConfigByKey)

// 更新系统配置
router.put('/:key', validateSystemConfig.key, validateSystemConfig.update, systemConfigController.updateSystemConfig)

module.exports = router
