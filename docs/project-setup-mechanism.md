# HL8 SAAS 平台项目设置机制文档

## 📋 概述

本文档详细说明了 HL8 SAAS 平台项目的完整设置机制，包括项目架构、配置管理、开发工具链和部署流程。项目采用 Nx Monorepo 架构，结合 Clean Architecture + CQRS + 事件溯源 + 事件驱动架构的混合模式。

## 🏗️ 项目架构

### 技术栈

- **运行时**: Node.js >= 20
- **框架**: NestJS + Fastify
- **语言**: TypeScript (严格模式)
- **构建工具**: Nx 21.5.3 + SWC
- **包管理**: pnpm 10.15.1
- **数据库**: PostgreSQL + MongoDB
- **ORM**: MikroORM
- **缓存**: Redis
- **测试**: Jest
- **代码质量**: ESLint + Prettier

### 项目结构

```
hl8-saas/
├── apps/                    # 应用程序
│   ├── api/                # API 服务
│   └── api-e2e/            # E2E 测试
├── packages/               # 共享库
│   ├── common/             # 通用工具
│   ├── config/             # 配置管理
│   ├── constants/          # 常量定义
│   ├── contracts/          # 接口契约
│   ├── core/               # 核心业务
│   ├── database/           # 数据库
│   ├── logger/             # 日志系统
│   ├── messaging/          # 消息队列
│   └── utils/              # 工具函数
├── config/                 # 配置文件
├── scripts/                # 脚本文件
└── docs/                   # 文档
```

## ⚙️ 核心配置文件

### 1. 包管理配置

#### `package.json` (根目录)

```json
{
  "name": "@hl8-saas/source",
  "version": "0.0.0",
  "license": "MIT",
  "packageManager": "pnpm@10.15.1",
  "engines": {
    "node": ">= 20"
  }
}
```

#### `pnpm-workspace.yaml`

```yaml
packages:
- packages/*
- '!forks/*'
```

### 2. TypeScript 配置

#### `tsconfig.base.json` (基础配置)

```json
{
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "importHelpers": true,
    "isolatedModules": true,
    "lib": ["es2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    "noEmitOnError": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "es2022",
    "baseUrl": ".",
    "paths": {
      "@hl8/common": ["packages/common/src/index.ts"],
      "@hl8/config": ["packages/config/src/index.ts"],
      "@hl8/constants": ["packages/constants/src/index.ts"],
      "@hl8/contracts": ["packages/contracts/src/index.ts"],
      "@hl8/core": ["packages/core/src/index.ts"],
      "@hl8/database": ["packages/database/src/index.ts"],
      "@hl8/logger": ["packages/logger/src/index.ts"],
      "@hl8/messaging": ["packages/messaging/src/index.ts"],
      "@hl8/utils": ["packages/utils/src/index.ts"]
    }
  }
}
```

#### `tsconfig.json` (根配置)

```json
{
  "extends": "./tsconfig.base.json",
  "compileOnSave": false,
  "files": [],
  "references": [
    { "path": "./packages/common" },
    { "path": "./packages/constants" },
    { "path": "./packages/contracts" },
    { "path": "./packages/logger" },
    { "path": "./packages/config" },
    { "path": "./packages/utils" },
    { "path": "./packages/database" },
    { "path": "./packages/core" },
    { "path": "./packages/messaging" },
    { "path": "./apps/api-e2e" },
    { "path": "./apps/api" }
  ]
}
```

### 3. Nx 工作区配置

#### `nx.json`

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/.eslintrc.json",
      "!{projectRoot}/eslint.config.mjs",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/jest.config.[jt]s",
      "!{projectRoot}/src/test-setup.[jt]s",
      "!{projectRoot}/test-setup.[jt]s"
    ],
    "sharedGlobals": ["{workspaceRoot}/.circleci/config.yml"]
  },
  "nxCloudId": "68d4da7fadbefe4dd04079fb",
  "plugins": [
    {
      "plugin": "@nx/js/typescript",
      "options": {
        "typecheck": { "targetName": "typecheck" },
        "build": {
          "targetName": "build",
          "configName": "tsconfig.lib.json",
          "buildDepsName": "build-deps",
          "watchDepsName": "watch-deps"
        }
      }
    },
    {
      "plugin": "@nx/jest/plugin",
      "options": { "targetName": "test" },
      "exclude": ["apps/api-e2e/**/*"]
    },
    {
      "plugin": "@nx/eslint/plugin",
      "options": { "targetName": "lint" }
    },
    {
      "plugin": "@nx/webpack/plugin",
      "options": {
        "buildTargetName": "build",
        "serveTargetName": "serve",
        "previewTargetName": "preview",
        "buildDepsTargetName": "build-deps",
        "watchDepsTargetName": "watch-deps",
        "serveStaticTargetName": "serve-static"
      }
    }
  ],
  "targetDefaults": {
    "@nx/js:swc": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  },
  "release": {
    "version": {
      "preVersionCommand": "npx nx run-many -t build"
    }
  }
}
```

### 4. 代码质量配置

#### `eslint.config.mjs` (基础 ESLint 配置)

```javascript
import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },
];
```

#### `eslint.config-nestjs.mjs` (NestJS 专用配置)

```javascript
import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
          checksConditionals: false,
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
];
```

#### `.prettierrc`

```json
{
  "singleQuote": true
}
```

### 5. 测试配置

#### `jest.config.ts` (根 Jest 配置)

```typescript
import type { Config } from 'jest';
import { getJestProjectsAsync } from '@nx/jest';

export default async (): Promise<Config> => ({
  projects: await getJestProjectsAsync(),
});
```

#### `jest.preset.js` (Jest 预设)

```javascript
const nxPreset = require('@nx/jest/preset').default;

module.exports = { ...nxPreset };
```

## 📦 包配置机制

### 1. 库包配置

#### `packages/common/package.json`

```json
{
  "name": "@hl8/common",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@hl8-saas/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "!**/*.tsbuildinfo"
  ],
  "dependencies": {
    "@swc/helpers": "~0.5.11"
  }
}
```

#### `packages/common/project.json`

```json
{
  "name": "common",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/common/src",
  "projectType": "library",
  "tags": ["scope:nestjs", "type:lib"],
  "targets": {
    "build": {
      "executor": "@nx/js:swc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "packages/common/dist",
        "main": "packages/common/src/index.ts",
        "tsConfig": "packages/common/tsconfig.lib.json",
        "skipTypeCheck": true,
        "stripLeadingPaths": true
      }
    }
  }
}
```

#### `packages/common/tsconfig.lib.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": "src",
    "outDir": "dist",
    "tsBuildInfoFile": "dist/tsconfig.lib.tsbuildinfo",
    "emitDeclarationOnly": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "references": [],
  "exclude": ["jest.config.ts", "src/**/*.spec.ts", "src/**/*.test.ts"]
}
```

### 2. 应用配置

#### `apps/api/project.json`

```json
{
  "name": "api",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/api/src",
  "projectType": "application",
  "tags": ["scope:api", "type:app"],
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "webpack-cli build",
        "args": ["--node-env=production"],
        "cwd": "apps/api"
      },
      "configurations": {
        "development": {
          "args": ["--node-env=development"]
        }
      }
    },
    "serve": {
      "continuous": true,
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "dependsOn": ["build"],
      "options": {
        "buildTarget": "api:build",
        "runBuildTargetDependencies": false
      },
      "configurations": {
        "development": {
          "buildTarget": "api:build:development"
        },
        "production": {
          "buildTarget": "api:build:production"
        }
      }
    },
    "test": {
      "options": {
        "passWithNoTests": true
      }
    }
  }
}
```

#### `apps/api/package.json`

```json
{
  "name": "@hl8-saas/api",
  "version": "0.0.1",
  "private": true,
  "dependencies": {
    "@hl8/common": "workspace:*",
    "@hl8/config": "workspace:*",
    "@hl8/constants": "workspace:*",
    "@hl8/contracts": "workspace:*",
    "@hl8/core": "workspace:*",
    "@hl8/database": "workspace:*",
    "@hl8/logger": "workspace:*",
    "@hl8/utils": "workspace:*",
    "@nestjs/common": "^11.1.6",
    "@nestjs/core": "^11.1.6",
    "@nestjs/platform-fastify": "^11.1.6",
    "@nestjs/swagger": "^8.0.0",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.2.1",
    "rxjs": "^7.8.1"
  }
}
```

## 🛠️ 开发工具链

### 1. 构建系统

- **Nx**: Monorepo 管理和任务编排
- **SWC**: 高性能 TypeScript/JavaScript 编译器
- **Webpack**: 应用打包和开发服务器

### 2. 代码质量

- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **Jest**: 单元测试

### 3. 包管理

- **pnpm**: 高效的包管理器
- **workspace**: 工作区依赖管理
- **verdaccio**: 本地包注册表

## 🚀 开发工作流

### 1. 项目初始化

```bash
# 安装依赖
pnpm install

# 启动本地包注册表
pnpm nx local-registry

# 构建所有项目
pnpm nx run-many -t build
```

### 2. 开发命令

```bash
# 启动 API 服务
pnpm nx serve api

# 运行测试
pnpm nx test

# 代码检查
pnpm nx lint

# 类型检查
pnpm nx typecheck

# 构建项目
pnpm nx build <project-name>
```

### 3. 项目生成

```bash
# 生成新库
pnpm nx g @nx/js:lib <library-name>

# 生成新应用
pnpm nx g @nx/nest:app <app-name>

# 生成组件
pnpm nx g @nx/nest:resource <resource-name>
```

## 📋 配置继承机制

### 1. TypeScript 配置继承

```
tsconfig.json (根配置)
├── extends: tsconfig.base.json
└── references: [所有子项目]

tsconfig.base.json (基础配置)
├── compilerOptions: 通用编译选项
├── baseUrl: "."
└── paths: 路径映射

packages/*/tsconfig.json (库配置)
├── extends: ../../tsconfig.base.json
├── compilerOptions: 库特定选项
└── include: ["src/**/*.ts"]

packages/*/tsconfig.lib.json (库构建配置)
├── extends: ../../tsconfig.base.json
├── compilerOptions: 构建特定选项
└── exclude: [测试文件]
```

### 2. ESLint 配置继承

```
eslint.config.mjs (根配置)
├── @nx/eslint-plugin 基础配置
├── 模块边界规则
└── 通用规则

eslint.config-nestjs.mjs (NestJS 配置)
├── 继承根配置
├── NestJS 特定规则
└── TypeScript 严格规则
```

### 3. Jest 配置继承

```
jest.config.ts (根配置)
├── 自动发现所有项目
└── 使用 Nx Jest 预设

jest.preset.js (预设配置)
├── @nx/jest/preset
└── 通用测试配置
```

## 🔧 环境配置

### 1. 开发环境

- **Node.js**: >= 20
- **pnpm**: 10.15.1
- **Nx**: 21.5.3
- **TypeScript**: ~5.9.2

### 2. 构建环境

- **SWC**: 高性能编译
- **Webpack**: 模块打包
- **Nx Cloud**: 分布式缓存

### 3. 部署环境

- **Docker**: 容器化部署
- **Nx Cloud**: CI/CD 集成
- **Verdaccio**: 私有包注册表

## 📚 最佳实践

### 1. 项目组织

- 使用 Nx 生成器创建项目结构
- 遵循 Clean Architecture 分层
- 保持模块边界清晰
- 使用标签管理项目分类

### 2. 代码质量

- 启用 TypeScript 严格模式
- 使用 ESLint 和 Prettier
- 编写单元测试
- 遵循 TSDoc 注释规范

### 3. 依赖管理

- 使用 workspace 协议管理内部依赖
- 保持依赖版本一致
- 定期更新依赖
- 使用 pnpm 提高安装效率

### 4. 构建优化

- 利用 Nx 缓存机制
- 使用 SWC 提高编译速度
- 配置正确的输入和输出
- 使用 Nx Cloud 分布式缓存

## 🔍 故障排除

### 1. 常见问题

- **路径解析错误**: 检查 `baseUrl` 和 `paths` 配置
- **模块边界错误**: 检查 ESLint 规则配置
- **构建失败**: 检查依赖关系和构建顺序
- **类型检查错误**: 检查 TypeScript 配置

### 2. 调试工具

```bash
# 查看项目依赖图
pnpm nx graph

# 查看任务依赖
pnpm nx show project <project-name> --web

# 查看缓存状态
pnpm nx show projects --affected

# 清理缓存
pnpm nx reset
```

## 📖 相关文档

- [Nx 官方文档](https://nx.dev)
- [NestJS 官方文档](https://nestjs.com)
- [TypeScript 官方文档](https://www.typescriptlang.org)
- [pnpm 官方文档](https://pnpm.io)
- [Clean Architecture 指南](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**最后更新**: 2024年12月
**维护者**: HL8 SAAS 平台开发团队
