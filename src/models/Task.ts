import { DataTypes, Model, Optional, ModelStatic } from 'sequelize'
import sequelize from '../config/database'

// 扩展ModelStatic接口
interface ModelWithAssociate extends ModelStatic<TaskInstance> {
  associate?: (models: any) => void
}

// 声明模型变量
let TaskModel: ModelStatic<TaskInstance> & { associate?: (models: any) => void }

// 定义任务状态枚举
export enum TaskStatus {
  NOT_STARTED = 0, // 未开始
  IN_PROGRESS = 1, // 进行中
  COMPLETED = 2 // 已完成
}

// 定义Task属性的接口
export interface TaskAttributes {
  id: number
  title: string
  content?: string
  creatorId: number
  assigneeId: number
  createTime: Date
  deadline?: Date
  status: TaskStatus
}

// 定义创建Task时可选的属性
export interface TaskCreationAttributes
  extends Optional<
    TaskAttributes,
    'id' | 'createTime' | 'content' | 'deadline'
  > {}

// 定义Task实例方法
export interface TaskInstance
  extends Model<TaskAttributes, TaskCreationAttributes>,
    TaskAttributes {
  toJSON(): TaskAttributes
}

// 定义Task模型
TaskModel = sequelize.define<TaskInstance>(
  'Task',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '任务ID（自增主键）'
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '任务标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '任务详情'
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'creator_id',
      comment: '创建人ID（关联user表）'
    },
    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'assignee_id',
      comment: '负责人ID（关联user表）'
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'create_time',
      comment: '创建时间'
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '截止时间（非必填）'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: TaskStatus.NOT_STARTED,
      comment: '状态（0=未开始，1=进行中，2=已完成）'
    }
  },
  {
    tableName: 'task',
    timestamps: false,
    comment: '任务表',
    indexes: [
      {
        fields: ['creator_id'],
        name: 'idx_creator'
      },
      {
        fields: ['assignee_id'],
        name: 'idx_assignee'
      }
    ]
  }
)

// 定义模型关联
TaskModel.associate = function (models: any) {
  // 任务属于创建者
  TaskModel.belongsTo(models.User, {
    foreignKey: 'creatorId',
    as: 'creator'
  })

  // 任务属于负责人
  TaskModel.belongsTo(models.User, {
    foreignKey: 'assigneeId',
    as: 'assignee'
  })
}

// 添加实例方法
TaskModel.prototype.toJSON = function () {
  return this.get()
}

// 导出模型
export const Task = TaskModel
