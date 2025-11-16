/**
 * D1 Database Client Wrapper
 * Feature: 004-modular-blog-posts
 * 
 * Provides typed database access with error handling and query utilities
 */

export interface D1Result<T = unknown> {
  success: boolean;
  results?: T[];
  error?: string;
  meta?: {
    changed_db: boolean;
    changes: number;
    duration: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
}

export class DatabaseClient {
  constructor(private db: D1Database) {}

  /**
   * Execute a query and return all results
   */
  async query<T = any>(
    query: string,
    params: any[] = []
  ): Promise<T[]> {
    try {
      const stmt = this.db.prepare(query);
      const result = await stmt.bind(...params).all();
      
      if (!result.success) {
        throw new Error('Database query failed');
      }
      
      return (result.results as T[]) || [];
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a query and return first result or null
   */
  async queryOne<T = any>(
    query: string,
    params: any[] = []
  ): Promise<T | null> {
    const results = await this.query<T>(query, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute an insert/update/delete query
   */
  async execute(
    query: string,
    params: any[] = []
  ): Promise<{ success: boolean; lastRowId?: number; changes?: number }> {
    try {
      const stmt = this.db.prepare(query);
      const result = await stmt.bind(...params).run();
      
      return {
        success: result.success,
        lastRowId: result.meta?.last_row_id,
        changes: result.meta?.changes
      };
    } catch (error) {
      console.error('Database execute error:', error);
      throw new Error(`Database execute failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute multiple queries in a batch
   */
  async batch(queries: { query: string; params: any[] }[]): Promise<boolean> {
    try {
      const statements = queries.map(({ query, params }) =>
        this.db.prepare(query).bind(...params)
      );
      
      const results = await this.db.batch(statements);
      return results.every(r => r.success);
    } catch (error) {
      console.error('Database batch error:', error);
      throw new Error(`Database batch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a record exists
   */
  async exists(
    table: string,
    column: string,
    value: any
  ): Promise<boolean> {
    const result = await this.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${table} WHERE ${column} = ?`,
      [value]
    );
    return (result?.count ?? 0) > 0;
  }

  /**
   * Get raw D1Database instance for advanced operations
   */
  getRawDB(): D1Database {
    return this.db;
  }
}

/**
 * Create a database client instance
 */
export function createDatabaseClient(db: D1Database): DatabaseClient {
  return new DatabaseClient(db);
}
