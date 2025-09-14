const { body, param, query, validationResult } = require('express-validator')
const { ValidationError } = require('../utils/customErrors')

// 验证结果处理中间件
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value,
        }))
        
        throw new ValidationError('参数验证失败', 'VALIDATION_ERROR', {
            errors: errorMessages,
        })
    }
    next()
}

// 用户相关验证规则
const validateUser = {
    create: [
        body('real_name')
            .notEmpty()
            .withMessage('真实姓名不能为空')
            .isLength({ min: 2, max: 50 })
            .withMessage('真实姓名长度必须在2-50个字符之间'),
        body('email')
            .optional()
            .isEmail()
            .withMessage('邮箱格式不正确'),
        body('phone')
            .optional()
            .isMobilePhone('zh-CN')
            .withMessage('手机号格式不正确'),
        handleValidationErrors,
    ],
    update: [
        body('real_name')
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage('真实姓名长度必须在2-50个字符之间'),
        body('email')
            .optional()
            .isEmail()
            .withMessage('邮箱格式不正确'),
        body('phone')
            .optional()
            .isMobilePhone('zh-CN')
            .withMessage('手机号格式不正确'),
        handleValidationErrors,
    ],
    id: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('用户ID必须是正整数'),
        handleValidationErrors,
    ],
}

// 审批流程相关验证规则
const validateApprovalFlow = {
    create: [
        body('type_id')
            .isInt({ min: 1 })
            .withMessage('审批类型ID必须是正整数'),
        body('name')
            .notEmpty()
            .withMessage('流程名称不能为空')
            .isLength({ min: 2, max: 100 })
            .withMessage('流程名称长度必须在2-100个字符之间'),
        body('description')
            .optional()
            .isLength({ max: 500 })
            .withMessage('流程描述长度不能超过500个字符'),
        body('steps')
            .isArray({ min: 1 })
            .withMessage('审批步骤不能为空且必须为数组'),
        body('steps.*.step')
            .isInt({ min: 1 })
            .withMessage('步骤编号必须是正整数'),
        body('steps.*.name')
            .notEmpty()
            .withMessage('步骤名称不能为空'),
        body('steps.*.is_required')
            .isBoolean()
            .withMessage('是否必须字段必须是布尔值'),
        handleValidationErrors,
    ],
    update: [
        body('type_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('审批类型ID必须是正整数'),
        body('name')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('流程名称长度必须在2-100个字符之间'),
        body('description')
            .optional()
            .isLength({ max: 500 })
            .withMessage('流程描述长度不能超过500个字符'),
        body('steps')
            .optional()
            .isArray({ min: 1 })
            .withMessage('审批步骤必须为数组'),
        body('status')
            .optional()
            .isIn([0, 1])
            .withMessage('状态值必须是0或1'),
        handleValidationErrors,
    ],
    id: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('流程ID必须是正整数'),
        handleValidationErrors,
    ],
    flowId: [
        param('flowId')
            .isInt({ min: 1 })
            .withMessage('流程ID必须是正整数'),
        handleValidationErrors,
    ],
    approvers: [
        body('approvers')
            .isArray({ min: 1 })
            .withMessage('审批人配置不能为空且必须为数组'),
        body('approvers.*.step')
            .isInt({ min: 1 })
            .withMessage('步骤编号必须是正整数'),
        body('approvers.*.approver_id')
            .isInt({ min: 1 })
            .withMessage('审批人ID必须是正整数'),
        body('approvers.*.is_required')
            .optional()
            .isBoolean()
            .withMessage('是否必须字段必须是布尔值'),
        handleValidationErrors,
    ],
}

// 审批申请相关验证规则
const validateApproval = {
    create: [
        body('flow_id')
            .isInt({ min: 1 })
            .withMessage('流程ID必须是正整数'),
        body('title')
            .notEmpty()
            .withMessage('申请标题不能为空')
            .isLength({ min: 2, max: 200 })
            .withMessage('申请标题长度必须在2-200个字符之间'),
        body('content')
            .notEmpty()
            .withMessage('申请内容不能为空'),
        body('priority')
            .optional()
            .isIn([1, 2, 3, 4])
            .withMessage('优先级必须是1-4之间的整数'),
        body('form_data')
            .optional()
            .isObject()
            .withMessage('表单数据必须是对象'),
        handleValidationErrors,
    ],
    id: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('申请ID必须是正整数'),
        handleValidationErrors,
    ],
    approve: [
        body('action')
            .isIn([0, 1])
            .withMessage('审批动作必须是0（通过）或1（拒绝）'),
        body('comment')
            .optional()
            .isLength({ max: 500 })
            .withMessage('审批意见长度不能超过500个字符'),
        handleValidationErrors,
    ],
    query: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('页码必须是正整数'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('每页数量必须是1-100之间的整数'),
        query('status')
            .optional()
            .isIn([0, 1, 2, 3, 4])
            .withMessage('状态值必须是0-4之间的整数'),
        query('priority')
            .optional()
            .isIn([1, 2, 3, 4])
            .withMessage('优先级必须是1-4之间的整数'),
        handleValidationErrors,
    ],
}

// 系统配置相关验证规则
const validateSystemConfig = {
    key: [
        param('key')
            .notEmpty()
            .withMessage('配置键不能为空')
            .isLength({ min: 1, max: 100 })
            .withMessage('配置键长度必须在1-100个字符之间'),
        handleValidationErrors,
    ],
    update: [
        body('config_value')
            .notEmpty()
            .withMessage('配置值不能为空'),
        handleValidationErrors,
    ],
}

module.exports = {
    validateUser,
    validateApprovalFlow,
    validateApproval,
    validateSystemConfig,
    handleValidationErrors,
}