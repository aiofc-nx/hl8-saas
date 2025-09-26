#!/usr/bin/env node

/**
 * 简化的 API 启动脚本
 * 
 * 绕过 webpack 构建问题，直接启动 API 应用
 */

const { spawn } = require('child_process');
const path = require('path');

// 设置环境变量
process.env.DATABASE_URL = 'postgresql://aiofix_user:aiofix_password@localhost:5432/aiofix_platform';
process.env.MONGODB_URL = 'mongodb://aiofix_admin:aiofix_password@localhost:27017/aiofix_events';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NODE_ENV = 'development';
process.env.PORT = '3000';

console.log('🚀 启动 HL8 SAAS Platform API...');
console.log('📡 数据库连接: PostgreSQL + MongoDB');
console.log('🌍 环境: development');

// 使用 ts-node 直接运行 TypeScript 文件
const tsNode = spawn('npx', ['ts-node', '--transpile-only', 'apps/api/src/main.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env
});

tsNode.on('close', (code) => {
  console.log(`API 服务退出，代码: ${code}`);
});

tsNode.on('error', (err) => {
  console.error('启动 API 服务时发生错误:', err);
});

