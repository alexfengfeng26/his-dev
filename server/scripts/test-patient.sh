#!/bin/bash

# 患�查MongoDB是否运行
echo "检查MongoDB连接状态..."

# 运行患者服务单元测试
echo "运行患者服务单元测试..."
npm run test -- --testPathPattern=patient.service.spec.ts

# 运行患者控制器e2e测试（需要MongoDB）
echo "运行患者控制器集成测试..."
npm run test -- --testPathPattern=patient.controller.e2e.spec.ts

# 运行覆盖率测试
echo "生成测试覆盖率报告..."
npm run test:cov -- --testPathPattern="patient.*\.spec\.ts"