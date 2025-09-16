import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: './config.env' })

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'oa_sys',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  timezone: '+08:00',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: false, // 不使用Sequelize的默认时间戳
    freezeTableName: true, // 使用表名而不是复数形式
    underscored: false // 使用驼峰命名而不是下划线
  }
})

// 测试数据库连接
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
  } catch (error) {
    console.error('数据库连接失败:', error)
    throw error
  }
}

export default sequelize
