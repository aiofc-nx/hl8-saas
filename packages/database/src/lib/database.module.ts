import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@hl8/config';
import { ConnectionManager } from './connection-manager';
import { EntityManagerService } from './entity-manager';

/**
 * 数据库管理模块
 * 
 * 提供基于MikroORM的数据库管理功能，支持PostgreSQL和MongoDB
 * 包括连接管理、迁移管理、实体管理等功能
 * 
 * @description 全局数据库模块，提供数据库连接和实体管理服务
 * 
 * ## 功能特性
 * 
 * ### 多数据库支持
 * - PostgreSQL: 关系型数据库，用于结构化数据存储
 * - MongoDB: 文档数据库，用于非结构化数据存储
 * 
 * ### 连接管理
 * - 自动连接管理
 * - 连接池配置
 * - 健康检查
 * 
 * ### 实体管理
 * - 实体注册
 * - 实体关系管理
 * - 实体生命周期管理
 * 
 * ### 迁移管理
 * - 数据库迁移
 * - 版本控制
 * - 回滚支持
 * 
 * @example
 * ```typescript
 * import { DatabaseModule } from '@hl8/database';
 * 
 * @Module({
 *   imports: [DatabaseModule],
 *   providers: [MyService]
 * })
 * export class AppModule {}
 * ```
 * 
 * @since 1.0.0
 */
@Global()
@Module({
	imports: [
		/**
		 * PostgreSQL数据库连接配置
		 * 
		 * @description 配置PostgreSQL数据库连接，用于关系型数据存储
		 */
		MikroOrmModule.forRootAsync({
			name: 'postgresql',
			useFactory: async (configService: ConfigService) => {
				const postgresConfig = configService.getConfigValue('database.postgresql');
				return {
					...postgresConfig,
					entities: postgresConfig.entities || [],
					entitiesTs: postgresConfig.entitiesTs || [],
					migrations: {
						path: postgresConfig.migrations?.path || './dist/migrations/postgresql',
						pattern: /^[\w-]+\d+\.(ts|js)$/,
					},
					seeder: {
						path: postgresConfig.seeder?.path || './dist/seeders/postgresql',
						pattern: /^[\w-]+\.(ts|js)$/,
					},
				};
			},
			imports: [ConfigModule],
			inject: [ConfigService]
		}),
		/**
		 * MongoDB数据库连接配置
		 * 
		 * @description 配置MongoDB数据库连接，用于文档数据存储
		 */
		MikroOrmModule.forRootAsync({
			name: 'mongodb',
			useFactory: async (configService: ConfigService) => {
				const mongoConfig = configService.getConfigValue('database.mongodb');
				return {
					...mongoConfig,
					entities: mongoConfig.entities || [],
					entitiesTs: mongoConfig.entitiesTs || [],
					migrations: {
						path: mongoConfig.migrations?.path || './dist/migrations/mongodb',
						pattern: /^[\w-]+\d+\.(ts|js)$/,
					},
					seeder: {
						path: mongoConfig.seeder?.path || './dist/seeders/mongodb',
						pattern: /^[\w-]+\.(ts|js)$/,
					},
				};
			},
			imports: [ConfigModule],
			inject: [ConfigService]
		})
	],
	providers: [
		ConnectionManager,
		EntityManagerService
	],
	exports: [
		ConnectionManager,
		EntityManagerService,
		MikroOrmModule
	]
})
export class DatabaseModule {}
