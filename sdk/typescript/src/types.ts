/**
 * ToonDB TypeScript Types
 */

export interface ToonDBConfig {
  /** Base URL of your ToonDB/Supabase project */
  url: string;
  /** API key for authentication */
  apiKey: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

export interface Table {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  schema_fields: Record<string, string>;
  row_count: number;
  data: any;
  toon_content: string | null;
  delimiter: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface QueryResult {
  results: any[];
  executionTimeMs: number;
  rowCount: number;
}

export interface TokenComparison {
  toon: number;
  json: number;
  savings: number;
  savingsPercentage: number;
}

export interface CreateTableOptions {
  name: string;
  toonContent: string;
  description?: string;
  delimiter?: ',' | '\t' | '|';
}

export interface UpdateTableOptions {
  name?: string;
  description?: string;
  toonContent?: string;
  isPublic?: boolean;
}

export interface QueryOptions {
  // Future: add options like limit, offset, etc.
}

export interface ConvertOptions {
  indent?: number;
  delimiter?: ',' | '\t' | '|';
  strict?: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

