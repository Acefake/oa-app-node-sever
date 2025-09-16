import { DataTypes, Model, Optional, ModelStatic } from 'sequelize'
import sequelize from '../config/database'

// 扩展ModelStatic接口
interface ModelWithAssociate extends ModelStatic<ApprovalInstance> {
  associate?: (models: any) => void
}

// 声明模型变量
let ApprovalModel: ModelStatic<ApprovalInstance> & {
  associate?: (models: any) => void
}

// 定义审批状态枚举
export enum ApprovalStatus {
  PENDING = 0, // 待审批
  APPROVED = 1, // 通过
  REJECTED = 2 // 拒绝
}

// 定义Approval属性的接口
export interface ApprovalAttributes {
  id: number
  title: string
  content?: string
  applicantId: number
  approverId: number
  applyTime: Date
  approveTime?: Date
  status: ApprovalStatus
}

// 定义创建Approval时可选的属性
export interface ApprovalCreationAttributes
  extends Optional<
    ApprovalAttributes,
    'id' | 'applyTime' | 'content' | 'approveTime'
  > {}

// 定义Approval实例方法
export interface ApprovalInstance
  extends Model<ApprovalAttributes, ApprovalCreationAttributes>,
    ApprovalAttributes {
  toJSON(): ApprovalAttributes
}

// 定义Approval模型
ApprovalModel = sequelize.define<ApprovalInstance>(
  'Approval',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '审批ID（自增主键）'
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '审批标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '审批详情'
    },
    applicantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'applicant_id',
      comment: '申请人ID（关联user表）'
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'approver_id',
      comment: '审批人ID（关联user表）'
    },
    applyTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'apply_time',
      comment: '申请时间'
    },
    approveTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approve_time',
      comment: '审批时间（未审批时为null）'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: ApprovalStatus.PENDING,
      comment: '状态（0=待审批，1=通过，2=拒绝）'
    }
  },
  {
    tableName: 'approval',
    timestamps: false,
    comment: '审批表',
    indexes: [
      {
        fields: ['applicant_id'],
        name: 'idx_applicant'
      },
      {
        fields: ['approver_id'],
        name: 'idx_approver'
      }
    ]
  }
)

// 定义模型关联
ApprovalModel.associate = function (models: any) {
  // 审批属于申请人
  ApprovalModel.belongsTo(models.User, {
    foreignKey: 'applicantId',
    as: 'applicant'
  })

  // 审批属于审批人
  ApprovalModel.belongsTo(models.User, {
    foreignKey: 'approverId',
    as: 'approver'
  })
}

// 添加实例方法
ApprovalModel.prototype.toJSON = function () {
  return this.get()
}

// 导出模型
export const Approval = ApprovalModel
