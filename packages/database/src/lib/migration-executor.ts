import { Injectable } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { ConnectionManager } from './connection-manager';
import { Logger } from '@hl8/logger';
import * as chalk from 'chalk';
// import * as path from 'path';

/**
 * 迁移执行器
 * 
 * 负责执行数据库迁移操作，支持PostgreSQL和MongoDB
 * 包括迁移运行、回滚、生成等功能
 * 
 * @description 数据库迁移执行器，提供迁移管理功能
 * 
 * ## 功能特性
 * 
 * ### 迁移管理
 * - 运行待执行的迁移
 * - 回滚迁移
 * - 生成迁移文件
 * - 创建空白迁移
 * 
 * ### 多数据库支持
 * - PostgreSQL迁移
 * - MongoDB迁移
 * - 独立迁移管理
 * 
 * ### 迁移状态
 * - 迁移状态检查
 * - 迁移历史记录
 * - 迁移冲突检测
 * 
 * @example
 * ```typescript
 * import { MigrationExecutor } from '@hl8/database';
 * 
 * @Injectable()
 * export class MigrationService {
 *   constructor(private migrationExecutor: MigrationExecutor) {}
 * 
 *   async runMigrations() {
 *     await this.migrationExecutor.runMigrations('postgresql');
 *     await this.migrationExecutor.runMigrations('mongodb');
 *   }
 * }
 * ```
 * 
 * @since 1.0.0
 */
@Injectable()
export class MigrationExecutor {
	private readonly logger = new Logger(MigrationExecutor.name);

	constructor(private readonly connectionManager: ConnectionManager) {}

	/**
	 * 运行数据库迁移
	 * 
	 * @description 执行指定数据库的待执行迁移
	 * @param database 数据库类型 ('postgresql' | 'mongodb')
	 * @returns 迁移执行结果
	 * @throws {Error} 当迁移执行失败时抛出错误
	 * 
	 * @example
	 * ```typescript
	 * await this.migrationExecutor.runMigrations('postgresql');
	 * ```
	 */
	async runMigrations(database: 'postgresql' | 'mongodb'): Promise<void> {
		this.logger.log(`开始执行${database}数据库迁移...`);

		try {
			const orm = this.getMikroORM(database);
			const migrations = await orm.getMigrator().up();

			if (migrations && migrations.length > 0) {
				migrations.forEach((migration) => {
					console.log(chalk.green(`迁移 ${migration.name} 执行成功!`));
				});
				this.logger.log(`${database}数据库迁移执行完成，共执行${migrations.length}个迁移`);
			} else {
				console.log(chalk.yellow(`没有待执行的${database}数据库迁移`));
				this.logger.log(`${database}数据库没有待执行的迁移`);
			}
		} catch (error) {
			console.error(chalk.black.bgRed(`${database}数据库迁移执行失败:`));
			console.error(error);
			this.logger.error(`${database}数据库迁移执行失败`, error);
			throw error;
		}
	}

	/**
	 * 回滚最后一个迁移
	 * 
	 * @description 回滚指定数据库的最后一个迁移
	 * @param database 数据库类型
	 * @returns 回滚结果
	 * @throws {Error} 当回滚失败时抛出错误
	 * 
	 * @example
	 * ```typescript
	 * await this.migrationExecutor.revertLastMigration('postgresql');
	 * ```
	 */
	async revertLastMigration(database: 'postgresql' | 'mongodb'): Promise<void> {
		this.logger.log(`开始回滚${database}数据库最后一个迁移...`);

		try {
			const orm = this.getMikroORM(database);
			await orm.getMigrator().down();

			console.log(chalk.green(`${database}数据库最后一个迁移回滚成功!`));
			this.logger.log(`${database}数据库迁移回滚完成`);
		} catch (error) {
			console.error(chalk.black.bgRed(`${database}数据库迁移回滚失败:`));
			console.error(error);
			this.logger.error(`${database}数据库迁移回滚失败`, error);
			throw error;
		}
	}

	/**
	 * 生成迁移文件
	 * 
	 * @description 根据实体变更生成迁移文件
	 * @param database 数据库类型
	 * @param name 迁移名称
	 * @returns 迁移生成结果
	 * @throws {Error} 当迁移生成失败时抛出错误
	 * 
	 * @example
	 * ```typescript
	 * await this.migrationExecutor.generateMigration('postgresql', 'AddUserTable');
	 * ```
	 */
	async generateMigration(
		database: 'postgresql' | 'mongodb',
		name: string
	): Promise<void> {
		if (!name) {
			console.log(chalk.yellow('迁移名称是必需的，请指定迁移名称!'));
			return;
		}

		this.logger.log(`开始生成${database}数据库迁移: ${name}`);

		try {
			const orm = this.getMikroORM(database);
			const migration = await orm.getMigrator().createMigration();

			if (migration) {
				console.log(chalk.green(`迁移 ${chalk.blue(migration.fileName)} 生成成功`));
				this.logger.log(`${database}数据库迁移生成完成: ${migration.fileName}`);
			} else {
				console.log(chalk.yellow(`没有检测到${database}数据库架构变更，无法生成迁移`));
				this.logger.log(`${database}数据库没有架构变更`);
			}
		} catch (error) {
			console.error(chalk.red(`❌ ${database}数据库迁移生成失败:`));
			console.error(error);
			this.logger.error(`${database}数据库迁移生成失败`, error);
			throw error;
		}
	}

	/**
	 * 创建空白迁移
	 * 
	 * @description 创建空白的迁移文件
	 * @param database 数据库类型
	 * @param name 迁移名称
	 * @returns 迁移创建结果
	 * @throws {Error} 当迁移创建失败时抛出错误
	 * 
	 * @example
	 * ```typescript
	 * await this.migrationExecutor.createMigration('postgresql', 'CustomMigration');
	 * ```
	 */
	async createMigration(
		database: 'postgresql' | 'mongodb',
		name: string
	): Promise<void> {
		if (!name) {
			console.log(chalk.yellow('迁移名称是必需的，请指定迁移名称!'));
			return;
		}

		this.logger.log(`开始创建${database}数据库空白迁移: ${name}`);

		try {
			const orm = this.getMikroORM(database);
			const migration = await orm.getMigrator().createMigration(name);

			if (migration) {
				console.log(chalk.green(`空白迁移 ${chalk.blue(migration.fileName)} 创建成功`));
				this.logger.log(`${database}数据库空白迁移创建完成: ${migration.fileName}`);
			}
		} catch (error) {
			console.error(chalk.red(`❌ ${database}数据库空白迁移创建失败:`));
			console.error(error);
			this.logger.error(`${database}数据库空白迁移创建失败`, error);
			throw error;
		}
	}

	/**
	 * 检查迁移状态
	 * 
	 * @description 检查指定数据库的迁移状态
	 * @param database 数据库类型
	 * @returns 迁移状态信息
	 * 
	 * @example
	 * ```typescript
	 * const status = await this.migrationExecutor.getMigrationStatus('postgresql');
	 * console.log('待执行迁移:', status.pending);
	 * console.log('已执行迁移:', status.executed);
	 * ```
	 */
	async getMigrationStatus(database: 'postgresql' | 'mongodb'): Promise<{
		pending: string[];
		executed: string[];
	}> {
		try {
			const orm = this.getMikroORM(database);
			const pending = await orm.getMigrator().getPendingMigrations();
			const executed = await orm.getMigrator().getExecutedMigrations();

			return {
				pending: pending.map(m => m.name),
				executed: executed.map(m => m.name)
			};
		} catch (error) {
			this.logger.error(`获取${database}数据库迁移状态失败`, error);
			throw error;
		}
	}

	/**
	 * 获取迁移历史
	 * 
	 * @description 获取指定数据库的迁移历史记录
	 * @param database 数据库类型
	 * @returns 迁移历史记录
	 * 
	 * @example
	 * ```typescript
	 * const history = await this.migrationExecutor.getMigrationHistory('postgresql');
	 * history.forEach(migration => {
	 *   console.log(`${migration.name} - ${migration.executedAt}`);
	 * });
	 * ```
	 */
	async getMigrationHistory(database: 'postgresql' | 'mongodb'): Promise<Array<{
		name: string;
		executedAt: Date;
	}>> {
		try {
			const orm = this.getMikroORM(database);
			const executed = await orm.getMigrator().getExecutedMigrations();

			return executed.map(migration => ({
				name: migration.name,
				executedAt: migration.executedAt
			}));
		} catch (error) {
			this.logger.error(`获取${database}数据库迁移历史失败`, error);
			throw error;
		}
	}

	/**
	 * 获取MikroORM实例
	 * 
	 * @description 根据数据库类型获取MikroORM实例
	 * @param database 数据库类型
	 * @returns MikroORM实例
	 * @private
	 */
	private getMikroORM(database: 'postgresql' | 'mongodb'): MikroORM {
		switch (database) {
			case 'postgresql':
				return this.connectionManager.getPostgresConnection().getKnex();
			case 'mongodb':
				return this.connectionManager.getMongoConnection().getKnex();
			default:
				throw new Error(`不支持的数据库类型: ${database}`);
		}
	}
}
