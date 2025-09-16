import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        username: string
        realName: string
      }
    }
  }
}

// JWT认证中间件
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 优先从Cookie中获取token，如果没有则从Authorization header获取
  let token = req.cookies?.token

  if (!token) {
    const authHeader = req.headers['authorization']
    token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
  }

  if (!token) {
    res.status(401).json({
      code: 401,
      msg: '访问令牌缺失',
      data: null
    })
    return
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      res.status(403).json({
        code: 403,
        msg: '无效的访问令牌',
        data: null
      })
      return
    }

    req.user = user
    next()
  })
}

// 生成JWT令牌
export const generateToken = (user: {
  id: number
  username: string
  realName: string
}): string => {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
  return jwt.sign(user, jwtSecret, { expiresIn: '24h' })
}
