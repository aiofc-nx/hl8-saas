/**
 * HL8 SAAS 平台 API 服务器
 * 
 * 基于 NestJS 构建的企业级 SAAS 平台后端服务
 * 支持多租户、多组织、多部门的复杂业务场景
 * 
 * @description SAAS 平台主服务器入口文件
 * @since 1.0.0
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@hl8/config';

/**
 * 启动应用程序
 * 
 * 配置全局中间件、验证管道、Swagger 文档等
 * 
 * @description 应用程序启动函数
 * @since 1.0.0
 */
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      trustProxy: true,
    })
  );
  
  // 获取配置服务
  const configService = app.get(ConfigService);
  
  // 全局配置
  const globalPrefix = configService.get('api.globalPrefix') || 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // CORS 配置
  const corsOrigin = configService.get('api.cors.origin') || process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: corsOrigin,
    methods: configService.get('api.cors.methods') || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: configService.get('api.cors.allowedHeaders') || ['Content-Type', 'Authorization'],
  });
  
  // TODO: 配置 Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('HL8 SAAS Platform API')
    .setDescription('企业级 SAAS 平台 API 文档')
    .setVersion('1.0.0')
    .addTag('auth', '认证相关接口')
    .addTag('users', '用户管理接口')
    .addTag('tenants', '租户管理接口')
    .addTag('organizations', '组织管理接口')
    .addTag('departments', '部门管理接口')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // 启动服务器
  const port = configService.get('api.port') || process.env.PORT || 3000;
  await app.listen(port);
  
  // 获取环境信息
  const environment = configService.getEnvironment();
  
  Logger.log(`🚀 HL8 SAAS Platform API 启动成功! (Fastify)`);
  Logger.log(`📡 API 服务地址: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`⚡ 服务器引擎: Fastify (高性能)`);
  Logger.log(`🌍 环境: ${environment.nodeEnv}`);
  Logger.log(`🔧 配置来源: @hl8/config 包`);
  Logger.log(`🗄️ 数据库支持: PostgreSQL + MongoDB (MikroORM)`);
}

bootstrap();
