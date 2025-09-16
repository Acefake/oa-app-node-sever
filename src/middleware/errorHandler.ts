import { Request, Response, NextFunction } from 'express'

// 自定义错误类
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// 错误处理中间件
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err }
  error.message = err.message

  // 记录错误日志
  console.error(err)

  // Sequelize验证错误
  if (err.name === 'SequelizeValidationError') {
    const message = '数据验证失败'
    error = new AppError(message, 400)
  }

  // Sequelize唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = '数据已存在'
    error = new AppError(message, 400)
  }

  // Sequelize外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = '关联数据不存在'
    error = new AppError(message, 400)
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的访问令牌'
    error = new AppError(message, 401)
  }

  if (err.name === 'TokenExpiredError') {
    const message = '访问令牌已过期'
    error = new AppError(message, 401)
  }

  res.status((error as AppError).statusCode || 500).json({
    code: (error as AppError).statusCode || 500,
    msg: error.message || '服务器内部错误',
    data: null
  })
}

// 404处理中间件
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`未找到路径 ${req.originalUrl}`, 404)
  next(error)
}
