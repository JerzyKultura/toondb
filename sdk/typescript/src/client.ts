import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ToonDBConfig,
  Table,
  QueryResult,
  TokenComparison,
  CreateTableOptions,
  UpdateTableOptions,
  QueryOptions,
  ConvertOptions,
} from './types';
import {
  ToonDBError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from './errors';

/**
 * ToonDB client for TypeScript/JavaScript
 * 
 * @example
 * ```typescript
 * const db = new ToonDB({
 *   url: 'https://your-project.supabase.co',
 *   apiKey: 'your_api_key'
 * });
 * 
 * const table = await db.tables.create({
 *   name: 'users',
 *   toonContent: 'users[2]{id,name}:\n  1,Alice\n  2,Bob'
 * });
 * ```
 */
export class ToonDB {
  private client: AxiosInstance;
  public tables: TablesClient;
  public queries: QueriesClient;
  public converter: ConverterClient;

  constructor(config: ToonDBConfig) {
    this.client = axios.create({
      baseURL: config.url,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          throw new AuthenticationError('Invalid API key or unauthorized');
        }
        if (error.response?.status === 400) {
          const data: any = error.response.data;
          throw new ValidationError(data.error || 'Validation error');
        }
        if (error.response?.status === 404) {
          throw new NotFoundError('Resource not found');
        }
        throw new ToonDBError(error.message);
      }
    );

    this.tables = new TablesClient(this.client);
    this.queries = new QueriesClient(this.client);
    this.converter = new ConverterClient(this.client);
  }
}

class TablesClient {
  constructor(private client: AxiosInstance) {}

  /**
   * List all tables
   */
  async list(): Promise<Table[]> {
    const response = await this.client.get('/api/tables');
    return response.data.tables || [];
  }

  /**
   * Get a specific table
   */
  async get(tableId: string): Promise<Table> {
    const response = await this.client.get(`/api/tables/${tableId}`);
    return response.data.table;
  }

  /**
   * Create a new table from TOON content
   */
  async create(options: CreateTableOptions): Promise<Table> {
    const response = await this.client.post('/api/tables', {
      name: options.name,
      toon_content: options.toonContent,
      description: options.description,
      delimiter: options.delimiter || ',',
    });
    return response.data.table;
  }

  /**
   * Update a table
   */
  async update(tableId: string, options: UpdateTableOptions): Promise<Table> {
    const data: any = {};
    if (options.name !== undefined) data.name = options.name;
    if (options.description !== undefined) data.description = options.description;
    if (options.toonContent !== undefined) data.toon_content = options.toonContent;
    if (options.isPublic !== undefined) data.is_public = options.isPublic;

    const response = await this.client.put(`/api/tables/${tableId}`, data);
    return response.data.table;
  }

  /**
   * Delete a table
   */
  async delete(tableId: string): Promise<boolean> {
    const response = await this.client.delete(`/api/tables/${tableId}`);
    return response.data.success || false;
  }

  /**
   * Update a value in table data using path-based syntax
   * @example
   * ```typescript
   * await db.tables.updateValue('table-id', 'products[id==8].price', 120.00);
   * ```
   */
  async updateValue(tableId: string, path: string, value: any): Promise<{
    success: boolean;
    message: string;
    modifiedCount: number;
  }> {
    const response = await this.client.post(`/api/tables/${tableId}/update`, {
      path,
      value,
    });
    return response.data;
  }

  /**
   * Insert a new item into table data
   * @example
   * ```typescript
   * await db.tables.insertItem('table-id', 'products', { 
   *   id: 16, name: 'New Keyboard', price: 99.99 
   * });
   * ```
   */
  async insertItem(tableId: string, path: string, item: any): Promise<{
    success: boolean;
    message: string;
    insertedCount: number;
  }> {
    const response = await this.client.post(`/api/tables/${tableId}/insert`, {
      path,
      item,
      validate: true,
    });
    return response.data;
  }

  /**
   * Delete items from table data matching selector
   * @example
   * ```typescript
   * await db.tables.deleteItem('table-id', 'products', { name: 'Old Product' });
   * ```
   */
  async deleteItem(tableId: string, path: string, selector: Record<string, any>): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    const response = await this.client.post(`/api/tables/${tableId}/delete`, {
      path,
      selector,
    });
    return response.data;
  }

  /**
   * Execute multiple operations in a single transaction
   * @example
   * ```typescript
   * await db.tables.bulkOperation('table-id', [
   *   { op: 'update', path: 'products[id==8].price', value: 120.00 },
   *   { op: 'insert', path: 'products', item: { id: 17, name: 'New', price: 50 } },
   *   { op: 'delete', path: 'products', selector: { id: 5 } }
   * ]);
   * ```
   */
  async bulkOperation(tableId: string, operations: Array<{
    op: 'update' | 'insert' | 'delete';
    path: string;
    value?: any;
    item?: any;
    selector?: Record<string, any>;
  }>): Promise<{
    success: boolean;
    message: string;
    results: Array<{ success: boolean; message: string; count: number }>;
  }> {
    const response = await this.client.post(`/api/tables/${tableId}/bulk`, {
      operations,
    });
    return response.data;
  }
}

class QueriesClient {
  constructor(private client: AxiosInstance) {}

  /**
   * Execute SQL query on a table
   */
  async execute(tableId: string, sql: string, options?: QueryOptions): Promise<QueryResult> {
    const response = await this.client.post('/api/query', {
      table_id: tableId,
      sql,
    });
    return {
      results: response.data.results,
      executionTimeMs: response.data.execution_time_ms,
      rowCount: response.data.row_count,
    };
  }
}

class ConverterClient {
  constructor(private client: AxiosInstance) {}

  /**
   * Convert JSON to TOON format
   */
  async jsonToToon(jsonData: any, options?: ConvertOptions): Promise<string> {
    const jsonStr = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
    
    const response = await this.client.post('/api/convert', {
      content: jsonStr,
      from_format: 'json',
      to_format: 'toon',
      options: options || {},
    });
    return response.data.output;
  }

  /**
   * Convert TOON to JSON format
   */
  async toonToJson(toonContent: string, options?: ConvertOptions): Promise<any> {
    const response = await this.client.post('/api/convert', {
      content: toonContent,
      from_format: 'toon',
      to_format: 'json',
      options: options || {},
    });
    return JSON.parse(response.data.output);
  }

  /**
   * Compare token counts between TOON and JSON
   */
  async compareTokens(toonContent: string, jsonContent: string): Promise<TokenComparison> {
    // This would call the token counting edge function
    // For now, return a simple comparison
    const toonTokens = toonContent.split(/\s+/).length;
    const jsonTokens = jsonContent.split(/\s+/).length;
    
    return {
      toon: toonTokens,
      json: jsonTokens,
      savings: jsonTokens - toonTokens,
      savingsPercentage: jsonTokens > 0 
        ? Math.round((jsonTokens - toonTokens) / jsonTokens * 100 * 100) / 100 
        : 0,
    };
  }
}

