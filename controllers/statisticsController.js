const { Approval, ApprovalFlow, ApprovalType, ApprovalRecord, User } = require('../models')
const { Op, fn, col, literal } = require('sequelize')
const { successResponse } = require('../utils/helpers')
const { ValidationError } = require('../utils/customErrors')
const logger = require('../utils/logger')

class StatisticsController {
    // 获取审批统计
    async getApprovalStatistics(req, res, next) {
        try {
            const { start_date, end_date, user_id } = req.query

            const where = {}
            if (start_date && end_date) {
                where.created_at = {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
                }
            }
            if (user_id) {
                where.applicant_id = user_id
            }

            // 基础统计
            const totalApplications = await Approval.count({ where })
            const pendingApplications = await Approval.count({
                where: { ...where, status: { [Op.in]: [0, 1] } }
            })
            const approvedApplications = await Approval.count({
                where: { ...where, status: 2 }
            })
            const rejectedApplications = await Approval.count({
                where: { ...where, status: 3 }
            })
            const withdrawnApplications = await Approval.count({
                where: { ...where, status: 4 }
            })

            // 计算审批率
            const totalProcessed = approvedApplications + rejectedApplications
            const approvalRate = totalProcessed > 0 ? 
                ((approvedApplications / totalProcessed) * 100).toFixed(1) : 0

            // 按流程统计
            const byFlow = await Approval.findAll({
                where,
                include: [
                    {
                        model: ApprovalFlow,
                        as: 'approvalFlow',
                        attributes: ['id', 'name'],
                    },
                ],
                attributes: [
                    'flow_id',
                    [fn('COUNT', col('Approval.id')), 'count'],
                    [fn('SUM', literal('CASE WHEN status = 2 THEN 1 ELSE 0 END')), 'approved'],
                    [fn('SUM', literal('CASE WHEN status = 3 THEN 1 ELSE 0 END')), 'rejected'],
                    [fn('SUM', literal('CASE WHEN status IN (0, 1) THEN 1 ELSE 0 END')), 'pending'],
                ],
                group: ['flow_id', 'approvalFlow.id'],
                raw: true,
            })

            // 按状态统计
            const byStatus = await Approval.findAll({
                where,
                attributes: [
                    'status',
                    [fn('COUNT', col('id')), 'count'],
                ],
                group: ['status'],
                raw: true,
            })

            // 状态名称映射
            const statusNames = {
                0: '待审批',
                1: '审批中',
                2: '已通过',
                3: '已拒绝',
                4: '已撤回'
            }

            const formattedByStatus = byStatus.map(item => ({
                status: item.status,
                name: statusNames[item.status] || '未知',
                count: parseInt(item.count)
            }))

            // 计算平均审批时间（简化版）
            const completedApplications = await Approval.findAll({
                where: {
                    ...where,
                    status: { [Op.in]: [2, 3] },
                    completed_at: { [Op.ne]: null }
                },
                attributes: [
                    [fn('AVG', fn('TIMESTAMPDIFF', 'HOUR', col('created_at'), col('completed_at'))), 'avg_hours']
                ],
                raw: true
            })

            const averageApprovalTime = completedApplications[0]?.avg_hours ? 
                parseFloat(completedApplications[0].avg_hours).toFixed(1) : 0

            res.json(successResponse({
                total_applications: totalApplications,
                pending_applications: pendingApplications,
                approved_applications: approvedApplications,
                rejected_applications: rejectedApplications,
                withdrawn_applications: withdrawnApplications,
                approval_rate: parseFloat(approvalRate),
                average_approval_time: parseFloat(averageApprovalTime),
                by_flow: byFlow.map(item => ({
                    flow_name: item['approvalFlow.name'],
                    count: parseInt(item.count),
                    approved: parseInt(item.approved || 0),
                    rejected: parseInt(item.rejected || 0),
                    pending: parseInt(item.pending || 0)
                })),
                by_status: formattedByStatus
            }, '获取成功'))
        } catch (error) {
            logger.error('获取审批统计失败', error)
            next(error)
        }
    }

    // 获取我的审批统计
    async getMyApprovalStatistics(req, res, next) {
        try {
            const { start_date, end_date } = req.query

            // 这里应该从JWT token中获取当前用户ID
            const currentUserId = req.user?.id || 1 // 临时使用，实际应该从认证中间件获取

            const where = { approver_id: currentUserId }
            if (start_date && end_date) {
                where.created_at = {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
                }
            }

            // 待审批数量
            const pendingCount = await Approval.count({
                where: {
                    status: { [Op.in]: [0, 1] }
                },
                include: [
                    {
                        model: ApprovalFlow,
                        as: 'approvalFlow',
                        include: [
                            {
                                model: require('../models').ApprovalApprover,
                                as: 'approvers',
                                where: { approver_id: currentUserId },
                                attributes: ['step'],
                            },
                        ],
                    },
                ],
            })

            // 审批记录统计
            const approvalStats = await ApprovalRecord.findAll({
                where,
                attributes: [
                    [fn('COUNT', col('id')), 'total_handled'],
                    [fn('SUM', literal('CASE WHEN action = 0 THEN 1 ELSE 0 END')), 'approved_count'],
                    [fn('SUM', literal('CASE WHEN action = 1 THEN 1 ELSE 0 END')), 'rejected_count'],
                ],
                raw: true
            })

            const totalHandled = parseInt(approvalStats[0]?.total_handled || 0)
            const approvedCount = parseInt(approvalStats[0]?.approved_count || 0)
            const rejectedCount = parseInt(approvalStats[0]?.rejected_count || 0)

            // 计算审批率
            const approvalRate = totalHandled > 0 ? 
                ((approvedCount / totalHandled) * 100).toFixed(1) : 0

            // 计算平均处理时间
            const handleTimeStats = await ApprovalRecord.findAll({
                where,
                include: [
                    {
                        model: Approval,
                        as: 'approval',
                        attributes: ['created_at'],
                    },
                ],
                attributes: [
                    [fn('AVG', fn('TIMESTAMPDIFF', 'HOUR', col('approval.created_at'), col('ApprovalRecord.created_at'))), 'avg_hours']
                ],
                raw: true
            })

            const averageHandleTime = handleTimeStats[0]?.avg_hours ? 
                parseFloat(handleTimeStats[0].avg_hours).toFixed(1) : 0

            res.json(successResponse({
                pending_count: pendingCount,
                approved_count: approvedCount,
                rejected_count: rejectedCount,
                total_handled: totalHandled,
                approval_rate: parseFloat(approvalRate),
                average_handle_time: parseFloat(averageHandleTime)
            }, '获取成功'))
        } catch (error) {
            logger.error('获取我的审批统计失败', error)
            next(error)
        }
    }
}

module.exports = new StatisticsController()
