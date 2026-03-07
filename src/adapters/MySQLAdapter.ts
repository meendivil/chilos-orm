import { DatabaseAdapter, DatabaseConfig } from './DatabaseAdapter';
import { QueryResult, ConnectionError, QueryError } from '../types';

export class MySQLAdapter implements DatabaseAdapter {

  private pool: any;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
    //   const mysql = await import('mysql2/promise');
      const mysql = require('mysql2/promise');
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        waitForConnections: true,
        connectionLimit: this.config.pool?.max ?? 10,
        idleTimeout: this.config.pool?.idleTimeoutMs ?? 30000,
      });

      // Verify the connection works
      const connection = await this.pool.getConnection();
      connection.release();
    } catch (err) {
      throw new ConnectionError(
        `Failed to connect to MySQL at ${this.config.host}:${this.config.port}`,
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
      // Convert PostgreSQL-style $1, $2, $3 placeholders to MySQL-style ?
      const mysqlSql = this.convertPlaceholders(sql);

      const noIlike = this.convertIlike(mysqlSql);  

      // Remove RETURNING * clause (not supported in MySQL)
      const cleanSql = mysqlSql.replace(/\s+RETURNING\s+\*/i, '');

      const [rows, fields] = await this.pool.execute(cleanSql, params);

      // SELECT queries return an array of rows
      // INSERT/UPDATE/DELETE return a ResultSetHeader
      if (Array.isArray(rows)) {
        return {
          rows: rows as T[],
          rowCount: rows.length,
        };
      }

      // For INSERT/UPDATE/DELETE, return affected rows info
      return {
        rows: [] as T[],
        rowCount: (rows as any).affectedRows ?? 0,
      };
    } catch (err) {
      throw new QueryError(
        `Query failed: ${sql}`,
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }

  private convertIlike(sql: string): string {
    return sql.replace(/\bILIKE\b/gi, 'LIKE');
  }

  /**
   * Converts PostgreSQL-style positional parameters ($1, $2, $3)
   * to MySQL-style question mark placeholders (?, ?, ?).
   *
   * Example:
   *   "SELECT * FROM book WHERE id = $1 AND name = $2"
   *   becomes
   *   "SELECT * FROM book WHERE id = ? AND name = ?"
   */
  private convertPlaceholders(sql: string): string {
    return sql.replace(/\$\d+/g, '?');
  }

}