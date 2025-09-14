const { Sequelize } = require('sequelize')
const config = require('../config/database')

// 创建 Sequelize 实例
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true,
        },
    }
)

// 导入所有模型
const User = require('./User')(sequelize, Sequelize.DataTypes)
const ApprovalType = require('./ApprovalType')(sequelize, Sequelize.DataTypes)
const ApprovalFlow = require('./ApprovalFlow')(sequelize, Sequelize.DataTypes)
const ApprovalApprover = require('./ApprovalApprover')(sequelize, Sequelize.DataTypes)
const Approval = require('./Approval')(sequelize, Sequelize.DataTypes)
const ApprovalRecord = require('./ApprovalRecord')(
    sequelize,
    Sequelize.DataTypes
)
const SystemConfig = require('./SystemConfig')(sequelize, Sequelize.DataTypes)
const OperationLog = require('./OperationLog')(sequelize, Sequelize.DataTypes)

// 定义模型对象
const models = {
    User,
    ApprovalType,
    ApprovalFlow,
    ApprovalApprover,
    Approval,
    ApprovalRecord,
    SystemConfig,
    OperationLog,
    sequelize,
}

// 建立关联关系
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models)
    }
})

// 测试数据库连接
const testConnection = async () => {
    try {
        await sequelize.authenticate()
        console.log('✅ 数据库连接成功')

        // 同步数据库表结构
        await sequelize.sync({ alter: true })
        console.log('✅ 数据库表结构同步完成')
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message)
        process.exit(1)
    }
}

module.exports = {
    ...models,
    testConnection,
}
