const { DataTypes } = require('sequelize')

module.exports = sequelize => {
    const ApprovalRecord = sequelize.define(
        'ApprovalRecord',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '记录ID',
            },
            application_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '申请ID',
            },
            step: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '审批步骤',
            },
            approver_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '审批人ID',
            },
            action: {
                type: DataTypes.TINYINT(2),
                allowNull: false,
                comment: '操作：0-通过，1-拒绝',
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: '审批意见',
            },
            form_data: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: '审批时的表单数据',
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                comment: '创建时间',
            },
        },
        {
            tableName: 'approval_records',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
            comment: '审批记录表',
        }
    )

    // 定义关联关系
    ApprovalRecord.associate = models => {
        // 审批记录属于一个审批申请
        ApprovalRecord.belongsTo(models.Approval, {
            foreignKey: 'application_id',
            as: 'approval',
        })

        // 审批记录属于一个审批人
        ApprovalRecord.belongsTo(models.User, {
            foreignKey: 'approver_id',
            as: 'approver',
        })
    }

    return ApprovalRecord
}