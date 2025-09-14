# OA系统后端API

基于Node.js + Express + MySQL的办公自动化审批系统后端API。

## 项目结构

```
oa-node-sever/
├── app.js                 # 应用入口文件
├── package.json           # 项目依赖配置
├── config.env            # 环境变量配置
├── config/               # 配置文件
│   ├── database.js       # 数据库配置
│   └── index.js          # 配置入口
├── controllers/          # 控制器
│   ├── userController.js         # 用户管理
│   ├── approvalFlowController.js # 审批流程管理
│   ├── approvalController.js     # 审批申请管理
│   ├── statisticsController.js   # 统计报表
│   └── systemConfigController.js # 系统配置
├── middleware/           # 中间件
│   ├── auth.js          # 认证中间件
│   ├── errorHandler.js  # 错误处理
│   └── validation.js    # 参数验证
├── models/              # 数据模型
│   ├── index.js         # 模型入口
│   ├── User.js          # 用户模型
│   ├── ApprovalType.js  # 审批类型模型
│   ├── ApprovalFlow.js  # 审批流程模型
│   ├── ApprovalApprover.js # 审批人配置模型
│   ├── Approval.js      # 审批申请模型
│   ├── ApprovalRecord.js # 审批记录模型
│   ├── SystemConfig.js  # 系统配置模型
│   └── OperationLog.js  # 操作日志模型
├── routes/              # 路由
│   ├── index.js         # 路由入口
│   ├── users.js         # 用户路由
│   ├── approvalFlows.js # 审批流程路由
│   ├── approvals.js     # 审批申请路由
│   ├── statistics.js    # 统计路由
│   └── systemConfigs.js # 系统配置路由
├── utils/               # 工具函数
│   ├── helpers.js       # 辅助函数
│   ├── customErrors.js  # 自定义错误
│   └── logger.js        # 日志工具
├── scripts/             # 脚本
│   ├── initDatabase.js  # 数据库初始化
│   └── initData.js      # 数据初始化
└── cursor/              # 文档
    ├── api_design.md    # API设计文档
    ├── oa_system_schema.sql # 数据库结构
    └── init_data.sql    # 初始化数据
```

## 功能特性

### 1. 用户管理
- 用户CRUD操作
- 用户信息查询和更新
- 简化的用户模型（无角色和部门概念）

### 2. 审批流程管理
- 审批流程的创建、更新、删除
- 审批人配置管理
- 支持多步骤审批流程
- 流程状态管理

### 3. 审批申请管理
- 创建审批申请
- 申请状态跟踪
- 审批操作（通过/拒绝）
- 申请撤回功能
- 审批记录查询

### 4. 统计报表
- 审批统计信息
- 个人审批统计
- 按流程和状态统计

### 5. 系统配置
- 系统参数配置
- 配置项管理

## API接口

### 基础信息
- 基础URL: `http://localhost:3000/api`
- 数据格式: JSON
- 字符编码: UTF-8

### 响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 主要接口

#### 用户管理
- `GET /users` - 获取用户列表
- `GET /users/:id` - 获取用户详情
- `POST /users` - 创建用户
- `PUT /users/:id` - 更新用户
- `DELETE /users/:id` - 删除用户

#### 审批流程管理
- `GET /approval-flows` - 获取审批流程列表
- `GET /approval-flows/:id` - 获取流程详情
- `POST /approval-flows` - 创建审批流程
- `PUT /approval-flows/:id` - 更新审批流程
- `DELETE /approval-flows/:id` - 删除审批流程
- `GET /approval-flows/:flowId/approvers` - 获取流程审批人配置
- `POST /approval-flows/:flowId/approvers` - 配置流程审批人

#### 审批申请管理
- `GET /approval-applications/my` - 获取我的申请列表
- `POST /approval-applications` - 创建审批申请
- `GET /approval-applications/:id` - 获取申请详情
- `PUT /approval-applications/:id/withdraw` - 撤回申请
- `GET /approval-applications/pending` - 获取待我审批的申请
- `POST /approval-applications/:id/approve` - 审批申请
- `GET /approval-applications/:id/records` - 获取审批记录

#### 统计报表
- `GET /statistics/approval` - 获取审批统计
- `GET /statistics/my-approval` - 获取我的审批统计

#### 系统配置
- `GET /system-configs` - 获取系统配置
- `GET /system-configs/:key` - 获取特定配置
- `PUT /system-configs/:key` - 更新系统配置

## 安装和运行

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `config.env` 文件并配置数据库连接信息：
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=oa_system
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

### 3. 初始化数据库
```bash
# 创建数据库和表结构
mysql -u root -p < cursor/oa_system_schema.sql

# 插入初始数据
mysql -u root -p < cursor/init_data.sql
```

### 4. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 5. 测试API
```bash
# 运行测试脚本
node test-api.js
```

## 数据库设计

### 主要表结构

1. **users** - 用户表
2. **approval_types** - 审批类型表
3. **approval_flows** - 审批流程表
4. **approval_approvers** - 审批人配置表
5. **approval_applications** - 审批申请表
6. **approval_records** - 审批记录表
7. **system_configs** - 系统配置表
8. **operation_logs** - 操作日志表

### 状态码说明

#### 审批申请状态
- `0`: 待审批
- `1`: 审批中
- `2`: 已通过
- `3`: 已拒绝
- `4`: 已撤回

#### 审批动作
- `0`: 通过
- `1`: 拒绝

#### 优先级
- `1`: 低
- `2`: 中
- `3`: 高
- `4`: 紧急

## 技术栈

- **Node.js** - 运行环境
- **Express.js** - Web框架
- **Sequelize** - ORM框架
- **MySQL** - 数据库
- **JWT** - 身份认证
- **express-validator** - 参数验证
- **helmet** - 安全中间件
- **cors** - 跨域处理
- **morgan** - 请求日志

## 开发说明

### 代码规范
- 使用ES6+语法
- 采用async/await处理异步操作
- 统一的错误处理机制
- 完整的参数验证
- 详细的日志记录

### 扩展功能
- 支持文件上传
- 邮件通知功能
- 短信通知功能
- 审批超时处理
- 更多统计报表

## 许可证

MIT License