const { errorResponse, dbErrorResponse } = require('../utils/helpers')
const logger = require('../utils/logger')

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
    logger.error('全局错误处理', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
    })

    // Sequelize数据库错误
    if (err.name && err.name.startsWith('Sequelize')) {
        return res.status(400).json(dbErrorResponse(err))
    }

    // JWT错误
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json(
            errorResponse('无效的访问令牌', 401, {
                type: 'jwt_error',
                code: 'INVALID_TOKEN',
            })
        )
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json(
            errorResponse('访问令牌已过期', 401, {
                type: 'jwt_error',
                code: 'TOKEN_EXPIRED',
            })
        )
    }

    // 文件上传错误
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json(
            errorResponse('文件大小超出限制', 400, {
                type: 'file_error',
                code: 'FILE_TOO_LARGE',
                limit: err.limit,
            })
        )
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json(
            errorResponse('文件数量超出限制', 400, {
                type: 'file_error',
                code: 'TOO_MANY_FILES',
                limit: err.limit,
            })
        )
    }

    // 参数验证错误
    if (err.name === 'ValidationError') {
        return res.status(400).json(
            errorResponse('参数验证失败', 400, {
                type: 'validation_error',
                field: err.field,
                value: err.value,
            })
        )
    }

    // 权限错误
    if (err.name === 'ForbiddenError') {
        return res.status(403).json(
            errorResponse('权限不足', 403, {
                type: 'permission_error',
                code: 'INSUFFICIENT_PERMISSIONS',
            })
        )
    }

    // 资源不存在错误
    if (err.name === 'NotFoundError') {
        return res.status(404).json(
            errorResponse('资源不存在', 404, {
                type: 'not_found_error',
                resource: err.resource,
            })
        )
    }

    // 业务逻辑错误
    if (err.name === 'BusinessError') {
        return res.status(400).json(
            errorResponse(err.message, 400, {
                type: 'business_error',
                code: err.code,
            })
        )
    }

    // 默认错误
    const statusCode = err.status || err.statusCode || 500
    res.status(statusCode).json(
        errorResponse(
            err.message || '服务器内部错误',
            statusCode,
            process.env.NODE_ENV === 'development'
                ? {
                      type: 'server_error',
                      stack: err.stack,
                  }
                : null
        )
    )
}

// 404处理中间件
const notFound = (req, res, next) => {
    res.status(404).json(
        errorResponse(`路由 ${req.originalUrl} 不存在`, 404, {
            type: 'not_found_error',
            url: req.originalUrl,
            method: req.method,
        })
    )
}

module.exports = {
    errorHandler,
    notFound,
}
