// SPDX-FileCopyrightText: 2025-2026 SPHARX Ltd.
// SPDX-License-Identifier: AGPL-3.0-or-later OR Apache-2.0

// AgentRT TypeScript SDK - Client Module
// Version: 0.1.1
// Last updated: 2026-03-24
//
// 提供 HTTP 通信层、APIClient 接口定义和依赖倒转抽象。
// 与 Go SDK client/client.go 保持一致。

export { Client, APIClient } from './client';
export { MockClient } from './mock';
