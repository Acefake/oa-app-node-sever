const crypto = require('crypto')

// 生成申请单号
const generateFormNo = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `APP${year}${month}${day}${random}`
}

// 分页处理
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit
  return { offset, limit: parseInt(limit) }
}

// 响应格式化
const responseFormat = (code, success, data = null, message = null) => {
  const response = {
    code,
    data,
    message: message || (success ? '操作成功' : '操作失败'),
    timestamp: Date.now()
  }

  return response
}

// 成功响应
const successResponse = (data = null, message = '操作成功') => {
  return responseFormat(200, true, data, message)
}

// 错误响应
const errorResponse = (message, code = 400, details = null) => {
  return responseFormat(code, false, details, message)
}

// 数据库错误响应
const dbErrorResponse = error => {
  if (error.name === 'SequelizeValidationError') {
    return responseFormat(
      400,
      false,
      {
        type: 'validation_error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        }))
      },
      '数据验证失败'
    )
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return responseFormat(
      400,
      false,
      {
        type: 'unique_constraint_error',
        field: error.errors[0].path,
        value: error.errors[0].value
      },
      `${error.errors[0].path} 已存在`
    )
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return responseFormat(
      400,
      false,
      {
        type: 'foreign_key_error',
        table: error.table,
        field: error.field
      },
      '关联数据不存在'
    )
  }

  if (error.name === 'SequelizeDatabaseError') {
    return responseFormat(
      500,
      false,
      {
        type: 'database_error',
        sql: error.sql
      },
      '数据库操作失败'
    )
  }

  return responseFormat(
    500,
    false,
    {
      type: 'unknown_error',
      message: error.message
    },
    '数据库操作失败'
  )
}

module.exports = {
  generateFormNo,
  paginate,
  responseFormat,
  successResponse,
  errorResponse,
  dbErrorResponse
}
