import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import routes from './routes'
import { errorHandler, notFound } from './middleware/errorHandler'
import './models' // 导入模型以初始化关联

// 加载环境变量
dotenv.config()

const app = express()

// 安全中间件
app.use(helmet())

// CORS配置
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  })
)

// 请求日志
app.use(morgan('combined'))

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 解析Cookie
app.use(cookieParser())

// 静态文件服务
app.use('/uploads', express.static('uploads'))

// 注册路由
app.use(routes)

// 404处理
app.use(notFound)

// 错误处理
app.use(errorHandler)

export default app
