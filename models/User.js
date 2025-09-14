const { DataTypes } = require('sequelize')

module.exports = sequelize => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '用户ID',
            },
            real_name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                comment: '真实姓名',
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: true,
                comment: '邮箱',
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
                comment: '手机号',
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                comment: '创建时间',
            },
        },
        {
            tableName: 'users',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
            comment: '用户表',
        }
    )

    // 定义关联关系
    User.associate = models => {
        // 用户可以有多个审批申请
        User.hasMany(models.Approval, {
            foreignKey: 'applicant_id',
            as: 'approvals',
        })

        // 用户可以有多个审批记录
        User.hasMany(models.ApprovalRecord, {
            foreignKey: 'approver_id',
            as: 'approvalRecords',
        })

        // 用户可以有多个操作日志
        User.hasMany(models.OperationLog, {
            foreignKey: 'user_id',
            as: 'operationLogs',
        })

        // 用户可以是多个流程的审批人
        User.belongsToMany(models.ApprovalFlow, {
            through: models.ApprovalApprover,
            foreignKey: 'approver_id',
            as: 'approvalFlows',
        })
    }

    return User
}
