import { Request, Response, NextFunction } from 'express'
import { Task, TaskStatus } from '../models/Task'
import { User } from '../models/User'
import { AppError } from '../middleware/errorHandler'
import { Notice, NoticeType } from '../models/Notice'
import { createApproval } from './approvalController'
import { ApprovalStatus } from '../models/Approval'

// 创建任务
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, content, assigneeId } = req.body
    const creatorId = req.user?.id

    // 验证负责人是否存在
    const assignee = await User.findByPk(assigneeId)
    if (!assignee) {
      throw new AppError('指定的负责人不存在', 400)
    }

    const task = await Task.create({
      title,
      content,
      creatorId: creatorId!,
      assigneeId,
      status: TaskStatus.NOT_STARTED
    })

    // 包含关联数据返回
    const taskWithRelations = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    if (assigneeId) {
      await createApproval(req, res, next)
    }

    res.status(201).json({
      code: 200,
      msg: '任务创建成功',
      data: taskWithRelations?.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 获取任务列表
export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, assigneeId, creatorId } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const userId = req.user?.id

    // 构建查询条件
    const where: any = {}
    if (status !== undefined) {
      where.status = Number(status)
    }
    if (assigneeId) {
      where.assigneeId = Number(assigneeId)
    }
    if (creatorId) {
      where.creatorId = Number(creatorId)
    } else {
      where.creatorId = userId
    }

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createTime', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        tasks: tasks.map(task => task.toJSON()),
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

// 获取任务详情
export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const task = await Task.findByPk(Number(id), {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    if (!task) {
      throw new AppError('任务不存在', 404)
    }

    res.json({
      code: 200,
      msg: '获取成功',
      data: task.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 更新任务
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { title, content, assigneeId, deadline, status } = req.body

    const task = await Task.findByPk(Number(id))
    if (!task) {
      throw new AppError('任务不存在', 404)
    }

    // 只有创建者或负责人可以更新任务
    const userId = req.user?.id
    if (task.creatorId !== userId && task.assigneeId !== userId) {
      throw new AppError('无权限修改此任务', 403)
    }

    // 如果更新负责人，验证新负责人是否存在
    if (assigneeId && assigneeId !== task.assigneeId) {
      const assignee = await User.findByPk(assigneeId)
      if (!assignee) {
        throw new AppError('指定的负责人不存在', 400)
      }
    }

    await task.update({
      title,
      content,
      assigneeId,
      deadline: deadline ? new Date(deadline) : undefined,
      status
    })

    // 重新获取包含关联数据的任务
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    res.json({
      code: 200,
      msg: '任务更新成功',
      data: updatedTask?.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 删除任务
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const task = await Task.findByPk(Number(id))
    if (!task) {
      throw new AppError('任务不存在', 404)
    }

    // 只有创建者可以删除任务
    const userId = req.user?.id
    if (task.creatorId !== userId) {
      throw new AppError('无权限删除此任务', 403)
    }

    await task.destroy()

    res.json({
      code: 200,
      msg: '任务删除成功',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

// 更新任务状态
export const updateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    const task = await Task.findByPk(Number(id))
    if (!task) {
      throw new AppError('任务不存在', 404)
    }

    // 只有负责人可以更新任务状态
    const userId = req.user?.id
    if (task.assigneeId !== userId) {
      throw new AppError('无权限更新此任务状态', 403)
    }

    // 验证状态值
    if (!Object.values(TaskStatus).includes(Number(status))) {
      throw new AppError('无效的任务状态', 400)
    }

    await task.update({ status: Number(status) })

    res.json({
      code: 200,
      msg: '任务状态更新成功',
      data: task.toJSON()
    })
  } catch (error) {
    next(error)
  }
}
