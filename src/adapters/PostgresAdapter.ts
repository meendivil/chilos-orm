import { DatabaseAdapter, DatabaseConfig } from './DatabaseAdapter';
import { QueryResult, ConnectionError, QueryError } from '../types';

export class PostgresAdapter implements DatabaseAdapter {
  private pool: any;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Dynamic import — if the user doesn't have pg installed, it fails here with a clear message
      const { Pool } = await import('pg');
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        min: this.config.pool?.min ?? 2,
        max: this.config.pool?.max ?? 10,
        idleTimeoutMillis: this.config.pool?.idleTimeoutMs ?? 30000,
      });

      // Verify the connection works
      const client = await this.pool.connect();
      client.release();
    } catch (err) {
      throw new ConnectionError(
        `Failed to connect to PostgreSQL at ${this.config.host}:${this.config.port}`,
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new ConnectionError('No active connection. Call connect() first.');
    }

    try {
      const result = await this.pool.query(sql, params);
      return {
        rows: result.rows as T[],
        rowCount: result.rowCount ?? 0,
      };
    } catch (err) {
      throw new QueryError(
        `Query failed: ${sql}`,
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }
}