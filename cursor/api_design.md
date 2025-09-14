# OA系统 API 接口设计

## 基础信息
- 基础URL: `http://localhost:3000/api`
- 认证方式: JWT Token
- 数据格式: JSON
- 字符编码: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 1. 用户管理 API

### 1.1 获取所有用户
```
GET /users
```

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "real_name": "系统管理员",
      "email": "admin@example.com",
      "phone": "13800138000"
    },
    {
      "id": 2,
      "real_name": "张经理",
      "email": "manager@example.com",
      "phone": "13800138001"
    }
  ]
}
```

### 1.2 根据ID获取用户
```
GET /users/:id
```

**参数:**
- `id` (path): 用户ID

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "real_name": "系统管理员",
    "email": "admin@example.com",
    "phone": "13800138000"
  }
}
```

## 2. 审批流程管理 API

### 2.1 获取所有审批流程
```
GET /approval-flows
```

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "flow_name": "请假申请流程",
      "description": "员工请假申请审批流程",
      "steps": [
        {"step": 1, "name": "直属领导审批", "is_required": true},
        {"step": 2, "name": "人事部门审批", "is_required": true}
      ],
      "is_active": 1,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2.2 创建审批流程
```
POST /approval-flows
```

**请求体:**
```json
{
  "flow_name": "出差申请流程",
  "description": "员工出差申请审批流程",
  "steps": [
    {"step": 1, "name": "直属领导审批", "is_required": true},
    {"step": 2, "name": "财务部门审批", "is_required": true}
  ],
  "is_active": 1
}
```

### 2.3 更新审批流程
```
PUT /approval-flows/:id
```

### 2.4 删除审批流程
```
DELETE /approval-flows/:id
```

## 3. 审批人配置 API

### 3.1 获取流程的审批人配置
```
GET /approval-flows/:flowId/approvers
```

**参数:**
- `flowId` (path): 流程ID

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "flow_id": 1,
      "step": 1,
      "approver_id": 2,
      "is_required": 1,
      "approver": {
        "id": 2,
        "real_name": "张经理",
        "email": "manager@example.com"
      }
    }
  ]
}
```

### 3.2 配置流程审批人
```
POST /approval-flows/:flowId/approvers
```

**请求体:**
```json
{
  "approvers": [
    {
      "step": 1,
      "approver_id": 2,
      "is_required": 1
    },
    {
      "step": 2,
      "approver_id": 1,
      "is_required": 1
    }
  ]
}
```

### 3.3 更新审批人配置
```
PUT /approval-flows/:flowId/approvers
```

### 3.4 删除审批人配置
```
DELETE /approval-flows/:flowId/approvers
```

## 4. 审批申请管理 API

### 4.1 获取我的申请列表
```
GET /approval-applications/my
```

**查询参数:**
- `page` (query): 页码，默认1
- `limit` (query): 每页数量，默认10
- `status` (query): 状态筛选 (0:待审批, 1:审批中, 2:已通过, 3:已拒绝, 4:已撤回)
- `flow_id` (query): 审批流程ID筛选

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "form_no": "APP202401010001",
        "title": "年假申请",
        "content": "申请年假3天",
        "status": 1,
        "current_step": 1,
        "total_steps": 2,
        "priority": 1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "approval_flow": "请假申请流程"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 4.2 创建审批申请
```
POST /approval-applications
```

**请求体:**
```json
{
  "flow_id": 1,
  "title": "年假申请",
  "content": "申请年假3天，从2024-01-15到2024-01-17",
  "priority": 1,
  "form_data": {
    "start_date": "2024-01-15",
    "end_date": "2024-01-17",
    "days": 3,
    "reason": "个人事务"
  }
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "申请创建成功",
  "data": {
    "id": 1,
    "form_no": "APP202401010001",
    "title": "年假申请",
    "status": 0,
    "current_step": 1,
    "total_steps": 2
  }
}
```

### 4.3 获取申请详情
```
GET /approval-applications/:id
```

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "form_no": "APP202401010001",
    "title": "年假申请",
    "content": "申请年假3天",
    "status": 1,
    "current_step": 1,
    "total_steps": 2,
    "priority": 1,
    "form_data": {
      "start_date": "2024-01-15",
      "end_date": "2024-01-17",
      "days": 3,
      "reason": "个人事务"
    },
    "created_at": "2024-01-01T00:00:00.000Z",
    "approval_flow": "请假申请流程",
    "applicant": {
      "id": 3,
      "real_name": "李员工",
      "email": "employee@example.com"
    },
    "approval_records": [
      {
        "id": 1,
        "step": 1,
        "action": 0,
        "comment": "同意申请",
        "created_at": "2024-01-01T00:00:00.000Z",
        "approver": {
          "id": 2,
          "real_name": "张经理"
        }
      }
    ]
  }
}
```

### 4.4 撤回申请
```
PUT /approval-applications/:id/withdraw
```

**响应示例:**
```json
{
  "code": 200,
  "message": "申请已撤回",
  "data": {
    "id": 1,
    "status": 4
  }
}
```

## 5. 审批操作 API

### 5.1 获取待我审批的申请
```
GET /approval-applications/pending
```

**查询参数:**
- `page` (query): 页码，默认1
- `limit` (query): 每页数量，默认10
- `priority` (query): 优先级筛选 (1:低, 2:中, 3:高, 4:紧急)

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "form_no": "APP202401010001",
        "title": "年假申请",
        "content": "申请年假3天",
        "status": 1,
        "current_step": 1,
        "total_steps": 2,
        "priority": 1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "applicant_name": "李员工",
        "pending_step": 1
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 5.2 审批申请
```
POST /approval-applications/:id/approve
```

**请求体:**
```json
{
  "action": 1,
  "comment": "同意申请，注意工作安排"
}
```

**参数说明:**
- `action`: 审批动作 (0:通过, 1:拒绝)
- `comment`: 审批意见

**响应示例:**
```json
{
  "code": 200,
  "message": "审批完成",
  "data": {
    "application_id": 1,
    "step": 1,
    "action": 0,
    "next_step": 2,
    "is_completed": false
  }
}
```

### 5.3 获取审批记录
```
GET /approval-applications/:id/records
```

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "step": 1,
      "action": 0,
      "comment": "同意申请",
      "created_at": "2024-01-01T00:00:00.000Z",
      "approver": {
        "id": 2,
        "real_name": "张经理",
        "email": "manager@example.com"
      }
    }
  ]
}
```

## 6. 统计报表 API

### 6.1 获取审批统计
```
GET /statistics/approval
```

**查询参数:**
- `start_date` (query): 开始日期 (YYYY-MM-DD)
- `end_date` (query): 结束日期 (YYYY-MM-DD)
- `user_id` (query): 用户ID（可选）

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total_applications": 100,
    "pending_applications": 10,
    "approved_applications": 80,
    "rejected_applications": 8,
    "withdrawn_applications": 2,
    "approval_rate": 90.9,
    "average_approval_time": 2.5,
    "by_flow": [
      {
        "flow_name": "请假申请流程",
        "count": 60,
        "approved": 55,
        "rejected": 3,
        "pending": 2
      }
    ],
    "by_status": [
      {"status": 0, "name": "待审批", "count": 5},
      {"status": 1, "name": "审批中", "count": 5},
      {"status": 2, "name": "已通过", "count": 80},
      {"status": 3, "name": "已拒绝", "count": 8},
      {"status": 4, "name": "已撤回", "count": 2}
    ]
  }
}
```

### 6.2 获取我的审批统计
```
GET /statistics/my-approval
```

**查询参数:**
- `start_date` (query): 开始日期
- `end_date` (query): 结束日期

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "pending_count": 5,
    "approved_count": 50,
    "rejected_count": 3,
    "total_handled": 53,
    "approval_rate": 94.3,
    "average_handle_time": 1.2
  }
}
```

## 7. 系统配置 API

### 7.1 获取系统配置
```
GET /system-configs
```

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "config_key": "system_name",
      "config_value": "OA办公系统",
      "description": "系统名称",
      "type": "string"
    },
    {
      "id": 2,
      "config_key": "approval_auto_approve",
      "config_value": "false",
      "description": "是否开启自动审批",
      "type": "boolean"
    }
  ]
}
```

### 7.2 更新系统配置
```
PUT /system-configs/:key
```

**参数:**
- `key` (path): 配置键

**请求体:**
```json
{
  "config_value": "新值"
}
```

## 8. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

## 9. 状态码说明

### 审批申请状态
- `0`: 待审批
- `1`: 审批中
- `2`: 已通过
- `3`: 已拒绝
- `4`: 已撤回

### 审批动作
- `0`: 通过
- `1`: 拒绝

### 优先级
- `1`: 低
- `2`: 中
- `3`: 高
- `4`: 紧急

## 12. 分页参数说明

所有列表接口都支持分页，参数如下：
- `page`: 页码，从1开始，默认1
- `limit`: 每页数量，默认10，最大100

分页响应格式：
```json
{
  "list": [],
  "total": 100,
  "page": 1,
  "limit": 10,
  "total_pages": 10
}
```
