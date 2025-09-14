-- OA系统初始化数据脚本
-- 使用前请先执行 oa_system_schema.sql 创建表结构

USE oa_system;

-- 清空现有数据（谨慎使用）
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE approval_approvers;
-- TRUNCATE TABLE approval_records;
-- TRUNCATE TABLE approval_applications;
-- TRUNCATE TABLE approval_flows;
-- TRUNCATE TABLE approval_types;
-- TRUNCATE TABLE users;
-- TRUNCATE TABLE system_configs;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 插入用户数据
INSERT INTO `users` (`real_name`, `email`, `phone`) VALUES
('系统管理员', 'admin@example.com', '13800138000'),
('张经理', 'manager@example.com', '13800138001'),
('李员工', 'employee@example.com', '13800138002'),
('王主管', 'supervisor@example.com', '13800138003'),
('刘财务', 'finance@example.com', '13800138004'),
('陈人事', 'hr@example.com', '13800138005'),
('赵总监', 'director@example.com', '13800138006'),
('孙助理', 'assistant@example.com', '13800138007');

-- 插入审批类型
INSERT INTO `approval_types` (`type_name`, `description`, `is_active`) VALUES
('请假申请', '员工请假申请', 1),
('出差申请', '员工出差申请', 1),
('加班申请', '员工加班申请', 1),
('报销申请', '费用报销申请', 1),
('采购申请', '物品采购申请', 1),
('调休申请', '员工调休申请', 1),
('外出申请', '员工外出申请', 1),
('培训申请', '员工培训申请', 1);

-- 插入审批流程
INSERT INTO `approval_flows` (`flow_name`, `description`, `steps`, `is_active`) VALUES
('请假申请流程', '员工请假申请审批流程', '[
  {"step": 1, "name": "直属领导审批", "is_required": true},
  {"step": 2, "name": "人事部门审批", "is_required": true}
]', 1),

('出差申请流程', '员工出差申请审批流程', '[
  {"step": 1, "name": "直属领导审批", "is_required": true},
  {"step": 2, "name": "财务部门审批", "is_required": true},
  {"step": 3, "name": "人事部门审批", "is_required": true}
]', 1),

('加班申请流程', '员工加班申请审批流程', '[
  {"step": 1, "name": "直属领导审批", "is_required": true},
  {"step": 2, "name": "人事部门审批", "is_required": true}
]', 1),

('报销申请流程', '费用报销申请审批流程', '[
  {"step": 1, "name": "直属领导审批", "is_required": true},
  {"step": 2, "name": "财务部门审批", "is_required": true}
]', 1),

('采购申请流程', '物品采购申请审批流程', '[
  {"step": 1, "name": "部门主管审批", "is_required": true},
  {"step": 2, "name": "财务部门审批", "is_required": true},
  {"step": 3, "name": "总经理审批", "is_required": true}
]', 1);

-- 插入审批人配置
-- 请假申请流程审批人
INSERT INTO `approval_approvers` (`flow_id`, `step`, `approver_id`, `is_required`) VALUES
(1, 1, 2, 1), -- 第1步：张经理审批
(1, 2, 5, 1); -- 第2步：陈人事审批

-- 出差申请流程审批人
INSERT INTO `approval_approvers` (`flow_id`, `step`, `approver_id`, `is_required`) VALUES
(2, 1, 2, 1), -- 第1步：张经理审批
(2, 2, 4, 1), -- 第2步：刘财务审批
(2, 3, 5, 1); -- 第3步：陈人事审批

-- 加班申请流程审批人
INSERT INTO `approval_approvers` (`flow_id`, `step`, `approver_id`, `is_required`) VALUES
(3, 1, 2, 1), -- 第1步：张经理审批
(3, 2, 5, 1); -- 第2步：陈人事审批

-- 报销申请流程审批人
INSERT INTO `approval_approvers` (`flow_id`, `step`, `approver_id`, `is_required`) VALUES
(4, 1, 2, 1), -- 第1步：张经理审批
(4, 2, 4, 1); -- 第2步：刘财务审批

-- 采购申请流程审批人
INSERT INTO `approval_approvers` (`flow_id`, `step`, `approver_id`, `is_required`) VALUES
(5, 1, 2, 1), -- 第1步：张经理审批
(5, 2, 4, 1), -- 第2步：刘财务审批
(5, 3, 6, 1); -- 第3步：赵总监审批

-- 插入系统配置
INSERT INTO `system_configs` (`config_key`, `config_value`, `description`, `type`) VALUES
('system_name', 'OA办公系统', '系统名称', 'string'),
('approval_auto_approve', 'false', '是否开启自动审批', 'boolean'),
('approval_timeout_days', '7', '审批超时天数', 'number'),
('file_upload_max_size', '10485760', '文件上传最大大小（字节）', 'number'),
('file_upload_allowed_types', 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png', '允许上传的文件类型', 'string'),
('email_notification', 'true', '是否开启邮件通知', 'boolean'),
('sms_notification', 'false', '是否开启短信通知', 'boolean'),
('approval_reminder_hours', '24', '审批提醒间隔（小时）', 'number'),
('work_days_per_week', '5', '每周工作天数', 'number'),
('work_hours_per_day', '8', '每天工作小时数', 'number');

-- 插入示例审批申请数据
INSERT INTO `approval_applications` (
  `form_no`, `type_id`, `flow_id`, `applicant_id`, `title`, `content`, 
  `status`, `current_step`, `total_steps`, `priority`, `form_data`
) VALUES
('APP202401010001', 1, 1, 3, '年假申请', '申请年假3天，从2024-01-15到2024-01-17', 2, 3, 2, 1, '{"start_date":"2024-01-15","end_date":"2024-01-17","days":3,"reason":"个人事务"}'),
('APP202401010002', 1, 1, 3, '病假申请', '因病需要请假1天', 1, 1, 2, 2, '{"start_date":"2024-01-20","end_date":"2024-01-20","days":1,"reason":"身体不适"}'),
('APP202401010003', 2, 2, 3, '出差申请', '前往北京参加技术会议', 0, 1, 3, 2, '{"start_date":"2024-01-25","end_date":"2024-01-27","destination":"北京","purpose":"技术会议","budget":5000}'),
('APP202401010004', 3, 3, 3, '加班申请', '项目紧急，需要周末加班', 2, 3, 2, 3, '{"date":"2024-01-13","hours":8,"reason":"项目紧急"}'),
('APP202401010005', 4, 4, 3, '差旅费报销', '报销出差期间的交通和住宿费用', 1, 1, 2, 1, '{"amount":1200,"items":"交通费、住宿费","description":"北京出差费用"}');

-- 插入审批记录数据
INSERT INTO `approval_records` (
  `application_id`, `step`, `approver_id`, `action`, `comment`, `created_at`
) VALUES
-- 申请1的审批记录（已通过）
(1, 1, 2, 0, '同意申请，注意工作安排', '2024-01-01 09:00:00'),
(1, 2, 5, 0, '同意，已记录考勤', '2024-01-01 14:00:00'),

-- 申请4的审批记录（已通过）
(4, 1, 2, 0, '同意加班，注意休息', '2024-01-12 18:00:00'),
(4, 2, 5, 0, '同意，已安排调休', '2024-01-12 19:00:00');

-- 插入附件数据（示例）
INSERT INTO `attachments` (
  `application_id`, `original_name`, `file_name`, `file_path`, 
  `file_size`, `mime_type`, `uploaded_by`
) VALUES
(1, '请假证明.pdf', '20240101_123456_请假证明.pdf', '/uploads/2024/01/01/20240101_123456_请假证明.pdf', 1024000, 'application/pdf', 3),
(3, '会议邀请函.docx', '20240101_123457_会议邀请函.docx', '/uploads/2024/01/01/20240101_123457_会议邀请函.docx', 512000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 3),
(4, '加班申请表.xlsx', '20240101_123458_加班申请表.xlsx', '/uploads/2024/01/01/20240101_123458_加班申请表.xlsx', 256000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 3);

-- 创建一些有用的视图
-- 待审批申请视图（按审批人）
CREATE OR REPLACE VIEW `v_pending_approvals_by_user` AS
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
  af.flow_name as approval_flow,
  u.real_name as applicant_name,
  aa.approver_id,
  aa.step as pending_step,
  approver.real_name as approver_name
FROM approval_applications a
JOIN approval_types at ON a.type_id = at.id
JOIN approval_flows af ON a.flow_id = af.id
JOIN users u ON a.applicant_id = u.id
JOIN approval_approvers aa ON a.flow_id = aa.flow_id AND a.current_step = aa.step
JOIN users approver ON aa.approver_id = approver.id
WHERE a.status IN (0, 1); -- 待审批或审批中

-- 审批统计视图
CREATE OR REPLACE VIEW `v_approval_statistics` AS
SELECT 
  DATE(created_at) as date,
  type_id,
  at.type_name,
  status,
  CASE status
    WHEN 0 THEN '待审批'
    WHEN 1 THEN '审批中'
    WHEN 2 THEN '已通过'
    WHEN 3 THEN '已拒绝'
    WHEN 4 THEN '已撤回'
  END as status_name,
  COUNT(*) as count
FROM approval_applications a
JOIN approval_types at ON a.type_id = at.id
GROUP BY DATE(created_at), type_id, status
ORDER BY date DESC, type_id, status;

-- 用户审批统计视图
CREATE OR REPLACE VIEW `v_user_approval_stats` AS
SELECT 
  aa.approver_id,
  u.real_name as approver_name,
  COUNT(DISTINCT ar.application_id) as total_handled,
  SUM(CASE WHEN ar.action = 0 THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN ar.action = 1 THEN 1 ELSE 0 END) as rejected_count,
  ROUND(SUM(CASE WHEN ar.action = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT ar.application_id), 2) as approval_rate
FROM approval_approvers aa
LEFT JOIN approval_records ar ON aa.flow_id = (SELECT flow_id FROM approval_applications WHERE id = ar.application_id) 
  AND aa.step = ar.step AND aa.approver_id = ar.approver_id
JOIN users u ON aa.approver_id = u.id
GROUP BY aa.approver_id, u.real_name;

-- 插入完成提示
SELECT '数据初始化完成！' as message;
SELECT '用户数量：' as info, COUNT(*) as count FROM users;
SELECT '审批类型数量：' as info, COUNT(*) as count FROM approval_types;
SELECT '审批流程数量：' as info, COUNT(*) as count FROM approval_flows;
SELECT '审批申请数量：' as info, COUNT(*) as count FROM approval_applications;
SELECT '审批记录数量：' as info, COUNT(*) as count FROM approval_records;
