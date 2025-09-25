/**
 * 迁移选项接口
 * 
 * 定义迁移生成和创建时的配置选项
 * 
 * @description 迁移配置选项接口，用于迁移生成和创建
 * 
 * @since 1.0.0
 */
export interface IMigrationOptions {
	/**
	 * 迁移名称
	 * 
	 * @description 迁移类的名称，将用于生成文件名
	 * 格式: {TIMESTAMP}-{name}.ts
	 */
	name: string;

	/**
	 * 迁移目录
	 * 
	 * @description 迁移文件应该创建的目录路径
	 * 如果不指定，将使用默认的迁移目录
	 */
	dir?: string;

	/**
	 * 配置文件名称
	 * 
	 * @description 连接配置文件的名称
	 * 用于指定特定的数据库连接配置
	 */
	config?: string;

	/**
	 * 数据库类型
	 * 
	 * @description 指定迁移针对的数据库类型
	 * 用于区分PostgreSQL和MongoDB迁移
	 */
	database?: 'postgresql' | 'mongodb';
}

/**
 * 迁移状态接口
 * 
 * 定义迁移执行状态的信息
 * 
 * @description 迁移状态信息接口，用于跟踪迁移执行状态
 * 
 * @since 1.0.0
 */
export interface IMigrationStatus {
	/**
	 * 迁移名称
	 */
	name: string;

	/**
	 * 执行时间
	 */
	executedAt: Date;

	/**
	 * 执行状态
	 */
	status: 'pending' | 'executed' | 'failed';

	/**
	 * 错误信息
	 * 当状态为'failed'时包含错误详情
	 */
	error?: string;
}

/**
 * 迁移历史接口
 * 
 * 定义迁移历史记录的信息
 * 
 * @description 迁移历史记录接口，用于存储迁移执行历史
 * 
 * @since 1.0.0
 */
export interface IMigrationHistory {
	/**
	 * 迁移名称
	 */
	name: string;

	/**
	 * 执行时间
	 */
	executedAt: Date;

	/**
	 * 执行时长（毫秒）
	 */
	duration: number;

	/**
	 * 执行状态
	 */
	status: 'success' | 'failed';

	/**
	 * 错误信息
	 * 当状态为'failed'时包含错误详情
	 */
	error?: string;
}

/**
 * 迁移配置接口
 * 
 * 定义迁移系统的配置选项
 * 
 * @description 迁移系统配置接口，用于配置迁移行为
 * 
 * @since 1.0.0
 */
export interface IMigrationConfig {
	/**
	 * 迁移目录路径
	 */
	migrationsPath: string;

	/**
	 * 迁移文件模式
	 * 用于匹配迁移文件的正则表达式
	 */
	pattern: RegExp;

	/**
	 * 是否自动运行迁移
	 */
	autoRun: boolean;

	/**
	 * 迁移超时时间（毫秒）
	 */
	timeout: number;

	/**
	 * 是否在迁移失败时回滚
	 */
	rollbackOnFailure: boolean;
}
