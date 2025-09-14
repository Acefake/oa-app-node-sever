const { DataTypes } = require('sequelize')

module.exports = sequelize => {
    const SystemConfig = sequelize.define(
        'SystemConfig',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '配置ID',
            },
            config_key: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                comment: '配置键',
            },
            config_value: {
                type: DataTypes.TEXT,
                allowNull: false,
                comment: '配置值',
            },
            description: {
                type: DataTypes.STRING(200),
                allowNull: true,
                comment: '配置描述',
            },
            type: {
                type: DataTypes.STRING(20),
                defaultValue: 'string',
                comment: '配置类型：string,number,boolean,json',
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                comment: '创建时间',
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                comment: '更新时间',
            },
        },
        {
            tableName: 'system_configs',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            comment: '系统配置表',
        }
    )

    return SystemConfig
}