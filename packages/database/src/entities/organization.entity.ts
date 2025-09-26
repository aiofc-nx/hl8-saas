import { Entity, PrimaryKey, Property, Enum, Index, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { EntityId } from '@hl8/common';
import { Tenant } from './tenant.entity';

/**
 * 组织实体
 *
 * 表示租户内的组织，支持多种组织类型
 * 组织可以是专业委员会、项目管理团队、质量控制小组等
 *
 * @description 组织实体，存储组织的基本信息和层级关系
 * @since 1.0.0
 */
@Entity({ tableName: 'organizations' })
@Index({ properties: ['name'] })
@Index({ properties: ['tenantId'] })
export class Organization {
  /**
   * 组织唯一标识符
   *
   * @description 组织的唯一ID，使用 EntityId 类型
   */
  @PrimaryKey({ type: 'uuid' })
  id: EntityId = EntityId.generate();

  /**
   * 组织名称
   *
   * @description 组织的显示名称
   */
  @Property({ type: 'varchar', length: 100 })
  name!: string;

  /**
   * 组织描述
   *
   * @description 组织的详细描述
   */
  @Property({ type: 'text', nullable: true })
  description?: string;

  /**
   * 组织类型
   *
   * @description 组织类型：专业委员会、项目管理团队等
   */
  @Enum(() => OrganizationType)
  @Property({ type: 'enum' })
  type: OrganizationType = OrganizationType.COMMITTEE;

  /**
   * 组织状态
   *
   * @description 组织状态：活跃、暂停、解散等
   */
  @Enum(() => OrganizationStatus)
  @Property({ type: 'enum' })
  status: OrganizationStatus = OrganizationStatus.ACTIVE;

  /**
   * 所属租户
   *
   * @description 组织所属的租户
   */
  @ManyToOne(() => Tenant)
  tenant!: Tenant;

  /**
   * 租户ID
   *
   * @description 组织所属的租户ID
   */
  @Property({ type: 'uuid' })
  tenantId!: EntityId;

  /**
   * 父组织ID
   *
   * @description 组织的父级组织ID，支持层级结构
   */
  @Property({ type: 'uuid', nullable: true })
  parentId?: EntityId;

  /**
   * 组织层级
   *
   * @description 组织在层级结构中的层级
   */
  @Property({ type: 'int', default: 0 })
  level: number = 0;

  /**
   * 组织路径
   *
   * @description 组织在层级结构中的路径，如 /root/org1/org2
   */
  @Property({ type: 'varchar', length: 500, nullable: true })
  path?: string;

  /**
   * 组织配置
   *
   * @description 组织的配置信息，JSON格式存储
   */
  @Property({ type: 'json', nullable: true })
  config?: {
    maxMembers?: number;
    permissions?: string[];
    settings?: Record<string, any>;
  };

  /**
   * 组织信息
   *
   * @description 组织的详细信息，JSON格式存储
   */
  @Property({ type: 'json', nullable: true })
  profile?: {
    logo?: string;
    website?: string;
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };

  /**
   * 负责人ID
   *
   * @description 组织负责人的用户ID
   */
  @Property({ type: 'uuid', nullable: true })
  leaderId?: EntityId;

  /**
   * 创建者ID
   *
   * @description 创建该组织的用户ID
   */
  @Property({ type: 'uuid' })
  createdBy!: EntityId;

  /**
   * 创建时间
   *
   * @description 组织创建的时间
   */
  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  /**
   * 更新时间
   *
   * @description 组织信息最后更新的时间
   */
  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

/**
 * 组织类型枚举
 *
 * @description 定义系统中支持的组织类型
 */
export enum OrganizationType {
  COMMITTEE = 'committee',
  PROJECT_TEAM = 'project_team',
  QUALITY_GROUP = 'quality_group',
  PERFORMANCE_GROUP = 'performance_group',
  DEPARTMENT = 'department',
}

/**
 * 组织状态枚举
 *
 * @description 定义组织的各种状态
 */
export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DISSOLVED = 'dissolved',
}
