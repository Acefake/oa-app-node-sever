const { SystemConfig } = require('../models')
const { successResponse } = require('../utils/helpers')
const { ValidationError, NotFoundError } = require('../utils/customErrors')
const logger = require('../utils/logger')

class SystemConfigController {
    // 获取系统配置
    async getSystemConfigs(req, res, next) {
        try {
            const configs = await SystemConfig.findAll({
                order: [['created_at', 'ASC']],
            })

            res.json(successResponse(configs, '获取成功'))
        } catch (error) {
            logger.error('获取系统配置失败', error)
            next(error)
        }
    }

    // 更新系统配置
    async updateSystemConfig(req, res, next) {
        try {
            const { key } = req.params
            const { config_value } = req.body

            if (!key) {
                throw new ValidationError('配置键不能为空', 'key')
            }

            if (config_value === undefined) {
                throw new ValidationError('配置值不能为空', 'config_value')
            }

            const config = await SystemConfig.findOne({
                where: { config_key: key }
            })

            if (!config) {
                throw new NotFoundError('配置不存在', 'SystemConfig', {
                    configKey: key,
                })
            }

            await config.update({
                config_value,
            })

            logger.info('更新系统配置成功', {
                configKey: key,
                configValue: config_value,
            })

            res.json(successResponse(config, '更新成功'))
        } catch (error) {
            logger.error('更新系统配置失败', {
                error: error.message,
                stack: error.stack,
                params: req.params,
                body: req.body,
            })
            next(error)
        }
    }

    // 根据键获取配置
    async getSystemConfigByKey(req, res, next) {
        try {
            const { key } = req.params

            if (!key) {
                throw new ValidationError('配置键不能为空', 'key')
            }

            const config = await SystemConfig.findOne({
                where: { config_key: key }
            })

            if (!config) {
                throw new NotFoundError('配置不存在', 'SystemConfig', {
                    configKey: key,
                })
            }

            res.json(successResponse(config, '获取成功'))
        } catch (error) {
            logger.error('获取系统配置失败', {
                error: error.message,
                stack: error.stack,
                params: req.params,
            })
            next(error)
        }
    }
}

module.exports = new SystemConfigController()
