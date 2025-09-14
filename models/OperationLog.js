const { DataTypes } = require('sequelize')

module.exports = sequelize => {
    const OperationLog = sequelize.define(
        'OperationLog',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '日志ID',
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: '操作用户ID',
            },
            action: {
                type: DataTypes.STRING(100),
                allowNull: false,
                comment: '操作动作',
            },
            resource: {
                type: DataTypes.STRING(100),
                allowNull: false,
                comment: '操作资源',
            },
            resource_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: '资源ID',
            },
            description: {
                type: DataTypes.STRING(500),
                allowNull: true,
                comment: '操作描述',
            },
            ip_address: {
                type: DataTypes.STRING(45),
                allowNull: true,
                comment: 'IP地址',
            },
            user_agent: {
                type: DataTypes.STRING(500),
                allowNull: true,
                comment: '用户代理',
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                comment: '创建时间',
            },
        },
        {
            tableName: 'operation_logs',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
            comment: '操作日志表',
        }
    )

    // 定义关联关系
    OperationLog.associate = models => {
        // 操作日志属于一个用户
        OperationLog.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        })
    }

    return OperationLog
}