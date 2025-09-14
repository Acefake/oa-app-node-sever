const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config({ path: './config.env' })

const { testConnection } = require('./models')
const routes = require('./routes')

const app = express()

// 安全中间件
app.use(helmet())

// CORS 配置
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    })
)

// 请求日志
app.use(morgan('combined'))

// 请求体解析
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 限流
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP 15分钟内最多100个请求
    message: {
        success: false,
        message: '请求过于频繁，请稍后再试',
    },
})
app.use('/api/', limiter)

// 导入错误处理中间件
const { errorHandler, notFound } = require('./middleware/errorHandler')

// 全局错误处理中间件
app.use(errorHandler)

// API 路由
app.use('/api', routes)

// 404 处理
app.use('*', notFound)

// 启动服务器
const PORT = process.env.PORT || 3000

const startServer = async () => {
    try {
        // 测试数据库连接
        await testConnection()

        app.listen(PORT, () => {
            console.log(`🚀 服务器启动成功`)
            console.log(`📡 端口: ${PORT}`)
            console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
            console.log(
                `📊 数据库: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`
            )
        })
    } catch (error) {
        console.error('❌ 服务器启动失败:', error.message)
        process.exit(1)
    }
}

startServer()

module.exports = app
