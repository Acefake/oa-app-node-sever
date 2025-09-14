const express = require('express')
const router = express.Router()
const statisticsController = require('../controllers/statisticsController')

// 获取审批统计
router.get('/approval', statisticsController.getApprovalStatistics)

// 获取我的审批统计
router.get('/my-approval', statisticsController.getMyApprovalStatistics)

module.exports = router
