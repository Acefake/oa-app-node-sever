// 自定义错误类
class CustomError extends Error {
    constructor(message, statusCode = 400, code = null, details = null) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.code = code
        this.details = details
        Error.captureStackTrace(this, this.constructor)
    }
}

// 业务逻辑错误
class BusinessError extends CustomError {
    constructor(message, code = null, details = null) {
        super(message, 400, code, details)
        this.name = 'BusinessError'
    }
}

// 权限错误
class ForbiddenError extends CustomError {
    constructor(
        message = '权限不足',
        code = 'INSUFFICIENT_PERMISSIONS',
        details = null
    ) {
        super(message, 403, code, details)
        this.name = 'ForbiddenError'
    }
}

// 资源不存在错误
class NotFoundError extends CustomError {
    constructor(message = '资源不存在', resource = null, details = null) {
        super(message, 404, 'RESOURCE_NOT_FOUND', details)
        this.name = 'NotFoundError'
        this.resource = resource
    }
}

// 参数验证错误
class ValidationError extends CustomError {
    constructor(message, field = null, value = null, details = null) {
        super(message, 400, 'VALIDATION_ERROR', details)
        this.name = 'ValidationError'
        this.field = field
        this.value = value
    }
}

// 数据库操作错误
class DatabaseError extends CustomError {
    constructor(message, operation = null, details = null) {
        super(message, 500, 'DATABASE_ERROR', details)
        this.name = 'DatabaseError'
        this.operation = operation
    }
}

module.exports = {
    CustomError,
    BusinessError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
    DatabaseError,
}
