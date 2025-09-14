const { Approval, ApprovalFlow, ApprovalType, User, ApprovalRecord, ApprovalApprover } = require('../models')
const { Op } = require('sequelize')
const { successResponse, errorResponse, paginate } = require('../utils/helpers')
const {
    ValidationError,
    NotFoundError,
    BusinessError,
} = require('../utils/customErrors')
const logger = require('../utils/logger')

class ApprovalController {
    // 获取我的申请列表
    async getMyApplications(req, res, next) {
        try {
            const { page = 1, limit = 10, status, flow_id } = req.query
            const { offset, limit: limitNum } = paginate(page, limit)

            // 这里应该从JWT token中获取当前用户ID
            const currentUserId = req.user?.id || 1 // 临时使用，实际应该从认证中间件获取

            const where = { applicant_id: currentUserId }
            if (status !== undefined) where.status = status
            if (flow_id) where.flow_id = flow_id

            const { count, rows } = await Approval.findAndCountAll({
                where,
                include: [
                    {
                        model: ApprovalFlow,
                        as: 'approvalFlow',
                        attributes: ['id', 'name'],
                    },
                    {
                        model: ApprovalType,
                        as: 'approvalType',
                        attributes: ['id', 'type_name'],
                    },
                ],
                offset,
                limit: limitNum,
                order: [['created_at', 'DESC']],
            })

            res.json(
                successResponse(
                    {
                        list: rows,
                        total: count,
                        page: parseInt(page),
                        limit: limitNum,
                        total_pages: Math.ceil(count / limitNum),
                    },
                    '获取成功'
                )
            )
        } catch (error) {
            logger.error('获取我的申请列表失败', error)
            next(error)
        }
    }

    // 创建审批申请
    async createApplication(req, res, next) {
        try {
            const { flow_id, title, content, priority = 1, form_data } = req.body

            // 参数验证
            if (!flow_id) {
                throw new ValidationError('流程ID不能为空', 'flow_id')
            }
            if (!title) {
                throw new ValidationError('申请标题不能为空', 'title')
            }
            if (!content) {
                throw new ValidationError('申请内容不能为空', 'content')
            }

            // 检查流程是否存在
            const flow = await ApprovalFlow.findByPk(flow_id, {
                include: [
                    {
                        model: ApprovalType,
                        as: 'approvalType',
                        attributes: ['id', 'type_name'],
                    },
                ],
            })
            if (!flow) {
                throw new NotFoundError('审批流程不存在', 'ApprovalFlow', {
                    flowId: flow_id,
                })
            }

            // 这里应该从JWT token中获取当前用户ID
            const currentUserId = req.user?.id || 1 // 临时使用，实际应该从认证中间件获取

            // 生成表单编号
            const formNo = this.generateFormNo()

            // 计算总步骤数
            const totalSteps = flow.steps ? flow.steps.length : 1

            const application = await Approval.create({
                form_no: formNo,
                type_id: flow.type_id,
                flow_id,
                applicant_id: currentUserId,
                title,
                content,
                form_data,
                status: 0, // 待审批
                current_step: 1,
                total_steps: totalSteps,
                priority,
            })

            const newApplication = await Approval.findByPk(application.id, {
                include: [
                    {
                        model: ApprovalFlow,
                        as: 'approvalFlow',
                        attributes: ['id', 'name'],
                    },
                    {
                        model: ApprovalType,
                        as: 'approvalType',
                        attributes: ['id', 'type_name'],
                    },
                    {
                        model: User,
                        as: 'applicant',
                        attributes: ['id', 'real_name', 'email'],
                    },
                ],
            })

            logger.info('创建审批申请成功', {
                applicationId: application.id,
                formNo: formNo,
                applicantId: currentUserId,
            })

            res.status(201).json(successResponse(newApplication, '申请创建成功'))
        } catch (error) {
            logger.error('创建审批申请失败', {
                error: error.message,
                stack: error.stack,
                body: req.body,
            })
            next(error)
        }
    }

    // 获取申请详情
    async getApplicationById(req, res, next) {
        try {
            const { id } = req.params

            if (!id) {
                throw new ValidationError('申请ID不能为空', 'id')
            }

            const application = await Approval.findByPk(id, {
                include: [
                    {
                        model: ApprovalFlow,
                        as: 'approvalFlow',
                        attributes: ['id', 'name'],
                    },
                    {
                        model: ApprovalType,
                        as: 'approvalType',
                        attributes: ['id', 'type_name'],
                    },
                    {
                        model: User,
                        as: 'applicant',
                        attributes: ['id', 'real_name', 'email'],
                    },
                    {
                        model: ApprovalRecord,
                        as: 'approvalRecords',
                        include: [
                            {
                                model: User,
                                as: 'approver',
                                attributes: ['id', 'real_name'],
                            },
                        ],
                        order: [['created_at', 'ASC']],
                    },
                ],
            })

            if (!application) {
                throw new NotFoundError('审批申请不存在', 'Approval', {
                    applicationId: id,
                })
            }

            res.json(successResponse(application, '获取成功'))
        } catch (error) {
            logger.error('获取申请详情失败', {
                error: error.message,
                stack: error.stack,
                params: req.params,
            })
            next(error)
        }
    }

    // 撤回申请
    async withdrawApplication(req, res, next) {
        try {
            const { id } = req.params

            if (!id) {
                throw new ValidationError('申请ID不能为空', 'id')
            }

            const application = await Approval.findByPk(id)
            if (!application) {
                throw new NotFoundError('审批申请不存在', 'Approval', {
                    applicationId: id,
                })
            }

            // 只有待审批和审批中状态的申请才能撤回
            if (application.status !== 0 && application.status !== 1) {
                throw new BusinessError('只有待审批和审批中状态的申请才能撤回', 'INVALID_STATUS', {
                    currentStatus: application.status,
                })
            }

            await application.update({
                status: 4, // 已撤回
                completed_at: new Date(),
            })

            logger.info('撤回申请成功', { applicationId: id })

            res.json(successResponse({ id: application.id, status: 4 }, '申请已撤回'))
        } catch (error) {
            logger.error('撤回申请失败', error)
            next(error)
        }
    }

    // 获取待我审批的申请
    async getPendingApplications(req, res, next) {
        try {
            const { page = 1, limit = 10, priority } = req.query
            const { offset, limit: limitNum } = paginate(page, limit)

            // 这里应该从JWT token中获取当前用户ID
            const currentUserId = req.user?.id || 1 // 临时使用，实际应该从认证中间件获取

            const where = {
                status: { [Op.in]: [0, 1] }, // 待审批或审批中
            }
            if (priority) where.priority = priority

            // 查找当前用户需要审批的申请
            const applications = await Approval.findAll({
                where,
                include: [
                    {
                        model: ApprovalFlow,
                        as: 'approvalFlow',
                        attributes: ['id', 'name'],
                        include: [
                            {
                                model: ApprovalApprover,
                                as: 'approvers',
                                where: { approver_id: currentUserId },
                                attributes: ['step'],
                            },
                        ],
                    },
                    {
                        model: ApprovalType,
                        as: 'approvalType',
                        attributes: ['id', 'type_name'],
                    },
                    {
                        model: User,
                        as: 'applicant',
                        attributes: ['id', 'real_name'],
                    },
                ],
                offset,
                limit: limitNum,
                order: [['created_at', 'DESC']],
            })

            // 过滤出当前步骤需要当前用户审批的申请
            const pendingApplications = applications.filter(app => {
                const approverConfig = app.approvalFlow.approvers.find(
                    approver => approver.step === app.current_step
                )
                return approverConfig
            })

            res.json(
                successResponse(
                    {
                        list: pendingApplications,
                        total: pendingApplications.length,
                        page: parseInt(page),
                        limit: limitNum,
                        total_pages: Math.ceil(pendingApplications.length / limitNum),
                    },
                    '获取成功'
                )
            )
        } catch (error) {
            logger.error('获取待我审批的申请失败', error)
            next(error)
        }
    }

    // 审批申请
    async approveApplication(req, res, next) {
        try {
            const { id } = req.params
            const { action, comment } = req.body

            if (!id) {
                throw new ValidationError('申请ID不能为空', 'id')
            }

            if (action === undefined) {
                throw new ValidationError('审批动作不能为空', 'action')
            }

            // 这里应该从JWT token中获取当前用户ID
            const currentUserId = req.user?.id || 1 // 临时使用，实际应该从认证中间件获取

            const application = await Approval.findByPk(id, {
                include: [
                    {
                        model: ApprovalFlow,
                        as: 'approvalFlow',
                        include: [
                            {
                                model: ApprovalApprover,
                                as: 'approvers',
                                where: { approver_id: currentUserId },
                                attributes: ['step'],
                            },
                        ],
                    },
                ],
            })

            if (!application) {
                throw new NotFoundError('审批申请不存在', 'Approval', {
                    applicationId: id,
                })
            }

            // 检查当前用户是否有权限审批此申请
            const canApprove = application.approvalFlow.approvers.some(
                approver => approver.step === application.current_step
            )

            if (!canApprove) {
                throw new BusinessError('您没有权限审批此申请', 'NO_PERMISSION')
            }

            // 创建审批记录
            await ApprovalRecord.create({
                application_id: id,
                step: application.current_step,
                approver_id: currentUserId,
                action: action, // 0-通过，1-拒绝
                comment,
            })

            let nextStep = application.current_step + 1
            let newStatus = application.status

            if (action === 1) {
                // 拒绝
                newStatus = 3 // 已拒绝
                await application.update({
                    status: newStatus,
                    completed_at: new Date(),
                })
            } else if (action === 0) {
                // 通过
                if (nextStep > application.total_steps) {
                    // 所有步骤都完成了
                    newStatus = 2 // 已通过
                    await application.update({
                        status: newStatus,
                        current_step: nextStep - 1,
                        completed_at: new Date(),
                    })
                } else {
                    // 进入下一步
                    newStatus = 1 // 审批中
                    await application.update({
                        status: newStatus,
                        current_step: nextStep,
                    })
                }
            }

            logger.info('审批申请成功', {
                applicationId: id,
                action,
                approverId: currentUserId,
            })

            res.json(successResponse({
                application_id: id,
                step: application.current_step,
                action,
                next_step: nextStep,
                is_completed: newStatus === 2 || newStatus === 3,
            }, '审批完成'))
        } catch (error) {
            logger.error('审批申请失败', error)
            next(error)
        }
    }

    // 获取审批记录
    async getApprovalRecords(req, res, next) {
        try {
            const { id } = req.params

            if (!id) {
                throw new ValidationError('申请ID不能为空', 'id')
            }

            const records = await ApprovalRecord.findAll({
                where: { application_id: id },
                include: [
                    {
                        model: User,
                        as: 'approver',
                        attributes: ['id', 'real_name', 'email'],
                    },
                ],
                order: [['created_at', 'ASC']],
            })

            res.json(successResponse(records, '获取成功'))
        } catch (error) {
            logger.error('获取审批记录失败', error)
            next(error)
        }
    }

    // 生成表单编号
    generateFormNo() {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const timestamp = now.getTime().toString().slice(-6)
        return `APP${year}${month}${day}${timestamp}`
    }
}

module.exports = new ApprovalController()