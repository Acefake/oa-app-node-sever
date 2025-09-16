import { User } from './User'
import { Task } from './Task'
import { Approval } from './Approval'
import { Notice } from './Notice'

// 定义所有模型
const models = {
  User,
  Task,
  Approval,
  Notice
}

// 调用每个模型的关联方法
Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models)
  }
})

// 导出所有模型
export { User, Task, Approval, Notice }
