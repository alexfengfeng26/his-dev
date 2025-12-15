# HIS-DEV 快速启动指南

## 环境要求

- Node.js >= 18.0.0
- npm >= 8.6.0
- MongoDB >= 5.0

## 快速启动步骤

### 1. 安装依赖

```bash
# 在项目根目录执行
npm run install:all
```

### 2. 配置环境变量

确保 `server/.env.development` 中的数据库配置正确：

```env
# 数据库配置
HIS_DEV_MONGO_URL=mongodb://localhost:27017/his_dev
```

### 3. 启动 MongoDB

确保 MongoDB 服务正在运行：

```bash
# Windows (如果使用 MongoDB 服务)
# 服务应该自动运行

# macOS (使用 Homebrew)
brew services start mongodb-community

# Linux (使用 systemd)
sudo systemctl start mongod
```

### 4. 启动开发服务器

```bash
# 在项目根目录执行，同时启动前后端
npm run dev

# 或者分别启动
npm run dev:server  # 启动后端 (端口 3000)
npm run dev:web     # 启动前端 (端口 8080)
```

### 5. 访问应用

- **前端管理端**: http://localhost:8080/management
- **后端 API**: http://localhost:3000/api
- **API 文档**: http://localhost:3000/api

## 开发说明

### 前端开发

```bash
cd web
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run lint       # 代码检查
```

### 后端开发

```bash
cd server
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run test       # 运行测试
```

## 项目结构

```
his-dev/
├── server/                    # 后端服务
│   ├── src/
│   │   ├── modules/          # 业务模块
│   │   ├── models/           # 数据模型
│   │   └── ...
│   └── package.json
├── web/                      # 前端应用
│   ├── src/
│   │   ├── management/       # 管理端
│   │   ├── usage/            # 医生工作站
│   │   ├── view/             # 病历查看端
│   │   └── materials/        # 医疗组件库
│   └── package.json
└── package.json              # 根配置
```

## 默认登录

管理端默认使用模拟登录，任何用户名密码都可以登录（演示用）。

## 故障排除

### 1. MongoDB 连接失败

检查 MongoDB 是否正在运行：

```bash
# 检查 MongoDB 状态
mongo --eval "db.adminCommand('ismaster')"

# 如果连接失败，启动 MongoDB 服务
# Windows: 确保 MongoDB 服务已启动
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### 2. 端口被占用

修改 `.env.development` 中的端口号：

```env
PORT=3001  # 修改后端端口
```

修改 `web/vite.config.ts` 中的端口：

```ts
server: {
  port: 8081  # 修改前端端口
}
```

### 3. 依赖安装失败

清除缓存重新安装：

```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

## 下一步

1. 实现真实的用户认证系统
2. 完善数据模型和 API
3. 开发病历模板编辑器
4. 实现插件系统
5. 添加更多医疗专业组件

## 联系方式

如有问题，请提交 Issue 或联系开发团队。