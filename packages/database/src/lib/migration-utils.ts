import * as fs from 'fs';
import * as path from 'path';
import { mkdirp } from 'mkdirp';
import { Logger } from '@hl8/logger';

/**
 * 迁移工具类
 * 
 * 提供迁移文件操作的工具方法
 * 包括文件创建、目录创建、文件读取等功能
 * 
 * @description 迁移工具类，提供迁移文件操作的工具方法
 * 
 * ## 功能特性
 * 
 * ### 文件操作
 * - 创建迁移文件
 * - 读取迁移文件
 * - 检查文件存在性
 * 
 * ### 目录操作
 * - 创建迁移目录
 * - 递归目录创建
 * - 目录结构管理
 * 
 * ### 文件管理
 * - 文件内容写入
 * - 文件内容读取
 * - 文件覆盖控制
 * 
 * @example
 * ```typescript
 * import { MigrationUtils } from '@hl8/database';
 * 
 * // 创建迁移文件
 * await MigrationUtils.createFile('/path/to/migration.ts', content);
 * 
 * // 创建迁移目录
 * await MigrationUtils.createDirectories('/path/to/migrations');
 * 
 * // 检查文件是否存在
 * const exists = await MigrationUtils.fileExists('/path/to/file.ts');
 * ```
 * 
 * @since 1.0.0
 */
export class MigrationUtils {
	private static readonly logger = new Logger(MigrationUtils.name);

	/**
	 * 创建目录
	 * 
	 * @description 递归创建目录结构
	 * @param directory 目录路径
	 * @returns Promise<void> 创建完成时解析
	 * @throws {Error} 当目录创建失败时抛出错误
	 * 
	 * @example
	 * ```typescript
	 * await MigrationUtils.createDirectories('/path/to/migrations');
	 * ```
	 */
	static async createDirectories(directory: string): Promise<void> {
		try {
			await mkdirp(directory);
			this.logger.debug(`目录创建成功: ${directory}`);
		} catch (err) {
			this.logger.error(`目录创建失败: ${directory}`, err);
			throw err;
		}
	}

	/**
	 * 创建文件
	 * 
	 * @description 在指定路径创建文件并写入内容
	 * @param filePath 文件完整路径
	 * @param content 文件内容
	 * @param override 是否覆盖已存在的文件，默认为true
	 * @returns Promise<void> 文件创建完成时解析
	 * @throws {Error} 当文件创建失败时抛出错误
	 * 
	 * @example
	 * ```typescript
	 * await MigrationUtils.createFile('/path/to/migration.ts', content);
	 * ```
	 */
	static async createFile(filePath: string, content: string, override = true): Promise<void> {
		try {
			// 确保目录存在
			await this.createDirectories(path.dirname(filePath));
			
			// 检查文件是否已存在
			if (!override && await this.fileExists(filePath)) {
				this.logger.warn(`文件已存在，跳过创建: ${filePath}`);
				return;
			}

			// 创建文件
			return new Promise<void>((resolve, reject) => {
				fs.writeFile(filePath, content, (err) => {
					if (err) {
						this.logger.error(`文件创建失败: ${filePath}`, err);
						reject(err);
					} else {
						this.logger.debug(`文件创建成功: ${filePath}`);
						resolve();
					}
				});
			});
		} catch (error) {
			this.logger.error(`文件创建失败: ${filePath}`, error);
			throw error;
		}
	}

	/**
	 * 读取文件内容
	 * 
	 * @description 读取指定文件的内容
	 * @param filePath 文件路径
	 * @returns Promise<string> 文件内容
	 * @throws {Error} 当文件读取失败时抛出错误
	 * 
	 * @example
	 * ```typescript
	 * const content = await MigrationUtils.readFile('/path/to/migration.ts');
	 * ```
	 */
	static async readFile(filePath: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			fs.readFile(filePath, (err, data) => {
				if (err) {
					this.logger.error(`文件读取失败: ${filePath}`, err);
					reject(err);
				} else {
					this.logger.debug(`文件读取成功: ${filePath}`);
					resolve(data.toString());
				}
			});
		});
	}

	/**
	 * 检查文件是否存在
	 * 
	 * @description 检查指定路径的文件是否存在
	 * @param filePath 文件路径
	 * @returns Promise<boolean> 文件是否存在
	 * 
	 * @example
	 * ```typescript
	 * const exists = await MigrationUtils.fileExists('/path/to/file.ts');
	 * if (exists) {
	 *   // 文件存在
	 * }
	 * ```
	 */
	static async fileExists(filePath: string): Promise<boolean> {
		try {
			const exists = fs.existsSync(filePath);
			this.logger.debug(`文件存在性检查: ${filePath} - ${exists}`);
			return exists;
		} catch (error) {
			this.logger.error(`文件存在性检查失败: ${filePath}`, error);
			return false;
		}
	}

	/**
	 * 获取迁移文件模板
	 * 
	 * @description 生成迁移文件的模板内容
	 * @param name 迁移名称
	 * @param timestamp 时间戳
	 * @param database 数据库类型
	 * @returns 迁移文件模板内容
	 * 
	 * @example
	 * ```typescript
	 * const template = MigrationUtils.getMigrationTemplate('AddUserTable', Date.now(), 'postgresql');
	 * ```
	 */
	static getMigrationTemplate(
		name: string,
		timestamp: number,
		database: 'postgresql' | 'mongodb'
	): string {
		const className = this.toPascalCase(name);
		// const fileName = `${timestamp}-${name}`;

		return `import { Migration } from '@mikro-orm/migrations';
import { Logger } from '@hl8/logger';

/**
 * 迁移类: ${className}
 * 
 * @description ${name}迁移
 * 数据库类型: ${database}
 * 创建时间: ${new Date().toISOString()}
 * 
 * @since 1.0.0
 */
export class ${className}${timestamp} extends Migration {
    private readonly logger = new Logger('${className}${timestamp}');

    /**
     * 执行迁移
     * 
     * @description 执行数据库结构变更
     */
    async up(): Promise<void> {
        this.logger.log('开始执行迁移: ${name}');
        
        try {
            // TODO: 实现迁移逻辑
            // 示例: 创建表
            // await this.execute(\`CREATE TABLE IF NOT EXISTS users (
            //     id SERIAL PRIMARY KEY,
            //     name VARCHAR(255) NOT NULL,
            //     email VARCHAR(255) UNIQUE NOT NULL,
            //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            // )\`);
            
            this.logger.log('迁移执行完成: ${name}');
        } catch (error) {
            this.logger.error('迁移执行失败: ${name}', error);
            throw error;
        }
    }

    /**
     * 回滚迁移
     * 
     * @description 回滚数据库结构变更
     */
    async down(): Promise<void> {
        this.logger.log('开始回滚迁移: ${name}');
        
        try {
            // TODO: 实现回滚逻辑
            // 示例: 删除表
            // await this.execute('DROP TABLE IF EXISTS users');
            
            this.logger.log('迁移回滚完成: ${name}');
        } catch (error) {
            this.logger.error('迁移回滚失败: ${name}', error);
            throw error;
        }
    }
}`;
	}

	/**
	 * 获取迁移目录路径
	 * 
	 * @description 根据数据库类型获取迁移目录路径
	 * @param database 数据库类型
	 * @param basePath 基础路径
	 * @returns 迁移目录路径
	 * 
	 * @example
	 * ```typescript
	 * const migrationsPath = MigrationUtils.getMigrationsPath('postgresql', './dist');
	 * ```
	 */
	static getMigrationsPath(database: 'postgresql' | 'mongodb', basePath = './dist'): string {
		return path.join(basePath, 'migrations', database);
	}

	/**
	 * 获取种子数据目录路径
	 * 
	 * @description 根据数据库类型获取种子数据目录路径
	 * @param database 数据库类型
	 * @param basePath 基础路径
	 * @returns 种子数据目录路径
	 * 
	 * @example
	 * ```typescript
	 * const seedersPath = MigrationUtils.getSeedersPath('postgresql', './dist');
	 * ```
	 */
	static getSeedersPath(database: 'postgresql' | 'mongodb', basePath = './dist'): string {
		return path.join(basePath, 'seeders', database);
	}

	/**
	 * 验证迁移文件名
	 * 
	 * @description 验证迁移文件名是否符合规范
	 * @param fileName 文件名
	 * @returns 是否符合规范
	 * 
	 * @example
	 * ```typescript
	 * const isValid = MigrationUtils.validateMigrationFileName('1234567890-AddUserTable.ts');
	 * ```
	 */
	static validateMigrationFileName(fileName: string): boolean {
		const pattern = /^\d{13}-[a-zA-Z][a-zA-Z0-9]*\.(ts|js)$/;
		return pattern.test(fileName);
	}

	/**
	 * 解析迁移文件名
	 * 
	 * @description 解析迁移文件名，提取时间戳和名称
	 * @param fileName 文件名
	 * @returns 解析结果
	 * 
	 * @example
	 * ```typescript
	 * const parsed = MigrationUtils.parseMigrationFileName('1234567890-AddUserTable.ts');
	 * console.log(parsed.timestamp); // 1234567890
	 * console.log(parsed.name); // AddUserTable
	 * ```
	 */
	static parseMigrationFileName(fileName: string): { timestamp: number; name: string } | null {
		const match = fileName.match(/^(\d{13})-([a-zA-Z][a-zA-Z0-9]*)\.(ts|js)$/);
		if (!match) {
			return null;
		}

		return {
			timestamp: parseInt(match[1], 10),
			name: match[2]
		};
	}

	/**
	 * 转换为帕斯卡命名法
	 * 
	 * @description 将字符串转换为帕斯卡命名法
	 * @param str 输入字符串
	 * @returns 帕斯卡命名法字符串
	 * @private
	 * 
	 * @example
	 * ```typescript
	 * const pascalCase = MigrationUtils.toPascalCase('add-user-table');
	 * console.log(pascalCase); // AddUserTable
	 * ```
	 */
	private static toPascalCase(str: string): string {
		return str
			.split(/[-_\s]+/)
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join('');
	}
}
