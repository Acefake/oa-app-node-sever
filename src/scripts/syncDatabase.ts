import sequelize from '../config/database'

const syncDatabase = async () => {
  try {
    console.log('🔄 开始同步数据库...')

    // 测试连接
    await sequelize.authenticate()
    console.log('✅ 数据库连接成功')

    // 同步模型（创建表，如果表已存在则保持现有结构）
    await sequelize.sync({ force: false })
    console.log('✅ 数据库表创建/更新完成')

    console.log('🎉 数据库同步完成！')
  } catch (error) {
    console.error('❌ 数据库同步失败:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

syncDatabase()
