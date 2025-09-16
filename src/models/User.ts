import { DataTypes, Model, Optional, ModelStatic } from 'sequelize'
import sequelize from '../config/database'

// 扩展ModelStatic接口
interface ModelWithAssociate extends ModelStatic<UserInstance> {
  associate?: (models: any) => void
}

// 声明模型变量
let UserModel: ModelStatic<UserInstance> & { associate?: (models: any) => void }

// 定义User属性的接口
export interface UserAttributes {
  id: number
  username: string
  password: string
  realName: string
  phone?: string
  createTime: Date
}

// 定义创建User时可选的属性
export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'createTime'> {}

// 定义User实例方法
export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {
  // 可以在这里添加实例方法
  toJSON(): UserAttributes
}

// 定义User模型
UserModel = sequelize.define<UserInstance>(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '用户ID（自增主键）'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '登录账号（唯一）'
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '加密后的密码'
    },
    realName: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'real_name',
      comment: '用户真实姓名'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '联系电话（非必填）'
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'create_time',
      comment: '账号创建时间'
    }
  },
  {
    tableName: 'user',
    timestamps: false,
    comment: '系统用户表'
  }
)

// 定义模型关联
UserModel.associate = function (models: any) {
  // 一个用户可以创建多个任务
  UserModel.hasMany(models.Task, {
    foreignKey: 'creatorId',
    as: 'createdTasks'
  })

  // 一个用户可以被分配多个任务
  UserModel.hasMany(models.Task, {
    foreignKey: 'assigneeId',
    as: 'assignedTasks'
  })

  // 一个用户可以申请多个审批
  UserModel.hasMany(models.Approval, {
    foreignKey: 'applicantId',
    as: 'appliedApprovals'
  })

  // 一个用户可以审批多个申请
  UserModel.hasMany(models.Approval, {
    foreignKey: 'approverId',
    as: 'approvedApprovals'
  })

  // 一个用户可以接收多个通知
  UserModel.hasMany(models.Notice, {
    foreignKey: 'receiverId',
    as: 'receivedNotices'
  })

  // 一个用户可以发送多个通知
  UserModel.hasMany(models.Notice, {
    foreignKey: 'senderId',
    as: 'sentNotices'
  })
}

// 添加实例方法
UserModel.prototype.toJSON = function () {
  const values = { ...this.get() }
  delete values.password // 不返回密码
  return values
}

// 导出模型
export const User = UserModel
