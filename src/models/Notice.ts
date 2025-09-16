import { DataTypes, Model, Optional, ModelStatic } from 'sequelize'
import sequelize from '../config/database'

// 扩展ModelStatic接口
interface ModelWithAssociate extends ModelStatic<NoticeInstance> {
  associate?: (models: any) => void
}

// 声明模型变量
let NoticeModel: ModelStatic<NoticeInstance> & {
  associate?: (models: any) => void
}

// 定义通知类型枚举
export enum NoticeType {
  TASK = 0, // 任务通知
  APPROVAL = 1, // 审批通知
  SYSTEM = 2 // 系统通知
}

// 定义Notice属性的接口
export interface NoticeAttributes {
  id: number
  receiverId: number
  senderId?: number
  content: string
  type: NoticeType
  createTime: Date
  isRead: boolean
}

// 定义创建Notice时可选的属性
export interface NoticeCreationAttributes
  extends Optional<NoticeAttributes, 'id' | 'createTime' | 'senderId'> {}

// 定义Notice实例方法
export interface NoticeInstance
  extends Model<NoticeAttributes, NoticeCreationAttributes>,
    NoticeAttributes {
  toJSON(): NoticeAttributes
}

// 定义Notice模型
NoticeModel = sequelize.define<NoticeInstance>(
  'Notice',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '通知ID（自增主键）'
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'receiver_id',
      comment: '接收人ID（关联user表）'
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sender_id',
      comment: '发送人ID（关联user表，null表示系统通知）'
    },
    content: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '通知内容'
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: NoticeType.SYSTEM,
      comment: '类型（0=任务通知，1=审批通知，2=系统通知）'
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'create_time',
      comment: '创建时间'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read',
      comment: '是否已读（0=未读，1=已读）'
    }
  },
  {
    tableName: 'notice',
    timestamps: false,
    comment: '通知表',
    indexes: [
      {
        fields: ['receiver_id'],
        name: 'idx_receiver'
      },
      {
        fields: ['sender_id'],
        name: 'idx_sender'
      }
    ]
  }
)

// 定义模型关联
NoticeModel.associate = function (models: any) {
  // 通知属于接收者
  NoticeModel.belongsTo(models.User, {
    foreignKey: 'receiverId',
    as: 'receiver'
  })

  // 通知属于发送者（可选）
  NoticeModel.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender'
  })
}

// 添加实例方法
NoticeModel.prototype.toJSON = function () {
  return this.get()
}

// 导出模型
export const Notice = NoticeModel
