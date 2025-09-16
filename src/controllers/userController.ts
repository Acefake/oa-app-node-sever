import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User'
import { generateToken } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

// 用户注册
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password, realName, phone } = req.body

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      throw new AppError('用户名已存在', 400)
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      realName,
      phone
    })

    res.status(201).json({
      code: 200,
      msg: '注册成功',
      data: user.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 用户登录
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password } = req.body

    // 查找用户
    const user = await User.findOne({ where: { username } })
    if (!user) {
      throw new AppError('用户名或密码错误', 401)
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AppError('用户名或密码错误', 401)
    }

    // 生成JWT令牌
    const token = generateToken({
      id: user.id,
      username: user.username,
      realName: user.realName
    })

    // 设置HttpOnly Cookie存储JWT令牌
    res.cookie('token', token, {
      httpOnly: true, // 防止XSS攻击
      secure: process.env.NODE_ENV === 'production', // 生产环境使用HTTPS
      sameSite: 'strict', // 防止CSRF攻击
      maxAge: 24 * 60 * 60 * 1000 // 24小时过期
    })

    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        user: user.toJSON()
        // 不再在响应体中返回token，因为已经存储在Cookie中
      }
    })
  } catch (error) {
    next(error)
  }
}

// 用户登出
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 清除Cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    res.json({
      code: 200,
      msg: '登出成功',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

// 获取用户信息
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id

    const user = await User.findByPk(userId)
    if (!user) {
      throw new AppError('用户不存在', 404)
    }

    res.json({
      code: 200,
      msg: '获取成功',
      data: user.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 更新用户信息
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id
    const { realName, phone } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      throw new AppError('用户不存在', 404)
    }

    await user.update({ realName, phone })

    res.json({
      code: 200,
      msg: '更新成功',
      data: user.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 修改密码
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id
    const { oldPassword, newPassword } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      throw new AppError('用户不存在', 404)
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isOldPasswordValid) {
      throw new AppError('旧密码错误', 400)
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    await user.update({ password: hashedNewPassword })

    res.json({
      code: 200,
      msg: '密码修改成功',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

// 获取用户列表（管理员功能）
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.findAll({
      order: [['createTime', 'DESC']]
    })

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        list: users
          .map(user => user.toJSON())
          .filter(item => item.id !== req.user?.id)
      }
    })
  } catch (error) {
    next(error)
  }
}
