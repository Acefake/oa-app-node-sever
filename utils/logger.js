const fs = require('fs')
const path = require('path')

// 日志工具
const logger = {
    info: (message, data = null) => {
        const timestamp = new Date().toISOString()
        console.log(
            `[${timestamp}] INFO: ${message}`,
            data ? JSON.stringify(data) : ''
        )
    },

    error: (message, error = null) => {
        const timestamp = new Date().toISOString()
        console.error(`[${timestamp}] ERROR: ${message}`, error)
    },

    warn: (message, data = null) => {
        const timestamp = new Date().toISOString()
        console.warn(
            `[${timestamp}] WARN: ${message}`,
            data ? JSON.stringify(data) : ''
        )
    },
}

module.exports = logger
