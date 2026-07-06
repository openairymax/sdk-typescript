**语言:** [English](README.md) | 简体中文

# Airymax TypeScript SDK

[![Version](https://img.shields.io/badge/version-0.1.1-5a6b7e)](https://atomgit.com/openairymax/sdk-typescript)
[![License](https://img.shields.io/badge/license-AGPL--3.0+Apache--2.0-4a90d9)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

> [Airymax](https://atomgit.com/openairymax/airymaxhub) AI 智能体运行时平台的官方 TypeScript 开发工具包。
> [sdk](https://atomgit.com/openairymax/sdk) 管理仓聚合的叶子仓之一。
> 以 npm 包 `@agentrt/sdk` 发布。

---

## 概述

**Airymax TypeScript SDK**（`@agentrt/sdk`）提供完整类型化的 Node.js Airymax 运行时接口。它与其他语言 SDK 共享相同的双层 API 架构，自带一流的类型定义，是 JavaScript/TypeScript Agent 应用、服务端集成以及与运行时通信的 Web 前端的自然之选。

基于该 SDK 构建的 Agent 应用是**运行时租户**：通过 SDK 调用系统能力，而非直接访问内核内部。该 SDK 基于异步 / Promise，支持基于 WebSocket（`ws`）的流式传输，并暴露与运行时响应码一一对应的类型化错误码体系。

## 双层 API 架构

每个 Airymax SDK 都提供顶层 `AgentRTClient`，内嵌四个资源客户端，分别覆盖运行时的一个平面：

```
AgentRTClient
├── CognitionClient   # 认知平面：任务 / 循环 / 推理
├── SafetyClient      # 安全平面：审计 / 沙箱 / 策略
├── ToolClient        # 工具平面：注册 / 调用 / 编排
└── ChatClient        # 对话平面：LLM 路由 / 会话 / 流式
```

在 TypeScript 中通过 `client.cognition`、`client.safety`、`client.tool`、`client.chat` 访问，每个都是带类型的客户端，底层是带重试的 `axios` HTTP 传输与 `ws` 流式传输。

## 目录结构

```
sdk-typescript/
├── src/
│   ├── index.ts                # 公共 API 导出
│   ├── agentrt.ts              # AgentRT 主类 + createAgentRT 工厂
│   ├── agent.ts                # AgentRTClient 与内嵌资源客户端
│   ├── manager.ts              # 配置管理（选项 + 环境变量）
│   ├── config.ts               # 配置类型定义
│   ├── errors.ts               # 错误类型与错误码常量
│   ├── protocol.ts             # 协议处理
│   ├── syscall.ts              # 系统调用绑定
│   ├── telemetry.ts            # OpenTelemetry 追踪
│   ├── plugin.ts               # 插件系统
│   ├── client/
│   │   ├── index.ts            # 客户端导出
│   │   ├── client.ts           # Client / APIClient 实现
│   │   └── mock.ts             # 测试用 MockClient
│   ├── modules/                # 业务模块管理器
│   │   ├── index.ts
│   │   ├── base_manager.ts
│   │   ├── task.ts             # TaskManager
│   │   ├── memory.ts           # MemoryManager / MemoryWriteItem
│   │   ├── session.ts          # SessionManager
│   │   └── skill.ts            # SkillManager / SkillExecuteRequest
│   ├── types/
│   │   ├── index.ts
│   │   ├── enums.ts            # TaskStatus / MemoryLayer / SessionStatus / ...
│   │   ├── models.ts           # 领域模型
│   │   └── requests.ts         # 请求 / 响应类型
│   └── utils/
│       ├── index.ts
│       ├── helpers.ts          # 通用工具函数
│       └── logger.ts           # 日志工具
├── tests/                      # Jest 测试套件（含基准）
├── package.json                # npm 清单（@agentrt/sdk）
├── tsconfig.json               # TypeScript 编译配置
├── jest.config.js              # Jest 配置
└── README.md                   # 本文件
```

## 上下游依赖

### 上游

- **运行时**：通过 HTTP 和 JSON-RPC 2.0 连接到运行中的 Airymax / AgentRT 实例（`gateway_d`），对话通过 WebSocket 流式传输。
- **协议**：使用平台 `protocols/` 中定义的 AgentsIPC 协议。
- **配置**：依次从构造选项、环境变量（`AGENTRT_ENDPOINT`、`AGENTRT_TIMEOUT`、`AGENTRT_API_KEY`）、默认值 `http://127.0.0.1:18789` 解析。

### 下游

- **Agent 应用**：用户编写的 Agent 导入 `@agentrt/sdk` 成为运行时租户。
- **Web 前端**：浏览器侧仪表盘与 Agent 控制台，通过网关调用运行时。
- **示例**：平台 `ecosystem/examples/` 中的参考 Agent。

## 安装

```bash
# 从 npm 安装（发布后）
npm install @agentrt/sdk

# 从源码构建
cd sdk-typescript
npm install
npm run build
```

**环境要求：** Node.js >= 18。运行时依赖：`axios`（HTTP）、`ws`（WebSocket 流式）。开发依赖：`typescript`、`jest`、`ts-jest`、`@types/node`、`eslint`、`prettier`。

## 快速入门

### 创建客户端

```typescript
import { AgentRTClient, createAgentRT } from '@agentrt/sdk';

const client = new AgentRTClient({
  endpoint: 'http://localhost:18789',
  timeout: 30,
  apiKey: 'your-api-key',
});

// 或使用工厂函数：
const client2 = createAgentRT({ endpoint: 'http://localhost:18789' });
```

### 认知平面 —— 任务

```typescript
const task = await client.cognition.submitTask({ input: 'analyze this data' });
const result = await client.cognition.wait(task.id, 60_000);
console.log('Result:', result.output);
```

### 对话平面 —— 流式

```typescript
for await (const chunk of client.chat.stream({ prompt: 'summarize the report' })) {
  process.stdout.write(chunk.delta ?? '');
}
```

### 配置

```typescript
import {
  newConfig, newConfigFromEnv,
  withEndpoint, withTimeout, withMaxRetries,
  withAPIKey, withUserAgent, withDebug,
} from '@agentrt/sdk';

const config = newConfig(
  withEndpoint('http://localhost:18789'),
  withTimeout(30_000),
  withAPIKey('your-key'),
  withDebug(true),
);

const envConfig = newConfigFromEnv();
```

### 系统调用绑定（底层 API）

```typescript
import { HttpSyscallBinding, TaskSyscall } from '@agentrt/sdk';

const binding = new HttpSyscallBinding('http://localhost:18789');
const taskSyscall = new TaskSyscall(binding);
const task = await taskSyscall.submit({ description: 'Process data' });
```

## 构建与测试

```bash
# 编译 TypeScript
npm run build

# 运行测试套件
npm test

# 运行指定测试
npm test -- --testPathPattern=client

# 运行基准测试
npm run test:performance

# Lint 与格式化
npm run lint
npm run format
```

## 分支策略

本叶子仓在 **`feature/official-hubs-01`** 分支上开发。聚合管理仓 `sdk` 仅使用 `main` 分支。

## 许可证

采用 **AGPL v3 + Apache 2.0** 双许可证（SPDX: `AGPL-3.0-or-later OR Apache-2.0`）。详见 [LICENSE](LICENSE)。

Copyright (c) 2025-2026 **SPHARX Ltd.** All Rights Reserved.
