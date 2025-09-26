import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * 用户管理控制器
 *
 * 提供用户管理的RESTful API接口
 * 支持用户的CRUD操作
 *
 * @description 用户管理控制器，处理用户相关的HTTP请求
 * @since 1.0.0
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取所有用户
   *
   * @description 获取用户列表
   * @returns 用户列表
   */
  @Get()
  async getUsers() {
    return this.usersService.getUsers();
  }

  /**
   * 创建新用户
   *
   * @description 创建新的用户实例
   * @param createUserDto - 创建用户的数据传输对象
   * @returns 创建的用户信息
   */
  @Post()
  async createUser(@Body() createUserDto: any) {
    return this.usersService.createUser(createUserDto);
  }

  /**
   * 获取用户信息
   *
   * @description 根据用户ID获取用户详细信息
   * @param id - 用户ID
   * @returns 用户信息
   */
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  /**
   * 更新用户信息
   *
   * @description 更新用户的配置信息
   * @param id - 用户ID
   * @param updateUserDto - 更新用户的数据传输对象
   * @returns 更新结果
   */
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  /**
   * 删除用户
   *
   * @description 删除指定的用户
   * @param id - 用户ID
   * @returns 删除结果
   */
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
