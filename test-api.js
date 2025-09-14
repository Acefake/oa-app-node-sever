const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

// 测试用户API
async function testUserAPI() {
  console.log('=== 测试用户API ===')

  try {
    // 获取用户列表
    console.log('1. 获取用户列表')
    const usersResponse = await axios.get(`${BASE_URL}/users`)
    console.log('状态:', usersResponse.status)
    console.log('数据:', usersResponse.data)

    // 创建用户
    console.log('\n2. 创建用户')
    const createUserResponse = await axios.post(`${BASE_URL}/users`, {
      real_name: '测试用户',
      email: 'test@example.com',
      phone: '13800138000'
    })
    console.log('状态:', createUserResponse.status)
    console.log('数据:', createUserResponse.data)

    const userId = createUserResponse.data.data.id

    // 获取用户详情
    console.log('\n3. 获取用户详情')
    const userDetailResponse = await axios.get(`${BASE_URL}/users/${userId}`)
    console.log('状态:', userDetailResponse.status)
    console.log('数据:', userDetailResponse.data)

    // 更新用户
    console.log('\n4. 更新用户')
    const updateUserResponse = await axios.put(`${BASE_URL}/users/${userId}`, {
      real_name: '更新后的测试用户',
      email: 'updated@example.com'
    })
    console.log('状态:', updateUserResponse.status)
    console.log('数据:', updateUserResponse.data)

    // 删除用户
    console.log('\n5. 删除用户')
    const deleteUserResponse = await axios.delete(`${BASE_URL}/users/${userId}`)
    console.log('状态:', deleteUserResponse.status)
    console.log('数据:', deleteUserResponse.data)
  } catch (error) {
    console.error('用户API测试失败:', error.response?.data || error.message)
  }
}

// 测试审批流程API
async function testApprovalFlowAPI() {
  console.log('\n=== 测试审批流程API ===')

  try {
    // 获取审批流程列表
    console.log('1. 获取审批流程列表')
    const flowsResponse = await axios.get(`${BASE_URL}/approval-flows`)
    console.log('状态:', flowsResponse.status)
    console.log('数据:', flowsResponse.data)

    // 创建审批流程
    console.log('\n2. 创建审批流程')
    const createFlowResponse = await axios.post(`${BASE_URL}/approval-flows`, {
      type_id: 1,
      name: '测试审批流程',
      description: '这是一个测试审批流程',
      steps: [
        { step: 1, name: '第一步审批', is_required: true },
        { step: 2, name: '第二步审批', is_required: true }
      ]
    })
    console.log('状态:', createFlowResponse.status)
    console.log('数据:', createFlowResponse.data)

    const flowId = createFlowResponse.data.data.id

    // 获取流程详情
    console.log('\n3. 获取流程详情')
    const flowDetailResponse = await axios.get(
      `${BASE_URL}/approval-flows/${flowId}`
    )
    console.log('状态:', flowDetailResponse.status)
    console.log('数据:', flowDetailResponse.data)

    // 配置审批人
    console.log('\n4. 配置审批人')
    const setApproversResponse = await axios.post(
      `${BASE_URL}/approval-flows/${flowId}/approvers`,
      {
        approvers: [
          { step: 1, approver_id: 1, is_required: true },
          { step: 2, approver_id: 2, is_required: true }
        ]
      }
    )
    console.log('状态:', setApproversResponse.status)
    console.log('数据:', setApproversResponse.data)

    // 获取审批人配置
    console.log('\n5. 获取审批人配置')
    const getApproversResponse = await axios.get(
      `${BASE_URL}/approval-flows/${flowId}/approvers`
    )
    console.log('状态:', getApproversResponse.status)
    console.log('数据:', getApproversResponse.data)

    // 删除流程
    console.log('\n6. 删除流程')
    const deleteFlowResponse = await axios.delete(
      `${BASE_URL}/approval-flows/${flowId}`
    )
    console.log('状态:', deleteFlowResponse.status)
    console.log('数据:', deleteFlowResponse.data)
  } catch (error) {
    console.error('审批流程API测试失败:', error.response?.data || error.message)
  }
}

// 测试系统配置API
async function testSystemConfigAPI() {
  console.log('\n=== 测试系统配置API ===')

  try {
    // 获取系统配置
    console.log('1. 获取系统配置')
    const configsResponse = await axios.get(`${BASE_URL}/system-configs`)
    console.log('状态:', configsResponse.status)
    console.log('数据:', configsResponse.data)

    // 更新系统配置
    console.log('\n2. 更新系统配置')
    const updateConfigResponse = await axios.put(
      `${BASE_URL}/system-configs/system_name`,
      {
        config_value: '更新后的OA系统'
      }
    )
    console.log('状态:', updateConfigResponse.status)
    console.log('数据:', updateConfigResponse.data)

    // 获取特定配置
    console.log('\n3. 获取特定配置')
    const configResponse = await axios.get(
      `${BASE_URL}/system-configs/system_name`
    )
    console.log('状态:', configResponse.status)
    console.log('数据:', configResponse.data)
  } catch (error) {
    console.error('系统配置API测试失败:', error.response?.data || error.message)
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始API测试...\n')

  await testUserAPI()
  await testApprovalFlowAPI()
  await testSystemConfigAPI()

  console.log('\n=== 测试完成 ===')
}

// 如果直接运行此文件
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  testUserAPI,
  testApprovalFlowAPI,
  testSystemConfigAPI,
  runAllTests
}
