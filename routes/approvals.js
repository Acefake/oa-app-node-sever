const express = require('express')
const router = express.Router()
const approvalController = require('../controllers/approvalController')
const { validateApproval } = require('../middleware/validation')

// 获取我的申请列表
router.get('/my', validateApproval.query, approvalController.getMyApplications)

// 创建审批申请
router.post('/', validateApproval.create, approvalController.createApplication)

// 获取申请详情
router.get('/:id', validateApproval.id, approvalController.getApplicationById)

// 撤回申请
router.put('/:id/withdraw', validateApproval.id, approvalController.withdrawApplication)

// 获取待我审批的申请
router.get('/pending', validateApproval.query, approvalController.getPendingApplications)

// 审批申请
router.post('/:id/approve', validateApproval.id, validateApproval.approve, approvalController.approveApplication)

// 获取审批记录
router.get('/:id/records', validateApproval.id, approvalController.getApprovalRecords)

module.exports = router