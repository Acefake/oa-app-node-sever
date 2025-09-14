const { DataTypes } = require('sequelize')

module.exports = sequelize => {
    const ApprovalApprover = sequelize.define(
        'ApprovalApprover',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: 'ID',
            },
            flow_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '流程ID',
            },
            step: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '步骤',
            },
            approver_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '审批人用户ID',
            },
            is_required: {
                type: DataTypes.TINYINT(1),
                defaultValue: 1,
                comment: '是否必须：1-必须，0-可选',
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                comment: '创建时间',
            },
        },
        {
            tableName: 'approval_approvers',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
            comment: '审批人配置表',
        }
    )

    // 定义关联关系
    ApprovalApprover.associate = models => {
        // 审批人配置属于一个审批流程
        ApprovalApprover.belongsTo(models.ApprovalFlow, {
            foreignKey: 'flow_id',
            as: 'approvalFlow',
        })

        // 审批人配置属于一个用户
        ApprovalApprover.belongsTo(models.User, {
            foreignKey: 'approver_id',
            as: 'approver',
        })
    }

    return ApprovalApprover
}
