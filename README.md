# HIS-DEV 电子病历系统底层框架

基于 xiaoju-survey 架构模式设计的电子病历系统底层框架。

## 项目概述

本项目是一个现代化的电子病历系统底层框架，采用 Vue 3 + NestJS + MongoDB + TypeScript 技术栈，支持 B 端/C 端分离的多页应用架构，具备插件化扩展能力和多级权限管理。

## 技术栈

### 前端技术栈
- **框架**: Vue 3.4.15 + TypeScript
- **UI组件库**: Element Plus 2.8.5
- **构建工具**: Vite 5.1.4
- **状态管理**: Pinia 2.2.7
- **路由**: Vue Router 4.2.5
- **图表**: ECharts 5.5.0
- **富文本编辑器**: WangEditor 5.1.23
- **拖拽**: VueDraggable 4.1.0
- **样式**: Sass 1.79.6

### 后端技术栈
- **框架**: NestJS 10.0.0 (基于 Node.js)
- **语言**: TypeScript 5.5.3
- **数据库**: MongoDB 5.9.2
- **ORM**: TypeORM 0.3.19
- **认证**: JWT (jsonwebtoken 9.0.2)
- **文档生成**: Swagger (OpenAPI)
- **日志**: Log4js 6.9.1
- **测试**: Jest 29.5.0

## 核心特性

### 1. 病历模板搭建系统
- 基于问卷搭建理念的病历模板设计
- 可视化病历模板编辑器
- 支拖拽式病历组件配置
- 动态表单生成和验证

### 2. 多页应用架构 (MPA)
- 管理端(`/management`): 系统管理、模板配置
- 使用端(`/usage`): 医生工作站、患者管理
- 查看端(`/view`): 病历查看、报表展示

### 3. 插件化架构
- 病历组件插件系统
- 医疗业务逻辑插件
- 第三方系统集成插件
- 插件管理和配置系统

### 4. 多级权限管理
- 基于角色的访问控制 (RBAC)
- 科室级权限隔离
- 病历访问权限控制
- 操作审计和追踪

### 5. 医疗数据安全
- 数据传输和存储加密
- 医疗敏感信息保护
- 操作日志和审计
- 数据备份和恢复

## 项目结构

```
his-dev/
├── server/                    # 后端服务
│   ├── src/
│   │   ├── modules/          # 业务模块
│   │   │   ├── auth/         # 认证模块
│   │   │   ├── user/         # 用户管理
│   │   │   ├── patient/      # 患者管理
│   │   │   ├── medical-record/ # 病历管理
│   │   │   ├── template/     # 病历模板
│   │   │   └── plugin/       # 插件管理
│   │   ├── models/           # 数据模型
│   │   ├── guards/           # 路由守卫
│   │   ├── exceptions/       # 异常处理
│   │   ├── securityPlugin/   # 安全插件
│   │   ├── decorators/       # 装饰器
│   │   └── middlewares/      # 中间件
│   ├── public/               # 静态文件
│   └── package.json
├── web/                      # 前端应用
│   ├── src/
│   │   ├── management/       # 管理端
│   │   ├── usage/            # 医生工作站
│   │   ├── view/             # 病历查看端
│   │   └── materials/        # 医疗组件库
│   └── package.json
├── package.json              # 根目录配置
├── tsconfig.json             # TypeScript 配置
├── .gitignore               # Git 忽略文件
└── README.md                # 项目文档
```

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.6.0
- MongoDB >= 5.0

### 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd server && npm install

# 安装前端依赖
cd ../web && npm install
```

### 启动开发环境
```bash
# 启动 MongoDB (根据本地环境)
mongod

# 启动后端服务
cd server && npm run dev

# 启动前端应用
cd ../web && npm run dev
```

### 构建生产环境
```bash
# 构建后端
cd server && npm run build

# 构建前端
cd ../web && npm run build
```

## 核心设计理念

### 1. 领域驱动设计 (DDD)
- 患者域 (Patient Domain)
- 病历域 (Medical Record Domain)
- 模板域 (Template Domain)
- 用户域 (User Domain)

### 2. 插件化架构
- 组件插件: 支持自定义病历组件
- 业务插件: 支持医疗业务逻辑扩展
- 集成插件: 支持第三方系统对接

### 3. 配置驱动
- 环境配置: 数据库连接、服务端口等
- 业务配置: 权限规则、验证规则等
- 插件配置: 插件启停、参数配置等

## 开发规范

### 1. 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 统一的命名规范和注释规范

### 2. Git 工作流
- 采用 Git Flow 分支模型
- 代码审查机制
- 自动化测试和构建

### 3. 文档规范
- API 文档自动生成 (Swagger)
- 组件文档和使用示例
- 部署和运维文档

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 项目 Issues: [GitHub Issues](https://github.com/your-username/his-dev/issues)
- 邮箱: your-email@example.com

---

**注意**: 这是一个底层框架项目，用于构建具体的电子病历系统。在使用前请确保符合相关的医疗行业法规和标准。