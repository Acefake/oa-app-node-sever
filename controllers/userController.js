const { User } = require('../models')
const { Op } = require('sequelize')
const { successResponse, errorResponse, paginate } = require('../utils/helpers')
const {
    ValidationError,
    NotFoundError,
    BusinessError,
} = require('../utils/customErrors')
const logger = require('../utils/logger')

class UserController {
    // 获取所有用户
    async getUsers(req, res, next) {
        try {
            const { page = 1, limit = 10, keyword = '' } = req.query
            const { offset, limit: limitNum } = paginate(page, limit)

            const where = {}
            if (keyword) {
                where[Op.or] = [
                    { real_name: { [Op.like]: `%${keyword}%` } },
                    { email: { [Op.like]: `%${keyword}%` } },
                ]
            }

            const { count, rows } = await User.findAndCountAll({
                where,
                offset,
                limit: limitNum,
                order: [['created_at', 'DESC']],
            })

            res.json(
                successResponse(
                    {
                        list: rows,
                        total: count,
                        page: parseInt(page),
                        limit: limitNum,
                        total_pages: Math.ceil(count / limitNum),
                    },
                    '获取成功'
                )
            )
        } catch (error) {
            logger.error('获取用户列表失败', error)
            next(error)
        }
    }

    // 根据ID获取用户
    async getUserById(req, res, next) {
        try {
            const { id } = req.params

            if (!id) {
                throw new ValidationError('用户ID不能为空', 'id')
            }

            const user = await User.findByPk(id)

            if (!user) {
                throw new NotFoundError('用户不存在', 'User', {
                    userId: id,
                })
            }

            res.json(successResponse(user, '获取成功'))
        } catch (error) {
            logger.error('获取用户详情失败', {
                error: error.message,
                stack: error.stack,
                params: req.params,
            })
            next(error)
        }
    }

    // 创建用户
    async createUser(req, res, next) {
        try {
            const { real_name, email, phone } = req.body

            // 参数验证
            if (!real_name) {
                throw new ValidationError('真实姓名不能为空', 'real_name')
            }

            // 检查邮箱是否已存在（如果提供了邮箱）
            if (email) {
                const existingEmail = await User.findOne({
                    where: { email },
                })
                if (existingEmail) {
                    throw new BusinessError('邮箱已被使用', 'EMAIL_EXISTS', {
                        field: 'email',
                        value: email,
                    })
                }
            }

            const user = await User.create({
                real_name,
                email,
                phone,
            })

            logger.info('创建用户成功', {
                userId: user.id,
                realName: user.real_name,
            })

            res.status(201).json(successResponse(user, '创建用户成功'))
        } catch (error) {
            logger.error('创建用户失败', {
                error: error.message,
                stack: error.stack,
                body: req.body,
            })
            next(error)
        }
    }

    // 更新用户
    async updateUser(req, res, next) {
        try {
            const { id } = req.params
            const { real_name, email, phone } = req.body

            const user = await User.findByPk(id)
            if (!user) {
                throw new NotFoundError('用户不存在', 'User', { userId: id })
            }

            // 检查邮箱是否已被其他用户使用
            if (email && email !== user.email) {
                const existingEmail = await User.findOne({
                    where: { email, id: { [Op.ne]: id } },
                })
                if (existingEmail) {
                    throw new BusinessError('邮箱已被使用', 'EMAIL_EXISTS', {
                        field: 'email',
                        value: email,
                    })
                }
            }

            await user.update({
                real_name,
                email,
                phone,
            })

            logger.info('更新用户成功', { userId: id })

            res.json(successResponse(user, '更新用户成功'))
        } catch (error) {
            logger.error('更新用户失败', error)
            next(error)
        }
    }

    // 删除用户
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params

            const user = await User.findByPk(id)
            if (!user) {
                throw new NotFoundError('用户不存在', 'User', { userId: id })
            }

            await user.destroy()

            logger.info('删除用户成功', { userId: id })

            res.json(successResponse(null, '删除用户成功'))
        } catch (error) {
            logger.error('删除用户失败', error)
            next(error)
        }
    }
}

module.exports = new UserController()