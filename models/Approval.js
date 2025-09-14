const { DataTypes } = require('sequelize')

module.exports = sequelize => {
    const Approval = sequelize.define(
        'Approval',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '申请ID',
            },
            form_no: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                comment: '表单编号',
            },
            type_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '审批类型ID',
            },
            flow_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '流程ID',
            },
            applicant_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '申请人ID',
            },
            title: {
                type: DataTypes.STRING(200),
                allowNull: false,
                comment: '申请标题',
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
                comment: '申请内容',
            },
            form_data: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: '表单数据（JSON格式）',
            },
            status: {
                type: DataTypes.TINYINT(2),
                defaultValue: 0,
                comment: '状态：0-待审批，1-审批中，2-已通过，3-已拒绝，4-已撤回',
            },
            current_step: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
                comment: '当前步骤',
            },
            total_steps: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
                comment: '总步骤数',
            },
            priority: {
                type: DataTypes.TINYINT(1),
                defaultValue: 1,
                comment: '优先级：1-低，2-中，3-高，4-紧急',
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
            completed_at: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: '完成时间',
            },
        },
        {
            tableName: 'approval_applications',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            comment: '审批申请表',
        }
    )

    // 定义关联关系
    Approval.associate = models => {
        // 审批申请属于一个审批类型
        Approval.belongsTo(models.ApprovalType, {
            foreignKey: 'type_id',
            as: 'approvalType',
        })

        // 审批申请属于一个审批流程
        Approval.belongsTo(models.ApprovalFlow, {
            foreignKey: 'flow_id',
            as: 'approvalFlow',
        })

        // 审批申请属于一个申请人
        Approval.belongsTo(models.User, {
            foreignKey: 'applicant_id',
            as: 'applicant',
        })

        // 审批申请可以有多个审批记录
        Approval.hasMany(models.ApprovalRecord, {
            foreignKey: 'application_id',
            as: 'approvalRecords',
        })
    }

    return Approval
}