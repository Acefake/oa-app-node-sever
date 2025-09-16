# OA 系统后端服务

基于 Node.js + TypeScript + Express + Sequelize 的办公自动化系统后端 API 服务。

## 功能特性

- 👤 **用户管理** - 用户注册、登录、信息管理
- 📋 **任务管理** - 任务创建、分配、状态跟踪
- ✅ **审批流程** - 审批申请、处理、状态管理
- 🔔 **通知系统** - 消息通知、已读状态管理
- 🔐 **安全认证** - JWT 令牌认证、密码加密
- 📊 **数据验证** - 请求参数验证、错误处理

## 技术栈

- **运行时**: Node.js
- **语言**: TypeScript
- **框架**: Express.js
- **ORM**: Sequelize
- **数据库**: MySQL
- **认证**: JWT
- **验证**: express-validator
- **安全**: helmet, bcryptjs

## 项目结构

```
src/
├── config/          # 配置文件
│   └── database.ts  # 数据库配置
├── controllers/     # 控制器
│   ├── userController.ts
│   ├── taskController.ts
│   ├── approvalController.ts
│   └── noticeController.ts
├── middleware/      # 中间件
│   ├── auth.ts      # 认证中间件
│   ├── errorHandler.ts
│   └── validation.ts
├── models/          # 数据模型
│   ├── User.ts
│   ├── Task.ts
│   ├── Approval.ts
│   ├── Notice.ts
│   └── index.ts
├── routes/          # 路由
│   ├── userRoutes.ts
│   ├── taskRoutes.ts
│   ├── approvalRoutes.ts
│   ├── noticeRoutes.ts
│   └── index.ts
├── scripts/         # 脚本
│   └── syncDatabase.ts
├── app.ts           # 应用配置
└── server.ts        # 服务器入口
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `config.env` 文件并修改数据库配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=oa_system
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key

# 服务器配置
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

### 3. 同步数据库

```bash
npm run db:sync
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 构建生产版本

```bash
npm run build
npm start
```

## API 接口

### 基础 URL

```
http://localhost:3000/api/v1
```

### 用户接口

- `POST /users/register` - 用户注册
- `POST /users/login` - 用户登录
- `GET /users/profile` - 获取用户信息
- `PUT /users/profile` - 更新用户信息
- `PUT /users/change-password` - 修改密码

### 任务接口

- `POST /tasks` - 创建任务
- `GET /tasks` - 获取任务列表
- `GET /tasks/:id` - 获取任务详情
- `PUT /tasks/:id` - 更新任务
- `DELETE /tasks/:id` - 删除任务
- `PATCH /tasks/:id/status` - 更新任务状态

### 审批接口

- `POST /approvals` - 创建审批申请
- `GET /approvals` - 获取审批列表
- `GET /approvals/my` - 获取我的申请
- `GET /approvals/pending` - 获取待我审批
- `GET /approvals/:id` - 获取审批详情
- `PATCH /approvals/:id/process` - 处理审批
- `DELETE /approvals/:id` - 删除申请

### 通知接口

- `POST /notices` - 发送通知
- `GET /notices` - 获取通知列表
- `GET /notices/unread-count` - 获取未读数量
- `GET /notices/:id` - 获取通知详情
- `PATCH /notices/:id/read` - 标记已读
- `PATCH /notices/mark-all-read` - 全部标记已读
- `DELETE /notices/:id` - 删除通知

## 数据库设计

### 用户表 (user)

- id: 主键
- username: 用户名（唯一）
- password: 加密密码
- real_name: 真实姓名
- phone: 联系电话
- create_time: 创建时间

### 任务表 (task)

- id: 主键
- title: 任务标题
- content: 任务内容
- creator_id: 创建人 ID
- assignee_id: 负责人 ID
- create_time: 创建时间
- deadline: 截止时间
- status: 状态（0=未开始，1=进行中，2=已完成）

### 审批表 (approval)

- id: 主键
- title: 审批标题
- content: 审批内容
- applicant_id: 申请人 ID
- approver_id: 审批人 ID
- apply_time: 申请时间
- approve_time: 审批时间
- status: 状态（0=待审批，1=通过，2=拒绝）

### 通知表 (notice)

- id: 主键
- receiver_id: 接收人 ID
- sender_id: 发送人 ID
- content: 通知内容
- type: 类型（0=任务通知，1=审批通知，2=系统通知）
- create_time: 创建时间
- is_read: 是否已读

## 开发说明

### 模型关联

每个模型都包含自己的关联定义，通过 `associate` 方法实现：

- User 与 Task: 一对多（创建者、负责人）
- User 与 Approval: 一对多（申请人、审批人）
- User 与 Notice: 一对多（接收者、发送者）

### 认证机制

使用 JWT 令牌进行身份认证，令牌包含用户 ID、用户名和真实姓名。

### 错误处理

统一的错误处理中间件，支持自定义错误类型和 HTTP 状态码。

### 数据验证

使用 express-validator 进行请求参数验证，支持自定义验证规则。

## 许可证

MIT License
