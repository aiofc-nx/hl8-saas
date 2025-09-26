import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

/**
 * 组织管理控制器
 *
 * 提供组织管理的RESTful API接口
 * 支持组织的CRUD操作
 *
 * @description 组织管理控制器，处理组织相关的HTTP请求
 * @since 1.0.0
 */
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * 获取所有组织
   *
   * @description 获取组织列表
   * @returns 组织列表
   */
  @Get()
  async getOrganizations() {
    return this.organizationsService.getOrganizations();
  }

  /**
   * 创建新组织
   *
   * @description 创建新的组织实例
   * @param createOrganizationDto - 创建组织的数据传输对象
   * @returns 创建的组织信息
   */
  @Post()
  async createOrganization(@Body() createOrganizationDto: any) {
    return this.organizationsService.createOrganization(createOrganizationDto);
  }

  /**
   * 获取组织信息
   *
   * @description 根据组织ID获取组织详细信息
   * @param id - 组织ID
   * @returns 组织信息
   */
  @Get(':id')
  async getOrganization(@Param('id') id: string) {
    return this.organizationsService.getOrganization(id);
  }

  /**
   * 更新组织信息
   *
   * @description 更新组织的配置信息
   * @param id - 组织ID
   * @param updateOrganizationDto - 更新组织的数据传输对象
   * @returns 更新结果
   */
  @Put(':id')
  async updateOrganization(@Param('id') id: string, @Body() updateOrganizationDto: any) {
    return this.organizationsService.updateOrganization(id, updateOrganizationDto);
  }

  /**
   * 删除组织
   *
   * @description 删除指定的组织
   * @param id - 组织ID
   * @returns 删除结果
   */
  @Delete(':id')
  async deleteOrganization(@Param('id') id: string) {
    return this.organizationsService.deleteOrganization(id);
  }
}
