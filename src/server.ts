import app from './app'
import sequelize from './config/database'

const PORT = process.env.PORT || 3000

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate()
    console.log('✅ 数据库连接成功')

    // 同步数据库模型（不强制重建表，保持现有数据）
    await sequelize.sync({ force: false })
    console.log('✅ 数据库模型同步完成')

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`)
    })
  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('🛑 收到SIGTERM信号，正在关闭服务器...')
  await sequelize.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 收到SIGINT信号，正在关闭服务器...')
  await sequelize.close()
  process.exit(0)
})

startServer()
