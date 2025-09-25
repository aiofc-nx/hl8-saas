import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository, FilterQuery, FindOptions, CountOptions } from '@mikro-orm/core';
import { ConnectionManager } from './connection-manager';
import { Logger } from '@hl8/logger';

/**
 * 实体管理器服务
 * 
 * 提供统一的实体管理接口，支持PostgreSQL和MongoDB实体操作
 * 包括CRUD操作、查询构建、事务管理等功能
 * 
 * @description 实体管理器服务，提供统一的实体操作接口
 * 
 * ## 功能特性
 * 
 * ### 多数据库支持
 * - PostgreSQL实体操作
 * - MongoDB实体操作
 * - 统一的操作接口
 * 
 * ### CRUD操作
 * - 创建实体
 * - 查询实体
 * - 更新实体
 * - 删除实体
 * 
 * ### 查询构建
 * - 条件查询
 * - 分页查询
 * - 排序查询
 * - 关联查询
 * 
 * ### 事务管理
 * - 事务支持
 * - 回滚机制
 * - 嵌套事务
 * 
 * @example
 * ```typescript
 * import { EntityManagerService } from '@hl8/database';
 * 
 * @Injectable()
 * export class UserService {
 *   constructor(private entityManager: EntityManagerService) {}
 * 
 *   async createUser(userData: CreateUserDto) {
 *     return this.entityManager.create('postgresql', User, userData);
 *   }
 * 
 *   async findUsers(conditions: any) {
 *     return this.entityManager.find('postgresql', User, conditions);
 *   }
 * }
 * ```
 * 
 * @since 1.0.0
 */
@Injectable()
export class EntityManagerService {
	private readonly logger = new Logger(EntityManagerService.name);

	constructor(private readonly connectionManager: ConnectionManager) {}

	/**
	 * 创建实体
	 * 
	 * @description 在指定数据库中创建新实体
	 * @param database 数据库类型 ('postgresql' | 'mongodb')
	 * @param entityClass 实体类
	 * @param data 实体数据
	 * @returns 创建的实体实例
	 * @throws {Error} 当数据库类型不支持或创建失败时抛出错误
	 * 
	 * @example
	 * ```typescript
	 * const user = await this.entityManager.create('postgresql', User, {
	 *   name: 'John Doe',
	 *   email: 'john@example.com'
	 * });
	 * ```
	 */
	async create<T>(
		database: 'postgresql' | 'mongodb',
		entityClass: new () => T,
		data: Partial<T>
	): Promise<T> {
		try {
			const em = this.getEntityManager(database);
			const entity = em.create(entityClass, data);
			await em.persistAndFlush(entity);
			
			this.logger.debug(`实体已创建: ${entityClass.name}`, { database, entity });
			return entity;
		} catch (error) {
			this.logger.error(`创建实体失败: ${entityClass.name}`, error);
			throw error;
		}
	}

	/**
	 * 查找单个实体
	 * 
	 * @description 根据条件查找单个实体
	 * @param database 数据库类型
	 * @param entityClass 实体类
	 * @param where 查询条件
	 * @param options 查询选项
	 * @returns 找到的实体或null
	 * 
	 * @example
	 * ```typescript
	 * const user = await this.entityManager.findOne('postgresql', User, { id: 1 });
	 * ```
	 */
	async findOne<T>(
		database: 'postgresql' | 'mongodb',
		entityClass: new () => T,
		where: FilterQuery<T>,
		options?: FindOptions<T>
	): Promise<T | null> {
		try {
			const em = this.getEntityManager(database);
			const entity = await em.findOne(entityClass, where, options);
			
			this.logger.debug(`查找实体: ${entityClass.name}`, { database, where, found: !!entity });
			return entity;
		} catch (error) {
			this.logger.error(`查找实体失败: ${entityClass.name}`, error);
			throw error;
		}
	}

	/**
	 * 查找多个实体
	 * 
	 * @description 根据条件查找多个实体
	 * @param database 数据库类型
	 * @param entityClass 实体类
	 * @param where 查询条件
	 * @param options 查询选项
	 * @returns 实体数组
	 * 
	 * @example
	 * ```typescript
	 * const users = await this.entityManager.find('postgresql', User, { active: true });
	 * ```
	 */
	async find<T>(
		database: 'postgresql' | 'mongodb',
		entityClass: new () => T,
		where: FilterQuery<T>,
		options?: FindOptions<T>
	): Promise<T[]> {
		try {
			const em = this.getEntityManager(database);
			const entities = await em.find(entityClass, where, options);
			
			this.logger.debug(`查找实体列表: ${entityClass.name}`, { database, where, count: entities.length });
			return entities;
		} catch (error) {
			this.logger.error(`查找实体列表失败: ${entityClass.name}`, error);
			throw error;
		}
	}

	/**
	 * 更新实体
	 * 
	 * @description 更新指定实体
	 * @param database 数据库类型
	 * @param entity 实体实例
	 * @returns 更新后的实体
	 * 
	 * @example
	 * ```typescript
	 * const updatedUser = await this.entityManager.update('postgresql', user);
	 * ```
	 */
	async update<T>(
		database: 'postgresql' | 'mongodb',
		entity: T
	): Promise<T> {
		try {
			const em = this.getEntityManager(database);
			await em.persistAndFlush(entity);
			
			this.logger.debug(`实体已更新: ${entity.constructor.name}`, { database });
			return entity;
		} catch (error) {
			this.logger.error(`更新实体失败: ${entity.constructor.name}`, error);
			throw error;
		}
	}

	/**
	 * 删除实体
	 * 
	 * @description 删除指定实体
	 * @param database 数据库类型
	 * @param entity 实体实例
	 * @returns 删除结果
	 * 
	 * @example
	 * ```typescript
	 * await this.entityManager.remove('postgresql', user);
	 * ```
	 */
	async remove<T>(
		database: 'postgresql' | 'mongodb',
		entity: T
	): Promise<void> {
		try {
			const em = this.getEntityManager(database);
			await em.removeAndFlush(entity);
			
			this.logger.debug(`实体已删除: ${entity.constructor.name}`, { database });
		} catch (error) {
			this.logger.error(`删除实体失败: ${entity.constructor.name}`, error);
			throw error;
		}
	}

	/**
	 * 统计实体数量
	 * 
	 * @description 统计符合条件的实体数量
	 * @param database 数据库类型
	 * @param entityClass 实体类
	 * @param where 查询条件
	 * @param options 查询选项
	 * @returns 实体数量
	 * 
	 * @example
	 * ```typescript
	 * const count = await this.entityManager.count('postgresql', User, { active: true });
	 * ```
	 */
	async count<T>(
		database: 'postgresql' | 'mongodb',
		entityClass: new () => T,
		where: FilterQuery<T>,
		options?: CountOptions<T>
	): Promise<number> {
		try {
			const em = this.getEntityManager(database);
			const count = await em.count(entityClass, where, options);
			
			this.logger.debug(`统计实体数量: ${entityClass.name}`, { database, where, count });
			return count;
		} catch (error) {
			this.logger.error(`统计实体数量失败: ${entityClass.name}`, error);
			throw error;
		}
	}

	/**
	 * 执行事务
	 * 
	 * @description 在指定数据库中执行事务
	 * @param database 数据库类型
	 * @param callback 事务回调函数
	 * @returns 事务执行结果
	 * 
	 * @example
	 * ```typescript
	 * const result = await this.entityManager.transaction('postgresql', async (em) => {
	 *   const user = em.create(User, userData);
	 *   await em.persistAndFlush(user);
	 *   return user;
	 * });
	 * ```
	 */
	async transaction<T>(
		database: 'postgresql' | 'mongodb',
		callback: (em: EntityManager) => Promise<T>
	): Promise<T> {
		try {
			const em = this.getEntityManager(database);
			const result = await em.transactional(callback);
			
			this.logger.debug(`事务执行完成: ${database}`);
			return result;
		} catch (error) {
			this.logger.error(`事务执行失败: ${database}`, error);
			throw error;
		}
	}

	/**
	 * 获取实体仓库
	 * 
	 * @description 获取指定实体的仓库
	 * @param database 数据库类型
	 * @param entityClass 实体类
	 * @returns 实体仓库
	 * 
	 * @example
	 * ```typescript
	 * const userRepo = this.entityManager.getRepository('postgresql', User);
	 * const users = await userRepo.findAll();
	 * ```
	 */
	getRepository<T>(
		database: 'postgresql' | 'mongodb',
		entityClass: new () => T
	): EntityRepository<T> {
		return this.getEntityManager(database).getRepository(entityClass);
	}

	/**
	 * 获取EntityManager实例
	 * 
	 * @description 根据数据库类型获取EntityManager实例
	 * @param database 数据库类型
	 * @returns EntityManager实例
	 * @private
	 */
	private getEntityManager(database: 'postgresql' | 'mongodb'): EntityManager {
		switch (database) {
			case 'postgresql':
				return this.connectionManager.getPostgresConnection();
			case 'mongodb':
				return this.connectionManager.getMongoConnection();
			default:
				throw new Error(`不支持的数据库类型: ${database}`);
		}
	}
}
