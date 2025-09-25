import { Logger } from '@hl8/logger';

/**
 * 数据库助手工具
 * 
 * 提供数据库操作的工具方法和辅助功能
 * 包括SQL查询处理、数据库类型检测、连接字符串处理等
 * 
 * @description 数据库助手工具类，提供数据库操作的辅助功能
 * 
 * ## 功能特性
 * 
 * ### SQL处理
 * - SQL查询格式化
 * - 参数绑定
 * - 查询优化
 * 
 * ### 数据库类型检测
 * - 数据库类型识别
 * - 特性检测
 * - 兼容性检查
 * 
 * ### 连接管理
 * - 连接字符串解析
 * - 连接参数验证
 * - 连接池配置
 * 
 * @example
 * ```typescript
 * import { DatabaseHelper } from '@hl8/database';
 * 
 * // 格式化SQL查询
 * const formattedQuery = DatabaseHelper.formatSQLQuery(query, params);
 * 
 * // 检测数据库类型
 * const dbType = DatabaseHelper.detectDatabaseType(connectionString);
 * 
 * // 验证连接参数
 * const isValid = DatabaseHelper.validateConnectionParams(params);
 * ```
 * 
 * @since 1.0.0
 */
export class DatabaseHelper {
	private static readonly logger = new Logger(DatabaseHelper.name);

	/**
	 * 数据库类型枚举
	 */
	static readonly DatabaseType = {
		POSTGRESQL: 'postgresql',
		MONGODB: 'mongodb',
		MYSQL: 'mysql',
		SQLITE: 'sqlite',
		MARIADB: 'mariadb'
	} as const;

	/**
	 * 格式化SQL查询
	 * 
	 * @description 根据数据库类型格式化SQL查询，处理不同数据库的语法差异
	 * @param query SQL查询字符串
	 * @param databaseType 数据库类型
	 * @returns 格式化后的SQL查询
	 * 
	 * @example
	 * ```typescript
	 * const formattedQuery = DatabaseHelper.formatSQLQuery(
	 *   'SELECT * FROM "users" WHERE "id" = ?',
	 *   'postgresql'
	 * );
	 * ```
	 */
	static formatSQLQuery(query: string, databaseType = 'postgresql'): string {
		try {
			switch (databaseType.toLowerCase()) {
				case 'mysql':
				case 'mariadb':
					// MySQL使用反引号而不是双引号
					return query.replace(/"/g, '`');
				case 'postgresql':
					// PostgreSQL使用双引号
					return query;
				case 'sqlite':
					// SQLite使用方括号
					return query.replace(/"/g, '[').replace(/"/g, ']');
				default:
					this.logger.warn(`未知的数据库类型: ${databaseType}`);
					return query;
			}
		} catch (error) {
			this.logger.error('SQL查询格式化失败', error);
			return query;
		}
	}

	/**
	 * 检测数据库类型
	 * 
	 * @description 根据连接字符串检测数据库类型
	 * @param connectionString 数据库连接字符串
	 * @returns 检测到的数据库类型
	 * 
	 * @example
	 * ```typescript
	 * const dbType = DatabaseHelper.detectDatabaseType('postgresql://user:pass@localhost:5432/db');
	 * console.log(dbType); // 'postgresql'
	 * ```
	 */
	static detectDatabaseType(connectionString: string): string {
		try {
			if (connectionString.startsWith('postgresql://') || connectionString.startsWith('postgres://')) {
				return this.DatabaseType.POSTGRESQL;
			}
			if (connectionString.startsWith('mongodb://') || connectionString.startsWith('mongodb+srv://')) {
				return this.DatabaseType.MONGODB;
			}
			if (connectionString.startsWith('mysql://')) {
				return this.DatabaseType.MYSQL;
			}
			if (connectionString.startsWith('sqlite://') || connectionString.endsWith('.db') || connectionString.endsWith('.sqlite')) {
				return this.DatabaseType.SQLITE;
			}
			if (connectionString.startsWith('mariadb://')) {
				return this.DatabaseType.MARIADB;
			}

			this.logger.warn(`无法识别的数据库类型: ${connectionString}`);
			return 'unknown';
		} catch {
			this.logger.error('数据库类型检测失败');
			return 'unknown';
		}
	}

	/**
	 * 验证连接参数
	 * 
	 * @description 验证数据库连接参数的有效性
	 * @param params 连接参数
	 * @returns 验证结果
	 * 
	 * @example
	 * ```typescript
	 * const isValid = DatabaseHelper.validateConnectionParams({
	 *   host: 'localhost',
	 *   port: 5432,
	 *   database: 'mydb',
	 *   username: 'user',
	 *   password: 'pass'
	 * });
	 * ```
	 */
	static validateConnectionParams(params: {
		host?: string;
		port?: number;
		database?: string;
		username?: string;
		password?: string;
		url?: string;
	}): { isValid: boolean; errors: string[] } {
		const errors: string[] = [];

		// 如果有URL，验证URL格式
		if (params.url) {
			try {
				new URL(params.url);
			} catch {
				errors.push('无效的连接URL格式');
			}
		} else {
			// 验证单独的参数
			if (!params.host) {
				errors.push('主机地址是必需的');
			}
			if (!params.port || params.port <= 0 || params.port > 65535) {
				errors.push('端口号必须是1-65535之间的数字');
			}
			if (!params.database) {
				errors.push('数据库名称是必需的');
			}
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}

	/**
	 * 生成连接字符串
	 * 
	 * @description 根据连接参数生成数据库连接字符串
	 * @param params 连接参数
	 * @param databaseType 数据库类型
	 * @returns 连接字符串
	 * 
	 * @example
	 * ```typescript
	 * const connectionString = DatabaseHelper.generateConnectionString({
	 *   host: 'localhost',
	 *   port: 5432,
	 *   database: 'mydb',
	 *   username: 'user',
	 *   password: 'pass'
	 * }, 'postgresql');
	 * ```
	 */
	static generateConnectionString(
		params: {
			host: string;
			port: number;
			database: string;
			username: string;
			password: string;
		},
		databaseType = 'postgresql'
	): string {
		try {
			switch (databaseType.toLowerCase()) {
				case 'postgresql':
					return `postgresql://${params.username}:${params.password}@${params.host}:${params.port}/${params.database}`;
				case 'mongodb':
					return `mongodb://${params.username}:${params.password}@${params.host}:${params.port}/${params.database}`;
				case 'mysql':
				case 'mariadb':
					return `mysql://${params.username}:${params.password}@${params.host}:${params.port}/${params.database}`;
				case 'sqlite':
					return `sqlite://${params.database}`;
				default:
					throw new Error(`不支持的数据库类型: ${databaseType}`);
			}
		} catch (error) {
			this.logger.error('连接字符串生成失败', error);
			throw error;
		}
	}

	/**
	 * 解析连接字符串
	 * 
	 * @description 解析数据库连接字符串，提取连接参数
	 * @param connectionString 连接字符串
	 * @returns 解析后的连接参数
	 * 
	 * @example
	 * ```typescript
	 * const params = DatabaseHelper.parseConnectionString('postgresql://user:pass@localhost:5432/mydb');
	 * console.log(params.host); // 'localhost'
	 * console.log(params.port); // 5432
	 * ```
	 */
	static parseConnectionString(connectionString: string): {
		protocol: string;
		host: string;
		port: number;
		database: string;
		username: string;
		password: string;
	} {
		try {
			const url = new URL(connectionString);
			
			return {
				protocol: url.protocol.replace(':', ''),
				host: url.hostname,
				port: parseInt(url.port, 10) || this.getDefaultPort(url.protocol),
				database: url.pathname.replace('/', ''),
				username: url.username,
				password: url.password
			};
		} catch (error) {
			this.logger.error('连接字符串解析失败', error);
			throw error;
		}
	}

	/**
	 * 获取默认端口
	 * 
	 * @description 根据协议获取默认端口号
	 * @param protocol 协议
	 * @returns 默认端口号
	 * @private
	 */
	private static getDefaultPort(protocol: string): number {
		switch (protocol.replace(':', '')) {
			case 'postgresql':
			case 'postgres':
				return 5432;
			case 'mongodb':
				return 27017;
			case 'mysql':
				return 3306;
			case 'mariadb':
				return 3306;
			case 'sqlite':
				return 0;
			default:
				return 0;
		}
	}

	/**
	 * 检查数据库特性支持
	 * 
	 * @description 检查数据库是否支持特定特性
	 * @param databaseType 数据库类型
	 * @param feature 特性名称
	 * @returns 是否支持该特性
	 * 
	 * @example
	 * ```typescript
	 * const supportsJSON = DatabaseHelper.supportsFeature('postgresql', 'json');
	 * const supportsTransactions = DatabaseHelper.supportsFeature('mongodb', 'transactions');
	 * ```
	 */
	static supportsFeature(databaseType: string, feature: string): boolean {
		const features = {
			postgresql: ['json', 'jsonb', 'arrays', 'transactions', 'foreign_keys', 'indexes', 'views', 'functions'],
			mongodb: ['json', 'transactions', 'indexes', 'aggregation', 'replication', 'sharding'],
			mysql: ['json', 'transactions', 'foreign_keys', 'indexes', 'views', 'functions'],
			mariadb: ['json', 'transactions', 'foreign_keys', 'indexes', 'views', 'functions'],
			sqlite: ['json', 'transactions', 'foreign_keys', 'indexes', 'views']
		};

		const dbFeatures = features[databaseType.toLowerCase() as keyof typeof features];
		return dbFeatures ? dbFeatures.includes(feature) : false;
	}

	/**
	 * 生成查询参数占位符
	 * 
	 * @description 根据数据库类型生成查询参数占位符
	 * @param count 参数数量
	 * @param databaseType 数据库类型
	 * @returns 参数占位符字符串
	 * 
	 * @example
	 * ```typescript
	 * const placeholders = DatabaseHelper.generatePlaceholders(3, 'postgresql');
	 * console.log(placeholders); // '$1, $2, $3'
	 * ```
	 */
	static generatePlaceholders(count: number, databaseType = 'postgresql'): string {
		switch (databaseType.toLowerCase()) {
			case 'postgresql':
				return Array.from({ length: count }, (_, i) => `$${i + 1}`).join(', ');
			case 'mysql':
			case 'mariadb':
				return Array.from({ length: count }, () => '?').join(', ');
			case 'sqlite':
				return Array.from({ length: count }, () => '?').join(', ');
			case 'mongodb':
				// MongoDB使用对象查询，不需要占位符
				return '';
			default:
				return Array.from({ length: count }, () => '?').join(', ');
		}
	}

	/**
	 * 转义SQL标识符
	 * 
	 * @description 根据数据库类型转义SQL标识符
	 * @param identifier 标识符
	 * @param databaseType 数据库类型
	 * @returns 转义后的标识符
	 * 
	 * @example
	 * ```typescript
	 * const escaped = DatabaseHelper.escapeIdentifier('user_name', 'postgresql');
	 * console.log(escaped); // '"user_name"'
	 * ```
	 */
	static escapeIdentifier(identifier: string, databaseType = 'postgresql'): string {
		switch (databaseType.toLowerCase()) {
			case 'postgresql':
				return `"${identifier}"`;
			case 'mysql':
			case 'mariadb':
				return `\`${identifier}\``;
			case 'sqlite':
				return `[${identifier}]`;
			case 'mongodb':
				// MongoDB使用点表示法
				return identifier;
			default:
				return `"${identifier}"`;
		}
	}
}
