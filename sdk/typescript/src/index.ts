/**
 * ToonDB TypeScript SDK
 * Official client for ToonDB - Token-Oriented Object Notation Database
 */

export { ToonDB } from './client';
export type {
  ToonDBConfig,
  Table,
  QueryResult,
  TokenComparison,
  CreateTableOptions,
  UpdateTableOptions,
  QueryOptions,
  ConvertOptions,
} from './types';
export {
  ToonDBError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
} from './errors';

