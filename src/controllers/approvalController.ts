import { Request, Response, NextFunction } from 'express'
import { Op } from 'sequelize'
import { Approval, ApprovalStatus } from '../models/Approval'
import { User } from '../models/User'
import { AppError } from '../middleware/errorHandler'

// 创建审批申请
export const createApproval = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, content, approverId } = req.body

    const applicantId = req.user?.id

    // 验证审批人是否存在
    const approver = await User.findByPk(approverId)
    if (!approver) {
      throw new AppError('指定的审批人不存在', 400)
    }

    // 不能申请给自己审批
    if (applicantId === approverId) {
      throw new AppError('不能申请给自己审批', 400)
    }

    const approval = await Approval.create({
      title,
      content,
      applicantId: applicantId!,
      approverId,
      status: ApprovalStatus.PENDING
    })

    // 包含关联数据返回
    const approvalWithRelations = await Approval.findByPk(approval.id, {
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    res.status(201).json({
      code: 200,
      msg: '审批申请提交成功',
      data: approvalWithRelations?.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 获取待审批列表
export const getApprovals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, type = 'pending' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const userId = req.user?.id
    if (!userId) {
      throw new AppError('用户未登录', 401)
    }

    let whereCondition: any = {}
    let orderBy: any = [['applyTime', 'DESC']]

    // 根据type参数确定查询条件
    switch (type) {
      case '1':
        // 待我审批：我是审批人且状态为待审批
        whereCondition = {
          approverId: userId,
          status: ApprovalStatus.PENDING
        }
        break
      case '2':
        // 我的历史审批：我是审批人且状态不为待审批
        whereCondition = {
          approverId: userId,
          status: {
            [Op.ne]: ApprovalStatus.PENDING
          }
        }
        break
      case '3':
        // 我发起的审批：我是申请人
        whereCondition = {
          applicantId: userId
        }
        break
      default:
        throw new AppError('无效的查询类型', 400)
    }

    const { count, rows: approvals } = await Approval.findAndCountAll({
      where: whereCondition,
      limit: Number(limit),
      offset,
      order: orderBy,
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        list: approvals.map(approval => approval.toJSON()),
        total: count
        // pagination: {
        //   total: count,
        //   page: Number(page),
        //   limit: Number(limit),
        //   pages: Math.ceil(count / Number(limit))
        // },
        // type: type // 返回当前查询类型
      }
    })
  } catch (error) {
    next(error)
  }
}

// 获取审批详情
export const getApprovalById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const approval = await Approval.findByPk(Number(id), {
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    if (!approval) {
      throw new AppError('审批申请不存在', 404)
    }

    res.json({
      code: 200,
      msg: '获取成功',
      data: approval.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 审批处理
export const processApproval = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, status, remark } = req.body
    const approverId = req.user?.id

    const approval = await Approval.findByPk(Number(id))
    if (!approval) {
      throw new AppError('审批申请不存在', 404)
    }

    // 只有指定的审批人可以处理
    if (approval.approverId !== approverId) {
      throw new AppError('无权限处理此审批申请', 403)
    }

    // 只能处理待审批的申请
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new AppError('此审批申请已处理', 400)
    }

    await approval.update({
      status: Number(status),
      approveTime: new Date(),
      remark
    })

    // 重新获取包含关联数据的审批
    const updatedApproval = await Approval.findByPk(approval.id, {
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    res.json({
      code: 200,
      msg: '审批处理成功',
      data: updatedApproval?.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 删除审批申请
export const deleteApproval = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const approval = await Approval.findByPk(Number(id))
    if (!approval) {
      throw new AppError('审批申请不存在', 404)
    }

    // 只有申请人可以删除申请，且只能删除待审批的申请
    const userId = req.user?.id
    if (approval.applicantId !== userId) {
      throw new AppError('无权限删除此审批申请', 403)
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new AppError('只能删除待审批的申请', 400)
    }

    await approval.destroy()

    res.json({
      code: 200,
      msg: '审批申请删除成功',
      data: null
    })
  } catch (error) {
    next(error)
  }
}
