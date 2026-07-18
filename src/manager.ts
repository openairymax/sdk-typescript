// SPDX-FileCopyrightText: 2025-2026 SPHARX Ltd.
// SPDX-License-Identifier: AGPL-3.0-or-later OR Apache-2.0

export {
  manager,
  ClientConfig,
  ConfigOption,
  defaultConfig,
  newConfig,
  newConfigFromEnv,
  validateConfig,
  cloneConfig,
  mergeConfig,
  configToString,
  withEndpoint,
  withTimeout,
  withMaxRetries,
  withRetryDelay,
  withAPIKey,
  withUserAgent,
  withDebug,
  withLogLevel,
  withMaxConnections,
  withHeaders,
  DEFAULT_POLL_INTERVAL_MS,
} from './config';
