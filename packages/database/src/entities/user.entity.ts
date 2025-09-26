import { Entity, PrimaryKey, Property, Enum, Index } from '@mikro-orm/core';
import { EntityId } from '@hl8/common';

/**
 * 用户实体
 *
 * 表示系统中的用户，支持多租户架构
 * 用户可以是平台用户、租户用户等不同类型
 *
 * @description 用户实体，存储用户的基本信息和状态
 * @since 1.0.0
 */
@Entity({ tableName: 'users' })
@Index({ properties: ['email'] })
@Index({ properties: ['tenantId'] })
export class User {
  /**
   * 用户唯一标识符
   *
   * @description 用户的唯一ID，使用 EntityId 类型
   */
  @PrimaryKey({ type: 'uuid' })
  id: EntityId = EntityId.generate();

  /**
   * 用户名
   *
   * @description 用户的登录用户名，全局唯一
   */
  @Property({ type: 'varchar', length: 50, unique: true })
  username!: string;

  /**
   * 邮箱地址
   *
   * @description 用户的邮箱地址，用于登录和通知
   */
  @Property({ type: 'varchar', length: 255, unique: true })
  email!: string;

  /**
   * 密码哈希
   *
   * @description 用户密码的哈希值，不存储明文密码
   */
  @Property({ type: 'varchar', length: 255 })
  passwordHash!: string;

  /**
   * 用户类型
   *
   * @description 用户类型：平台用户、租户用户等
   */
  @Enum(() => UserType)
  @Property({ type: 'enum' })
  type: UserType = UserType.PLATFORM_USER;

  /**
   * 用户状态
   *
   * @description 用户状态：活跃、待激活、禁用等
   */
  @Enum(() => UserStatus)
  @Property({ type: 'enum' })
  status: UserStatus = UserStatus.ACTIVE;

  /**
   * 租户ID
   *
   * @description 用户所属的租户ID，支持多租户架构
   */
  @Property({ type: 'uuid', nullable: true })
  tenantId?: EntityId;

  /**
   * 组织ID
   *
   * @description 用户所属的组织ID
   */
  @Property({ type: 'uuid', nullable: true })
  organizationId?: EntityId;

  /**
   * 部门ID
   *
   * @description 用户所属的部门ID
   */
  @Property({ type: 'uuid', nullable: true })
  departmentId?: EntityId;

  /**
   * 用户角色
   *
   * @description 用户的角色，如管理员、普通用户等
   */
  @Property({ type: 'varchar', length: 50, default: 'user' })
  role: string = 'user';

  /**
   * 用户权限
   *
   * @description 用户的权限列表，JSON格式存储
   */
  @Property({ type: 'json', nullable: true })
  permissions?: string[];

  /**
   * 用户信息
   *
   * @description 用户的详细信息，JSON格式存储
   */
  @Property({ type: 'json', nullable: true })
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    timezone?: string;
    language?: string;
  };

  /**
   * 最后登录时间
   *
   * @description 用户最后一次登录的时间
   */
  @Property({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  /**
   * 创建时间
   *
   * @description 用户创建的时间
   */
  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  /**
   * 更新时间
   *
   * @description 用户信息最后更新的时间
   */
  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

/**
 * 用户类型枚举
 *
 * @description 定义系统中支持的用户类型
 */
export enum UserType {
  PLATFORM_USER = 'platform_user',
  TENANT_USER = 'tenant_user',
  SYSTEM_USER = 'system_user',
}

/**
 * 用户状态枚举
 *
 * @description 定义用户的各种状态
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}
