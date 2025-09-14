const express = require('express')
const router = express.Router()

// 导入所有路由
const userRoutes = require('./users')
const approvalFlowRoutes = require('./approvalFlows')
const approvalRoutes = require('./approvals')
const statisticsRoutes = require('./statistics')
const systemConfigRoutes = require('./systemConfigs')

// 使用路由
router.use('/users', userRoutes)
router.use('/approval-flows', approvalFlowRoutes)
router.use('/approval-applications', approvalRoutes)
router.use('/statistics', statisticsRoutes)
router.use('/system-configs', systemConfigRoutes)

// 健康检查
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'OA系统API服务正常运行',
        timestamp: new Date().toISOString(),
    })
})

module.exports = router