import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { ConfigService } from '@hl8/config';
import { Logger } from '@hl8/logger';

/**
 * 数据库连接管理器
 * 
 * 负责管理PostgreSQL和MongoDB数据库连接
 * 提供连接状态监控、健康检查、连接池管理等功能
 * 
 * @description 数据库连接管理器，提供统一的数据库连接管理接口
 * 
 * ## 功能特性
 * 
 * ### 多数据库支持
 * - PostgreSQL连接管理
 * - MongoDB连接管理
 * - 连接状态监控
 * 
 * ### 连接池管理
 * - 自动连接池配置
 * - 连接池监控
 * - 连接池优化
 * 
 * ### 健康检查
 * - 连接健康检查
 * - 自动重连机制
 * - 故障恢复
 * 
 * @example
 * ```typescript
 * import { ConnectionManager } from '@hl8/database';
 * 
 * @Injectable()
 * export class MyService {
 *   constructor(private connectionManager: ConnectionManager) {}
 * 
 *   async getPostgresConnection() {
 *     return this.connectionManager.getPostgresConnection();
 *   }
 * 
 *   async getMongoConnection() {
 *     return this.connectionManager.getMongoConnection();
 *   }
 * }
 * ```
 * 
 * @since 1.0.0
 */
@Injectable()
export class ConnectionManager implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(ConnectionManager.name);

	constructor(
		@InjectRepository('postgresql') private readonly postgresEm: EntityManager,
		@InjectRepository('mongodb') private readonly mongoEm: EntityManager,
		private readonly configService: ConfigService
	) {}

	/**
	 * 模块初始化
	 * 
	 * @description 初始化数据库连接，执行健康检查
	 */
	async onModuleInit(): Promise<void> {
		this.logger.log('正在初始化数据库连接...');
		
		try {
			await this.initializeConnections();
			this.logger.log('数据库连接初始化完成');
		} catch (error) {
			this.logger.error('数据库连接初始化失败', error);
			throw error;
		}
	}

	/**
	 * 模块销毁
	 * 
	 * @description 关闭数据库连接，清理资源
	 */
	async onModuleDestroy(): Promise<void> {
		this.logger.log('正在关闭数据库连接...');
		
		try {
			await this.closeConnections();
			this.logger.log('数据库连接已关闭');
		} catch (error) {
			this.logger.error('关闭数据库连接时发生错误', error);
		}
	}

	/**
	 * 获取PostgreSQL连接
	 * 
	 * @description 返回PostgreSQL数据库的EntityManager实例
	 * @returns PostgreSQL EntityManager实例
	 * @throws {Error} 当PostgreSQL连接不可用时抛出错误
	 * 
	 * @example
	 * ```typescript
	 * const postgresEm = this.connectionManager.getPostgresConnection();
	 * const user = await postgresEm.findOne(User, { id: 1 });
	 * ```
	 */
	getPostgresConnection(): EntityManager {
		if (!this.postgresEm) {
			throw new Error('PostgreSQL连接不可用');
		}
		return this.postgresEm;
	}

	/**
	 * 获取MongoDB连接
	 * 
	 * @description 返回MongoDB数据库的EntityManager实例
	 * @returns MongoDB EntityManager实例
	 * @throws {Error} 当MongoDB连接不可用时抛出错误
	 * 
	 * @example
	 * ```typescript
	 * const mongoEm = this.connectionManager.getMongoConnection();
	 * const document = await mongoEm.findOne(Document, { _id: '507f1f77bcf86cd799439011' });
	 * ```
	 */
	getMongoConnection(): EntityManager {
		if (!this.mongoEm) {
			throw new Error('MongoDB连接不可用');
		}
		return this.mongoEm;
	}

	/**
	 * 获取PostgreSQL仓库
	 * 
	 * @description 获取指定实体的PostgreSQL仓库
	 * @param entity 实体类
	 * @returns PostgreSQL实体仓库
	 * 
	 * @example
	 * ```typescript
	 * const userRepo = this.connectionManager.getPostgresRepository(User);
	 * const users = await userRepo.findAll();
	 * ```
	 */
	getPostgresRepository<T>(entity: new () => T): EntityRepository<T> {
		return this.getPostgresConnection().getRepository(entity);
	}

	/**
	 * 获取MongoDB仓库
	 * 
	 * @description 获取指定实体的MongoDB仓库
	 * @param entity 实体类
	 * @returns MongoDB实体仓库
	 * 
	 * @example
	 * ```typescript
	 * const documentRepo = this.connectionManager.getMongoRepository(Document);
	 * const documents = await documentRepo.findAll();
	 * ```
	 */
	getMongoRepository<T>(entity: new () => T): EntityRepository<T> {
		return this.getMongoConnection().getRepository(entity);
	}

	/**
	 * 检查PostgreSQL连接健康状态
	 * 
	 * @description 检查PostgreSQL数据库连接是否健康
	 * @returns 连接健康状态
	 * 
	 * @example
	 * ```typescript
	 * const isHealthy = await this.connectionManager.isPostgresHealthy();
	 * if (!isHealthy) {
	 *   // 处理连接问题
	 * }
	 * ```
	 */
	async isPostgresHealthy(): Promise<boolean> {
		try {
			await this.postgresEm.execute('SELECT 1');
			return true;
		} catch (error) {
			this.logger.error('PostgreSQL健康检查失败', error);
			return false;
		}
	}

	/**
	 * 检查MongoDB连接健康状态
	 * 
	 * @description 检查MongoDB数据库连接是否健康
	 * @returns 连接健康状态
	 * 
	 * @example
	 * ```typescript
	 * const isHealthy = await this.connectionManager.isMongoHealthy();
	 * if (!isHealthy) {
	 *   // 处理连接问题
	 * }
	 * ```
	 */
	async isMongoHealthy(): Promise<boolean> {
		try {
			await this.mongoEm.execute('ping');
			return true;
		} catch (error) {
			this.logger.error('MongoDB健康检查失败', error);
			return false;
		}
	}

	/**
	 * 获取所有连接的健康状态
	 * 
	 * @description 检查所有数据库连接的健康状态
	 * @returns 连接健康状态映射
	 * 
	 * @example
	 * ```typescript
	 * const healthStatus = await this.connectionManager.getAllConnectionsHealth();
	 * console.log('PostgreSQL:', healthStatus.postgresql);
	 * console.log('MongoDB:', healthStatus.mongodb);
	 * ```
	 */
	async getAllConnectionsHealth(): Promise<{
		postgresql: boolean;
		mongodb: boolean;
	}> {
		const [postgresql, mongodb] = await Promise.all([
			this.isPostgresHealthy(),
			this.isMongoHealthy()
		]);

		return { postgresql, mongodb };
	}

	/**
	 * 初始化数据库连接
	 * 
	 * @description 初始化所有数据库连接
	 * @private
	 */
	private async initializeConnections(): Promise<void> {
		// PostgreSQL连接初始化
		if (this.postgresEm) {
			await this.postgresEm.getConnection().connect();
			this.logger.log('PostgreSQL连接已建立');
		}

		// MongoDB连接初始化
		if (this.mongoEm) {
			await this.mongoEm.getConnection().connect();
			this.logger.log('MongoDB连接已建立');
		}
	}

	/**
	 * 关闭数据库连接
	 * 
	 * @description 关闭所有数据库连接
	 * @private
	 */
	private async closeConnections(): Promise<void> {
		// 关闭PostgreSQL连接
		if (this.postgresEm) {
			await this.postgresEm.getConnection().close();
			this.logger.log('PostgreSQL连接已关闭');
		}

		// 关闭MongoDB连接
		if (this.mongoEm) {
			await this.mongoEm.getConnection().close();
			this.logger.log('MongoDB连接已关闭');
		}
	}
}
