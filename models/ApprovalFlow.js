const { DataTypes } = require('sequelize')

module.exports = sequelize => {
  const ApprovalFlow = sequelize.define(
    'ApprovalFlow',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '流程ID'
      },
      type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '审批类型ID'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '流程名称'
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '流程描述'
      },
      steps: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '审批步骤配置（JSON格式）'
      },
      status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 1,
        comment: '状态：1-正常，0-禁用'
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: '创建时间'
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: '更新时间'
      }
    },
    {
      tableName: 'approval_flows',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      comment: '审批流程表'
    }
  )

  // 定义关联关系
  ApprovalFlow.associate = models => {
    // 审批流程属于一个审批类型
    ApprovalFlow.belongsTo(models.ApprovalType, {
      foreignKey: 'type_id',
      as: 'approvalType'
    })

    // 审批流程可以有多个审批申请
    ApprovalFlow.hasMany(models.Approval, {
      foreignKey: 'flow_id',
      as: 'approvals'
    })

    // 审批流程可以有多个审批人配置
    ApprovalFlow.hasMany(models.ApprovalApprover, {
      foreignKey: 'flow_id',
      as: 'approvers'
    })

    // 审批流程与用户的多对多关系（通过审批人配置）
    ApprovalFlow.belongsToMany(models.User, {
      through: models.ApprovalApprover,
      foreignKey: 'flow_id',
      as: 'approverUsers'
    })
  }

  return ApprovalFlow
}
