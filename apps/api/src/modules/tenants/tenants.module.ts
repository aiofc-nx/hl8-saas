import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';

/**
 * 租户管理模块
 *
 * 提供多租户SAAS平台的租户管理功能
 * 支持企业租户、社群租户、团队租户、个人租户等多种租户类型
 *
 * @description 租户管理模块，负责租户的创建、配置、权限管理等功能
 * @since 1.0.0
 */
@Module({
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
