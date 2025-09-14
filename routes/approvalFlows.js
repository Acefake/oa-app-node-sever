const express = require('express')
const router = express.Router()
const approvalFlowController = require('../controllers/approvalFlowController')
const { validateApprovalFlow } = require('../middleware/validation')

// 获取所有审批流程
router.get('/', approvalFlowController.getApprovalFlows)

// 根据ID获取审批流程
router.get('/:id', validateApprovalFlow.id, approvalFlowController.getApprovalFlowById)

// 创建审批流程
router.post('/', validateApprovalFlow.create, approvalFlowController.createApprovalFlow)

// 更新审批流程
router.put('/:id', validateApprovalFlow.id, validateApprovalFlow.update, approvalFlowController.updateApprovalFlow)

// 删除审批流程
router.delete('/:id', validateApprovalFlow.id, approvalFlowController.deleteApprovalFlow)

// 获取流程的审批人配置
router.get('/:flowId/approvers', validateApprovalFlow.flowId, approvalFlowController.getFlowApprovers)

// 配置流程审批人
router.post('/:flowId/approvers', validateApprovalFlow.flowId, validateApprovalFlow.approvers, approvalFlowController.setFlowApprovers)

module.exports = router