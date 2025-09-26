import { Entity, PrimaryKey, Property, Enum, Index } from '@mikro-orm/core';
import { EntityId } from '@hl8/common';

/**
 * 租户实体
 *
 * 表示系统中的租户，支持多租户SAAS架构
 * 租户可以是企业、社群、团队、个人等不同类型
 *
 * @description 租户实体，存储租户的基本信息和配置
 * @since 1.0.0
 */
@Entity({ tableName: 'tenants' })
@Index({ properties: ['name'] })
@Index({ properties: ['domain'] })
export class Tenant {
  /**
   * 租户唯一标识符
   *
   * @description 租户的唯一ID，使用 EntityId 类型
   */
  @PrimaryKey({ type: 'uuid' })
  id: EntityId = EntityId.generate();

  /**
   * 租户名称
   *
   * @description 租户的显示名称
   */
  @Property({ type: 'varchar', length: 100 })
  name!: string;

  /**
   * 租户域名
   *
   * @description 租户的域名，用于多租户访问
   */
  @Property({ type: 'varchar', length: 255, unique: true, nullable: true })
  domain?: string;

  /**
   * 租户类型
   *
   * @description 租户类型：企业、社群、团队、个人等
   */
  @Enum(() => TenantType)
  @Property({ type: 'enum' })
  type: TenantType = TenantType.PERSONAL;

  /**
   * 租户状态
   *
   * @description 租户状态：活跃、暂停、过期等
   */
  @Enum(() => TenantStatus)
  @Property({ type: 'enum' })
  status: TenantStatus = TenantStatus.ACTIVE;

  /**
   * 租户配置
   *
   * @description 租户的配置信息，JSON格式存储
   */
  @Property({ type: 'json', nullable: true })
  config?: {
    maxUsers?: number;
    maxStorage?: number;
    features?: string[];
    settings?: Record<string, any>;
  };

  /**
   * 租户信息
   *
   * @description 租户的详细信息，JSON格式存储
   */
  @Property({ type: 'json', nullable: true })
  profile?: {
    description?: string;
    logo?: string;
    website?: string;
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };

  /**
   * 订阅信息
   *
   * @description 租户的订阅信息，JSON格式存储
   */
  @Property({ type: 'json', nullable: true })
  subscription?: {
    plan?: string;
    startDate?: Date;
    endDate?: Date;
    autoRenew?: boolean;
  };

  /**
   * 创建者ID
   *
   * @description 创建该租户的用户ID
   */
  @Property({ type: 'uuid' })
  createdBy!: EntityId;

  /**
   * 管理员ID
   *
   * @description 租户管理员的用户ID
   */
  @Property({ type: 'uuid', nullable: true })
  adminId?: EntityId;

  /**
   * 创建时间
   *
   * @description 租户创建的时间
   */
  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  /**
   * 更新时间
   *
   * @description 租户信息最后更新的时间
   */
  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

/**
 * 租户类型枚举
 *
 * @description 定义系统中支持的租户类型
 */
export enum TenantType {
  ENTERPRISE = 'enterprise',
  COMMUNITY = 'community',
  TEAM = 'team',
  PERSONAL = 'personal',
}

/**
 * 租户状态枚举
 *
 * @description 定义租户的各种状态
 */
export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}
