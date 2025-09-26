import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../modules/users/users.module';
import { TenantsModule } from '../modules/tenants/tenants.module';
import { OrganizationsModule } from '../modules/organizations/organizations.module';
import { ConfigModule } from '../../../../packages/config/src';
import { DatabaseModule } from '../../../../packages/database/src';

/**
 * 主应用程序模块
 *
 * 集成所有核心库和业务模块
 * 提供完整的 SAAS 平台 API 服务
 *
 * @description 主应用程序模块，集成配置、日志、数据库等核心功能
 * @since 1.0.0
 */
@Module({
  imports: [
    // 核心库集成
    ConfigModule,
    DatabaseModule,
    // 业务模块集成
    UsersModule,
    TenantsModule,
    OrganizationsModule,
    // TODO: 逐步集成其他核心库
    // LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
