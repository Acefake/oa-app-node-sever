import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'

// 验证结果处理中间件
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: errors.array()
    })
    return
  }
  next()
}

// 用户注册验证规则
export const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('密码长度必须在6-100个字符之间'),
  body('realName')
    .isLength({ min: 1, max: 20 })
    .withMessage('真实姓名长度必须在1-20个字符之间'),
  body('phone')
    .optional()
    .isMobilePhone('zh-CN')
    .withMessage('请输入有效的手机号码'),
  handleValidationErrors
]

// 用户登录验证规则
export const validateUserLogin = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
  handleValidationErrors
]

// 任务创建验证规则
export const validateTaskCreation = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('任务标题长度必须在1-100个字符之间'),
  body('content')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('任务内容不能超过1000个字符'),
  body('assigneeId').isInt({ min: 1 }).withMessage('负责人ID必须是正整数'),
  body('deadline').optional().isISO8601().withMessage('截止时间格式不正确'),
  handleValidationErrors
]

// 审批创建验证规则
export const validateApprovalCreation = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('审批标题长度必须在1-100个字符之间'),
  body('content')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('审批内容不能超过1000个字符'),
  body('approverId').isInt({ min: 1 }).withMessage('审批人ID必须是正整数'),
  handleValidationErrors
]

// 通知创建验证规则
export const validateNoticeCreation = [
  body('receiverId').isInt({ min: 1 }).withMessage('接收人ID必须是正整数'),
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('通知内容长度必须在1-500个字符之间'),
  body('type').isIn([0, 1, 2]).withMessage('通知类型必须是0、1或2'),
  handleValidationErrors
]
