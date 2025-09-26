import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';

/**
 * 组织管理模块
 *
 * 提供租户内组织管理功能
 * 支持专业委员会、项目管理团队、质量控制小组、绩效管理小组等组织类型
 *
 * @description 组织管理模块，负责组织结构的创建、配置、权限管理等功能
 * @since 1.0.0
 */
@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
