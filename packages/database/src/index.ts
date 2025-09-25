/**
 * 数据库管理模块
 * 
 * 提供基于MikroORM的数据库管理功能，支持PostgreSQL和MongoDB
 * 包括连接管理、迁移管理、实体管理等功能
 * 
 * @description 数据库管理模块的入口文件，导出所有核心功能
 * @since 1.0.0
 */

// 导出数据库模块
export * from './lib/database.module';

// 导出连接管理器
export * from './lib/connection-manager';

// 导出迁移相关功能
export * from './lib/migration-executor';
export * from './lib/migration-interface';
export * from './lib/migration-utils';

// 导出数据库助手
export * from './lib/database.helper';

// 导出实体管理器
export * from './lib/entity-manager';