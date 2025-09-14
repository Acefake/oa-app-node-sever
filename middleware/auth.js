const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { ValidationError } = require('../utils/customErrors')
const logger = require('../utils/logger')

// JWT认证中间件
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '')

        if (!token) {
            throw new ValidationError('访问令牌不能为空', 'token')
        }

        // 验证JWT令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
        
        // 查找用户
        const user = await User.findByPk(decoded.userId)
        if (!user) {
            throw new ValidationError('用户不存在', 'user')
        }

        // 将用户信息添加到请求对象
        req.user = user
        next()
    } catch (error) {
        logger.error('认证失败', {
            error: error.message,
            url: req.url,
            method: req.method,
        })
        next(error)
    }
}

// 可选认证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '')

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
            const user = await User.findByPk(decoded.userId)
            if (user) {
                req.user = user
            }
        }

        next()
    } catch (error) {
        // 可选认证失败时不抛出错误，继续执行
        next()
    }
}

module.exports = {
    authenticate,
    optionalAuth,
}