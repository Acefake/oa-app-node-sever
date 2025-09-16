import { Request, Response, NextFunction } from 'express'
import { Notice, NoticeType } from '../models/Notice'
import { User } from '../models/User'
import { AppError } from '../middleware/errorHandler'

// 创建通知
export const createNotice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { receiverId, content, type } = req.body
    const senderId = req.user?.id

    // 验证接收人是否存在
    const receiver = await User.findByPk(receiverId)
    if (!receiver) {
      throw new AppError('指定的接收人不存在', 400)
    }

    const notice = await Notice.create({
      receiverId,
      content,
      type: Number(type) || NoticeType.SYSTEM,
      senderId: type === NoticeType.SYSTEM ? undefined : senderId,
      isRead: false
    })

    // 包含关联数据返回
    const noticeWithRelations = await Notice.findByPk(notice.id, {
      include: [
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    res.status(201).json({
      code: 200,
      msg: '通知发送成功',
      data: noticeWithRelations?.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 获取通知列表
export const getNotices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, type, isRead } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const userId = req.user?.id

    // 构建查询条件
    const where: any = { receiverId: userId }
    if (type !== undefined) {
      where.type = Number(type)
    }
    if (isRead !== undefined) {
      where.isRead = isRead === 'true'
    }

    const { count, rows: notices } = await Notice.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createTime', 'DESC']],
      include: [
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        notices: notices.map(notice => notice.toJSON()),
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

// 获取通知详情
export const getNoticeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const notice = await Notice.findByPk(Number(id), {
      include: [
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'realName']
        }
      ]
    })

    if (!notice) {
      throw new AppError('通知不存在', 404)
    }

    // 只有接收人可以查看通知
    if (notice.receiverId !== userId) {
      throw new AppError('无权限查看此通知', 403)
    }

    res.json({
      code: 200,
      msg: '获取成功',
      data: notice.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 标记通知为已读
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const notice = await Notice.findByPk(Number(id))
    if (!notice) {
      throw new AppError('通知不存在', 404)
    }

    // 只有接收人可以标记为已读
    if (notice.receiverId !== userId) {
      throw new AppError('无权限操作此通知', 403)
    }

    await notice.update({ isRead: true })

    res.json({
      code: 200,
      msg: '通知已标记为已读',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

// 批量标记为已读
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id

    await Notice.update(
      { isRead: true },
      {
        where: {
          receiverId: userId,
          isRead: false
        }
      }
    )

    res.json({
      code: 200,
      msg: '所有通知已标记为已读',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

// 删除通知
export const deleteNotice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const notice = await Notice.findByPk(Number(id))
    if (!notice) {
      throw new AppError('通知不存在', 404)
    }

    // 只有接收人可以删除通知
    if (notice.receiverId !== userId) {
      throw new AppError('无权限删除此通知', 403)
    }

    await notice.destroy()

    res.json({
      code: 200,
      msg: '通知删除成功',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

// 获取未读通知数量
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id

    const count = await Notice.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    })

    res.json({
      code: 200,
      msg: '获取成功',
      data: { unreadCount: count }
    })
  } catch (error) {
    next(error)
  }
}
