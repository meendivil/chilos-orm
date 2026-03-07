import { DatabaseAdapter, DatabaseConfig } from './DatabaseAdapter';
import { QueryResult, ConnectionError, QueryError } from '../types';

/**
 * SQLite Database Adapter
 *
 * Uses better-sqlite3 for synchronous, fast SQLite access.
 *
 * Setup:
 *   npm install better-sqlite3
 *   npm install --save-dev @types/better-sqlite3
 *
 * Usage:
 *   const adapter = new SQLiteAdapter({ database: './mydb.sqlite' });
 *   // Or in-memory for testing:
 *   const adapter = new SQLiteAdapter({ database: ':memory:' });
 *
 * Note: host, port, user, and password are ignored — SQLite is file-based.
 */

export interface SQLiteConfig {
  database: string;   // File path (e.g. './data.sqlite') or ':memory:'
  readonly?: boolean;
  wal?: boolean;      // Enable WAL mode for better concurrent read performance
}

export class SQLiteAdapter implements DatabaseAdapter {

  private db: any;
  private config: SQLiteConfig;

  constructor(config: SQLiteConfig | DatabaseConfig) {
    // Accept both SQLiteConfig and DatabaseConfig for compatibility
    if ('database' in config) {
      this.config = {
        database: config.database,
        readonly: (config as SQLiteConfig).readonly ?? false,
        wal: (config as SQLiteConfig).wal ?? true,
      };
    } else {
      this.config = { database: './database.sqlite', wal: true };
    }
  }

  async connect(): Promise<void> {
    try {
      const Database = (await import('better-sqlite3')).default;
      this.db = new Database(this.config.database, {
        readonly: this.config.readonly ?? false,
      });

      // Enable WAL mode for better performance
      if (this.config.wal) {
        this.db.pragma('journal_mode = WAL');
      }

      // Enable foreign keys (disabled by default in SQLite)
      this.db.pragma('foreign_keys = ON');

      // Verify the connection works
      this.db.prepare('SELECT 1').get();
    } catch (err) {
      throw new ConnectionError(
        `Failed to open SQLite database: ${this.config.database}`,
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private convertParams(params: unknown[]): unknown[] {
    return params.map(p => {
      if (typeof p === 'boolean') return p ? 1 : 0;
      return p;
    });
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    if (!this.db) {
      throw new ConnectionError('No active connection. Call connect() first.');
    }

    try {
      // Convert PostgreSQL-style $1, $2, $3 to SQLite-style ?, ?, ?
      const sqliteSql = this.convertPlaceholders(sql);

      // Remove RETURNING * clause (not supported in SQLite < 3.35)
      const cleanSql = this.removeReturning(sqliteSql);

      // Remove ILIKE (not supported in SQLite, use LIKE which is case-insensitive by default for ASCII)
      const finalSql = this.convertIlike(cleanSql);

      const isSelect = finalSql.trim().toUpperCase().startsWith('SELECT');

      const safeParams = this.convertParams(params);

      if (isSelect) {
        const rows = this.db.prepare(finalSql).all(...safeParams);
        return {
          rows: rows as T[],
          rowCount: rows.length,
        };
      } else {
        const result = this.db.prepare(finalSql).run(...safeParams);
        return {
          rows: [] as T[],
          rowCount: result.changes ?? 0,
        };
      }
    } catch (err) {
      throw new QueryError(
        `Query failed: ${sql}`,
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  /**
   * Converts PostgreSQL-style positional parameters ($1, $2, $3)
   * to SQLite-style question mark placeholders (?, ?, ?).
   */
  private convertPlaceholders(sql: string): string {
    return sql.replace(/\$\d+/g, '?');
  }

  /**
   * Removes RETURNING * clause (not supported in older SQLite versions).
   */
  private removeReturning(sql: string): string {
    return sql.replace(/\s+RETURNING\s+\*/i, '');
  }

  /**
   * Converts ILIKE (PostgreSQL-specific) to LIKE.
   * SQLite's LIKE is already case-insensitive for ASCII characters.
   */
  private convertIlike(sql: string): string {
    return sql.replace(/\bILIKE\b/gi, 'LIKE');
  }

}