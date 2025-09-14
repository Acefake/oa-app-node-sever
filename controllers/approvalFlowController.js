const {
  ApprovalFlow,
  ApprovalType,
  ApprovalApprover,
  User
} = require('../models')
const { Op } = require('sequelize')
const {
  successResponse,
  errorResponse,
  dbErrorResponse,
  paginate
} = require('../utils/helpers')
const {
  ValidationError,
  NotFoundError,
  BusinessError
} = require('../utils/customErrors')

// 获取所有审批流程
const getApprovalFlows = async (req, res, next) => {
  try {
    // 先测试数据库连接
    const { sequelize } = require('../models')
    await sequelize.authenticate()

    // 简单的查询测试
    const count = await ApprovalFlow.count()
    const rows = await ApprovalFlow.findAll({
      limit: 10,
      order: [['created_at', 'DESC']]
    })

    const data = {
      list: rows,
      pagination: {
        total: count,
        page: 1,
        limit: 10,
        pages: Math.ceil(count / 10)
      }
    }

    res.json(successResponse(data, '获取审批流程列表成功'))
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json(errorResponse('数据库查询失败: ' + error.message))
  }
}

// 根据ID获取审批流程
const getApprovalFlowById = async (req, res, next) => {
  try {
    const { id } = req.params

    const approvalFlow = await ApprovalFlow.findByPk(id, {
      include: [
        {
          model: ApprovalType,
          as: 'approvalType',
          attributes: ['id', 'name', 'code']
        },
        {
          model: ApprovalApprover,
          as: 'approvers',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'real_name', 'email', 'phone']
            }
          ]
        }
      ]
    })

    if (!approvalFlow) {
      throw new NotFoundError('审批流程不存在', 'ApprovalFlow')
    }

    res.json(successResponse(approvalFlow, '获取审批流程详情成功'))
  } catch (error) {
    next(error)
  }
}

// 创建审批流程
const createApprovalFlow = async (req, res, next) => {
  try {
    const { type_id, name, description, steps, status = 1 } = req.body

    // 验证审批类型是否存在
    const approvalType = await ApprovalType.findByPk(type_id)
    if (!approvalType) {
      throw new NotFoundError('审批类型不存在', 'ApprovalType')
    }

    // 验证步骤配置
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new ValidationError('审批步骤不能为空', 'steps')
    }

    // 验证步骤编号是否连续
    const stepNumbers = steps.map(s => s.step).sort((a, b) => a - b)
    for (let i = 0; i < stepNumbers.length; i++) {
      if (stepNumbers[i] !== i + 1) {
        throw new ValidationError('审批步骤编号必须从1开始连续递增', 'steps')
      }
    }

    const approvalFlow = await ApprovalFlow.create({
      type_id,
      name,
      description,
      steps,
      status
    })

    // 重新查询以包含关联数据
    const newApprovalFlow = await ApprovalFlow.findByPk(approvalFlow.id, {
      include: [
        {
          model: ApprovalType,
          as: 'approvalType',
          attributes: ['id', 'name', 'code']
        }
      ]
    })

    res.status(201).json(successResponse(newApprovalFlow, '创建审批流程成功'))
  } catch (error) {
    if (
      error.name === 'SequelizeValidationError' ||
      error.name === 'SequelizeUniqueConstraintError' ||
      error.name === 'SequelizeForeignKeyConstraintError'
    ) {
      return res.status(400).json(dbErrorResponse(error))
    }
    next(error)
  }
}

// 更新审批流程
const updateApprovalFlow = async (req, res, next) => {
  try {
    const { id } = req.params
    const { type_id, name, description, steps, status } = req.body

    const approvalFlow = await ApprovalFlow.findByPk(id)
    if (!approvalFlow) {
      throw new NotFoundError('审批流程不存在', 'ApprovalFlow')
    }

    // 如果更新审批类型，验证类型是否存在
    if (type_id && type_id !== approvalFlow.type_id) {
      const approvalType = await ApprovalType.findByPk(type_id)
      if (!approvalType) {
        throw new NotFoundError('审批类型不存在', 'ApprovalType')
      }
    }

    // 如果更新步骤，验证步骤配置
    if (steps) {
      if (!Array.isArray(steps) || steps.length === 0) {
        throw new ValidationError('审批步骤不能为空', 'steps')
      }

      // 验证步骤编号是否连续
      const stepNumbers = steps.map(s => s.step).sort((a, b) => a - b)
      for (let i = 0; i < stepNumbers.length; i++) {
        if (stepNumbers[i] !== i + 1) {
          throw new ValidationError('审批步骤编号必须从1开始连续递增', 'steps')
        }
      }
    }

    await approvalFlow.update({
      type_id: type_id || approvalFlow.type_id,
      name: name || approvalFlow.name,
      description:
        description !== undefined ? description : approvalFlow.description,
      steps: steps || approvalFlow.steps,
      status: status !== undefined ? status : approvalFlow.status
    })

    // 重新查询以包含关联数据
    const updatedApprovalFlow = await ApprovalFlow.findByPk(id, {
      include: [
        {
          model: ApprovalType,
          as: 'approvalType',
          attributes: ['id', 'name', 'code']
        }
      ]
    })

    res.json(successResponse(updatedApprovalFlow, '更新审批流程成功'))
  } catch (error) {
    if (
      error.name === 'SequelizeValidationError' ||
      error.name === 'SequelizeUniqueConstraintError' ||
      error.name === 'SequelizeForeignKeyConstraintError'
    ) {
      return res.status(400).json(dbErrorResponse(error))
    }
    next(error)
  }
}

// 删除审批流程
const deleteApprovalFlow = async (req, res, next) => {
  try {
    const { id } = req.params

    const approvalFlow = await ApprovalFlow.findByPk(id)
    if (!approvalFlow) {
      throw new NotFoundError('审批流程不存在', 'ApprovalFlow')
    }

    // 检查是否有审批申请使用此流程
    const { Approval } = require('../models')
    const approvalCount = await Approval.count({
      where: { flow_id: id }
    })

    if (approvalCount > 0) {
      throw new BusinessError('该审批流程正在被使用，无法删除', 'FLOW_IN_USE')
    }

    await approvalFlow.destroy()

    res.json(successResponse(null, '删除审批流程成功'))
  } catch (error) {
    next(error)
  }
}

// 获取流程的审批人配置
const getFlowApprovers = async (req, res, next) => {
  try {
    const { flowId } = req.params

    const approvalFlow = await ApprovalFlow.findByPk(flowId)
    if (!approvalFlow) {
      throw new NotFoundError('审批流程不存在', 'ApprovalFlow')
    }

    const approvers = await ApprovalApprover.findAll({
      where: { flow_id: flowId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'real_name', 'email', 'phone']
        }
      ],
      order: [['step', 'ASC']]
    })

    res.json(successResponse(approvers, '获取流程审批人配置成功'))
  } catch (error) {
    next(error)
  }
}

// 配置流程审批人
const setFlowApprovers = async (req, res, next) => {
  try {
    const { flowId } = req.params
    const { approvers } = req.body

    const approvalFlow = await ApprovalFlow.findByPk(flowId)
    if (!approvalFlow) {
      throw new NotFoundError('审批流程不存在', 'ApprovalFlow')
    }

    // 验证审批人数据
    if (!Array.isArray(approvers) || approvers.length === 0) {
      throw new ValidationError('审批人配置不能为空', 'approvers')
    }

    // 验证用户是否存在
    const userIds = approvers.map(a => a.user_id)
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id']
    })

    if (users.length !== userIds.length) {
      throw new NotFoundError('部分用户不存在', 'User')
    }

    // 删除现有配置
    await ApprovalApprover.destroy({
      where: { flow_id: flowId }
    })

    // 创建新配置
    const approverData = approvers.map(approver => ({
      flow_id: flowId,
      user_id: approver.user_id,
      step: approver.step,
      is_required: approver.is_required !== false // 默认为必需
    }))

    await ApprovalApprover.bulkCreate(approverData)

    // 重新查询配置
    const newApprovers = await ApprovalApprover.findAll({
      where: { flow_id: flowId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'real_name', 'email', 'phone']
        }
      ],
      order: [['step', 'ASC']]
    })

    res.json(successResponse(newApprovers, '配置流程审批人成功'))
  } catch (error) {
    if (
      error.name === 'SequelizeValidationError' ||
      error.name === 'SequelizeUniqueConstraintError' ||
      error.name === 'SequelizeForeignKeyConstraintError'
    ) {
      return res.status(400).json(dbErrorResponse(error))
    }
    next(error)
  }
}

module.exports = {
  getApprovalFlows,
  getApprovalFlowById,
  createApprovalFlow,
  updateApprovalFlow,
  deleteApprovalFlow,
  getFlowApprovers,
  setFlowApprovers
}
