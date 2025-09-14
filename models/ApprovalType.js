const { DataTypes } = require('sequelize')

module.exports = sequelize => {
    const ApprovalType = sequelize.define(
        'ApprovalType',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '审批类型ID',
            },
            type_name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                comment: '类型名称',
            },
            description: {
                type: DataTypes.STRING(200),
                allowNull: true,
                comment: '类型描述',
            },
            icon: {
                type: DataTypes.STRING(100),
                allowNull: true,
                comment: '图标',
            },
            color: {
                type: DataTypes.STRING(20),
                allowNull: true,
                comment: '颜色',
            },
            status: {
                type: DataTypes.TINYINT(1),
                defaultValue: 1,
                comment: '状态：1-正常，0-禁用',
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                comment: '创建时间',
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                comment: '更新时间',
            },
        },
        {
            tableName: 'approval_types',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            comment: '审批类型表',
        }
    )

    // 定义关联关系
    ApprovalType.associate = models => {
        // 审批类型可以有多个审批流程
        ApprovalType.hasMany(models.ApprovalFlow, {
            foreignKey: 'type_id',
            as: 'approvalFlows',
        })

        // 审批类型可以有多个审批申请
        ApprovalType.hasMany(models.Approval, {
            foreignKey: 'type_id',
            as: 'approvals',
        })
    }

    return ApprovalType
}
