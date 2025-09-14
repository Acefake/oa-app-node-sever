const { sequelize } = require('../models')
const logger = require('../utils/logger')

// 数据库初始化
async function initDatabase() {
    try {
        // 测试数据库连接
        await sequelize.authenticate()
        logger.info('数据库连接成功')

        // 同步数据库模型（创建表）
        await sequelize.sync({ force: false })
        logger.info('数据库表同步完成')

        // 关闭数据库连接
        await sequelize.close()
        logger.info('数据库连接已关闭')
    } catch (error) {
        logger.error('数据库初始化失败', error)
        process.exit(1)
    }
}

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
    initDatabase()
}

module.exports = initDatabase
