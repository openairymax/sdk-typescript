**Language:** English | [简体中文](README_zh.md)

# Airymax TypeScript SDK

[![Version](https://img.shields.io/badge/version-0.1.1-5a6b7e)](https://atomgit.com/openairymax/sdk-typescript)
[![License](https://img.shields.io/badge/license-AGPL--3.0+Apache--2.0-4a90d9)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

> Official TypeScript development kit for the [Airymax](https://atomgit.com/openairymax/airymaxhub) AI Agent Runtime Platform.
> One of the leaf repositories aggregated by the [sdk](https://atomgit.com/openairymax/sdk) management repo.
> Published as the npm package `@agentrt/sdk`.

---

## Overview

The **Airymax TypeScript SDK** (`@agentrt/sdk`) provides a fully-typed Node.js interface to the Airymax runtime. It shares the same double-layer API architecture as the other language SDKs, ships with first-class type definitions, and is the natural choice for JavaScript/TypeScript agent applications, server-side integrations, and web frontends that talk to the runtime.

Agent applications built on this SDK are **runtime tenants**: they invoke system capabilities through the SDK rather than touching kernel internals directly. The SDK is async/Promise-based, supports streaming over WebSocket (`ws`), and exposes a typed error-code system that mirrors the runtime's response codes.

## Double-Layer API Architecture

Every Airymax SDK ships a top-level `AgentRTClient` that nests four resource clients, each covering one plane of the runtime:

```
AgentRTClient
├── CognitionClient   # Cognition plane: tasks / loops / inference
├── SafetyClient      # Safety plane: audit / sandbox / policy
├── ToolClient        # Tool plane: register / invoke / orchestrate
└── ChatClient        # Chat plane: LLM routing / sessions / streaming
```

In TypeScript these are accessed through `client.cognition`, `client.safety`, `client.tool`, and `client.chat`, each a typed client backed by an `axios` HTTP transport with retry and a `ws` streaming transport.

## Directory Structure

```
sdk-typescript/
├── src/
│   ├── index.ts                # Public API exports
│   ├── agentrt.ts              # AgentRT main class + createAgentRT factory
│   ├── agent.ts                # AgentRTClient + nested resource clients
│   ├── manager.ts              # Configuration management (options + env)
│   ├── config.ts               # Config type definitions
│   ├── errors.ts               # Error types + error-code constants
│   ├── protocol.ts             # Protocol handling
│   ├── syscall.ts              # Syscall bindings
│   ├── telemetry.ts            # OpenTelemetry tracing
│   ├── plugin.ts               # Plugin system
│   ├── client/
│   │   ├── index.ts            # Client exports
│   │   ├── client.ts           # Client / APIClient implementation
│   │   └── mock.ts             # MockClient for tests
│   ├── modules/                # Domain module managers
│   │   ├── index.ts
│   │   ├── base_manager.ts
│   │   ├── task.ts             # TaskManager
│   │   ├── memory.ts           # MemoryManager / MemoryWriteItem
│   │   ├── session.ts          # SessionManager
│   │   └── skill.ts            # SkillManager / SkillExecuteRequest
│   ├── types/
│   │   ├── index.ts
│   │   ├── enums.ts            # TaskStatus / MemoryLayer / SessionStatus / ...
│   │   ├── models.ts           # Domain models
│   │   └── requests.ts         # Request / response types
│   └── utils/
│       ├── index.ts
│       ├── helpers.ts          # Generic helpers
│       └── logger.ts           # Logger
├── tests/                      # Jest test suite (incl. benchmark)
├── package.json                # npm manifest (@agentrt/sdk)
├── tsconfig.json               # TypeScript compiler config
├── jest.config.js              # Jest config
└── README.md                   # This file
```

## Upstream & Downstream Dependencies

### Upstream

- **Runtime**: Connects to a running Airymax / AgentRT instance (`gateway_d`) over HTTP and JSON-RPC 2.0, with WebSocket streaming for chat.
- **Protocol**: Speaks the AgentsIPC protocol defined in the platform `protocols/` tree.
- **Configuration**: Resolved from constructor options, then environment variables (`AGENTRT_ENDPOINT`, `AGENTRT_TIMEOUT`, `AGENTRT_API_KEY`), then a `http://127.0.0.1:18789` default.

### Downstream

- **Agent applications**: User-written agents import `@agentrt/sdk` to become runtime tenants.
- **Web frontends**: Browser-side dashboards and agent consoles that call the runtime via a gateway.
- **Examples**: Reference agents in the platform `ecosystem/examples/`.

## Installation

```bash
# From npm (when published)
npm install @agentrt/sdk

# From source
cd sdk-typescript
npm install
npm run build
```

**Requirements:** Node.js >= 18. Runtime dependencies: `axios` (HTTP), `ws` (WebSocket streaming). Dev dependencies: `typescript`, `jest`, `ts-jest`, `@types/node`, `eslint`, `prettier`.

## Quick Start

### Create a client

```typescript
import { AgentRTClient, createAgentRT } from '@agentrt/sdk';

const client = new AgentRTClient({
  endpoint: 'http://localhost:18789',
  timeout: 30,
  apiKey: 'your-api-key',
});

// Or use the factory:
const client2 = createAgentRT({ endpoint: 'http://localhost:18789' });
```

### Cognition plane — tasks

```typescript
const task = await client.cognition.submitTask({ input: 'analyze this data' });
const result = await client.cognition.wait(task.id, 60_000);
console.log('Result:', result.output);
```

### Chat plane — streaming

```typescript
for await (const chunk of client.chat.stream({ prompt: 'summarize the report' })) {
  process.stdout.write(chunk.delta ?? '');
}
```

### Configuration

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

### Syscall bindings (lower-level API)

```typescript
import { HttpSyscallBinding, TaskSyscall } from '@agentrt/sdk';

const binding = new HttpSyscallBinding('http://localhost:18789');
const taskSyscall = new TaskSyscall(binding);
const task = await taskSyscall.submit({ description: 'Process data' });
```

## Build & Test

```bash
# Compile TypeScript
npm run build

# Run the test suite
npm test

# Run a specific test
npm test -- --testPathPattern=client

# Run benchmarks
npm run test:performance

# Lint and format
npm run lint
npm run format
```

## Branch Strategy

This leaf repository is developed on **`feature/official-hubs-01`**. The aggregating `sdk` management repo stays on `main`.

## License

Dual-licensed under **AGPL v3 + Apache 2.0** (SPDX: `AGPL-3.0-or-later OR Apache-2.0`). See [LICENSE](LICENSE) for the full text.

Copyright (c) 2025-2026 **SPHARX Ltd.** All Rights Reserved.
