import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';

/**
 * 租户管理控制器
 *
 * 提供租户管理的RESTful API接口
 * 支持租户的CRUD操作
 *
 * @description 租户管理控制器，处理租户相关的HTTP请求
 * @since 1.0.0
 */
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * 获取所有租户
   *
   * @description 获取租户列表
   * @returns 租户列表
   */
  @Get()
  async getTenants() {
    return this.tenantsService.getTenants();
  }

  /**
   * 创建新租户
   *
   * @description 创建新的租户实例
   * @param createTenantDto - 创建租户的数据传输对象
   * @returns 创建的租户信息
   */
  @Post()
  async createTenant(@Body() createTenantDto: any) {
    return this.tenantsService.createTenant(createTenantDto);
  }

  /**
   * 获取租户信息
   *
   * @description 根据租户ID获取租户详细信息
   * @param id - 租户ID
   * @returns 租户信息
   */
  @Get(':id')
  async getTenant(@Param('id') id: string) {
    return this.tenantsService.getTenant(id);
  }

  /**
   * 更新租户信息
   *
   * @description 更新租户的配置信息
   * @param id - 租户ID
   * @param updateTenantDto - 更新租户的数据传输对象
   * @returns 更新结果
   */
  @Put(':id')
  async updateTenant(@Param('id') id: string, @Body() updateTenantDto: any) {
    return this.tenantsService.updateTenant(id, updateTenantDto);
  }

  /**
   * 删除租户
   *
   * @description 删除指定的租户
   * @param id - 租户ID
   * @returns 删除结果
   */
  @Delete(':id')
  async deleteTenant(@Param('id') id: string) {
    return this.tenantsService.deleteTenant(id);
  }
}
