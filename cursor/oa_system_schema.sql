-- OA系统数据库设计（简化版）
-- 功能：审批流程管理
-- 特点：无用户管理、无角色概念，直接指定审批人

-- 1. 用户表（简化版，只存储基本信息）
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `real_name` varchar(50) NOT NULL COMMENT '真实姓名',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 审批类型表
CREATE TABLE `approval_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '审批类型ID',
  `type_name` varchar(50) NOT NULL COMMENT '类型名称',
  `description` varchar(200) DEFAULT NULL COMMENT '类型描述',
  `icon` varchar(100) DEFAULT NULL COMMENT '图标',
  `color` varchar(20) DEFAULT NULL COMMENT '颜色',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-正常，0-禁用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type_name` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批类型表';

-- 3. 审批流程表
CREATE TABLE `approval_flows` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流程ID',
  `type_id` int(11) NOT NULL COMMENT '审批类型ID',
  `name` varchar(100) NOT NULL COMMENT '流程名称',
  `description` varchar(500) DEFAULT NULL COMMENT '流程描述',
  `steps` json NOT NULL COMMENT '审批步骤配置（JSON格式）',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-正常，0-禁用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_type_id` (`type_id`),
  CONSTRAINT `fk_approval_flows_type` FOREIGN KEY (`type_id`) REFERENCES `approval_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批流程表';

-- 4. 审批申请表
CREATE TABLE `approval_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '申请ID',
  `form_no` varchar(50) NOT NULL COMMENT '表单编号',
  `type_id` int(11) NOT NULL COMMENT '审批类型ID',
  `flow_id` int(11) NOT NULL COMMENT '流程ID',
  `applicant_id` int(11) NOT NULL COMMENT '申请人ID',
  `title` varchar(200) NOT NULL COMMENT '申请标题',
  `content` text NOT NULL COMMENT '申请内容',
  `form_data` json DEFAULT NULL COMMENT '表单数据（JSON格式）',
  `status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '状态：0-待审批，1-审批中，2-已通过，3-已拒绝，4-已撤回',
  `current_step` int(11) NOT NULL DEFAULT '1' COMMENT '当前步骤',
  `total_steps` int(11) NOT NULL DEFAULT '1' COMMENT '总步骤数',
  `priority` tinyint(1) NOT NULL DEFAULT '1' COMMENT '优先级：1-低，2-中，3-高',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_form_no` (`form_no`),
  KEY `idx_type_id` (`type_id`),
  KEY `idx_flow_id` (`flow_id`),
  KEY `idx_applicant_id` (`applicant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_approval_applications_type` FOREIGN KEY (`type_id`) REFERENCES `approval_types` (`id`),
  CONSTRAINT `fk_approval_applications_flow` FOREIGN KEY (`flow_id`) REFERENCES `approval_flows` (`id`),
  CONSTRAINT `fk_approval_applications_applicant` FOREIGN KEY (`applicant_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批申请表';

-- 5. 审批记录表
CREATE TABLE `approval_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `application_id` int(11) NOT NULL COMMENT '申请ID',
  `step` int(11) NOT NULL COMMENT '审批步骤',
  `approver_id` int(11) NOT NULL COMMENT '审批人ID',
  `action` tinyint(2) NOT NULL COMMENT '操作：1-通过，2-拒绝，3-转交，4-撤回',
  `comment` text DEFAULT NULL COMMENT '审批意见',
  `form_data` json DEFAULT NULL COMMENT '审批时的表单数据',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_approver_id` (`approver_id`),
  KEY `idx_step` (`step`),
  CONSTRAINT `fk_approval_records_application` FOREIGN KEY (`application_id`) REFERENCES `approval_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_approval_records_approver` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批记录表';

-- 6. 审批人配置表（简化版，只支持指定用户）
CREATE TABLE `approval_approvers` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `flow_id` int(11) NOT NULL COMMENT '流程ID',
  `step` int(11) NOT NULL COMMENT '步骤',
  `approver_id` int(11) NOT NULL COMMENT '审批人用户ID',
  `is_required` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否必须：1-必须，0-可选',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_flow_step` (`flow_id`, `step`),
  CONSTRAINT `fk_approval_approvers_flow` FOREIGN KEY (`flow_id`) REFERENCES `approval_flows` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_approval_approvers_user` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批人配置表';

-- 7. 系统配置表
CREATE TABLE `system_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text NOT NULL COMMENT '配置值',
  `description` varchar(200) DEFAULT NULL COMMENT '配置描述',
  `type` varchar(20) NOT NULL DEFAULT 'string' COMMENT '配置类型：string,number,boolean,json',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 8. 操作日志表
CREATE TABLE `operation_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` int(11) DEFAULT NULL COMMENT '操作用户ID',
  `action` varchar(100) NOT NULL COMMENT '操作动作',
  `resource` varchar(100) NOT NULL COMMENT '操作资源',
  `resource_id` int(11) DEFAULT NULL COMMENT '资源ID',
  `description` varchar(500) DEFAULT NULL COMMENT '操作描述',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_operation_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 插入初始数据

-- 插入默认审批类型
INSERT INTO `approval_types` (`type_name`, `description`, `icon`, `color`) VALUES
('leave', '请假申请', 'time-filled', '#1890ff'),
('expense', '费用报销', 'money-circle', '#52c41a'),
('purchase', '采购申请', 'shopping-cart', '#faad14'),
('overtime', '加班申请', 'clock', '#722ed1'),
('business_trip', '出差申请', 'location', '#13c2c2');

-- 插入默认流程（请假申请流程）
INSERT INTO `approval_flows` (`type_id`, `name`, `description`, `steps`) VALUES
(1, '请假申请流程', '员工请假申请审批流程', '[
  {"step": 1, "name": "直属领导审批", "is_required": true},
  {"step": 2, "name": "人事部门审批", "is_required": true}
]');

-- 插入默认用户（简化版）
INSERT INTO `users` (`real_name`, `email`, `phone`) VALUES
('系统管理员', 'admin@example.com', '13800138000'),
('张经理', 'manager@example.com', '13800138001'),
('李员工', 'employee@example.com', '13800138002');

-- 插入审批人配置（为请假流程配置审批人）
INSERT INTO `approval_approvers` (`flow_id`, `step`, `approver_id`, `is_required`) VALUES
(1, 1, 2, 1), -- 第1步：张经理审批
(1, 2, 1, 1); -- 第2步：系统管理员审批

-- 插入系统配置
INSERT INTO `system_configs` (`config_key`, `config_value`, `description`, `type`) VALUES
('system_name', 'OA办公系统', '系统名称', 'string'),
('approval_auto_approve', 'false', '是否开启自动审批', 'boolean'),
('approval_timeout_days', '7', '审批超时天数', 'number'),
('notification_enabled', 'true', '是否开启通知', 'boolean');

-- 创建索引优化查询性能
CREATE INDEX `idx_approval_applications_status_created` ON `approval_applications` (`status`, `created_at`);
CREATE INDEX `idx_approval_records_application_step` ON `approval_records` (`application_id`, `step`);
CREATE INDEX `idx_approval_approvers_flow_step` ON `approval_approvers` (`flow_id`, `step`);

-- 创建视图：待我审批的申请（简化版，直接指定用户）
CREATE VIEW `v_pending_approvals` AS
SELECT 
  a.id,
  a.form_no,
  a.title,
  a.content,
  a.status,
  a.current_step,
  a.total_steps,
  a.priority,
  a.created_at,
  at.type_name as approval_type,
  u.real_name as applicant_name,
  aa.approver_id,
  aa.step as pending_step
FROM approval_applications a
JOIN approval_types at ON a.type_id = at.id
JOIN users u ON a.applicant_id = u.id
JOIN approval_approvers aa ON a.flow_id = aa.flow_id AND a.current_step = aa.step
WHERE a.status IN (0, 1)  -- 待审批或审批中
  AND aa.approver_id = ?;  -- 当前用户ID

-- 创建视图：我发起的申请
CREATE VIEW `v_my_applications` AS
SELECT 
  a.id,
  a.form_no,
  a.title,
  a.content,
  a.status,
  a.current_step,
  a.total_steps,
  a.priority,
  a.created_at,
  a.completed_at,
  at.type_name as approval_type
FROM approval_applications a
JOIN approval_types at ON a.type_id = at.id
WHERE a.applicant_id = ?;  -- 当前用户ID
