import { ComparisonOperator } from './types';
import { toSnakeCase } from './utils';

export interface BuiltQuery {
  sql: string;
  params: unknown[];
}

export class QueryBuilder {

  private tableName: string;
  private conditions: { logic: 'AND' | 'OR'; column: string; operator: ComparisonOperator; value: unknown }[] = [];
  private orderClauses: { column: string; direction: 'ASC' | 'DESC' }[] = [];
  private limitValue?: number;
  private offsetValue?: number;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // ─── WHERE ───────────────────────────────────────────────────────────────

  where(column: string, operator: ComparisonOperator, value: unknown): this {
    this.conditions.push({ logic: 'AND', column, operator, value });
    return this;
  }

  andWhere(column: string, operator: ComparisonOperator, value: unknown): this {
    return this.where(column, operator, value);
  }

  orWhere(column: string, operator: ComparisonOperator, value: unknown): this {
    this.conditions.push({ logic: 'OR', column, operator, value });
    return this;
  }

  // ─── ORDER / LIMIT / OFFSET ──────────────────────────────────────────────

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderClauses.push({ column, direction });
    return this;
  }

  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  offset(n: number): this {
    this.offsetValue = n;
    return this;
  }

  // ─── BUILD ───────────────────────────────────────────────────────────────

  buildSelect(columns: string = '*'): BuiltQuery {
    const params: unknown[] = [];
    let sql = `SELECT ${columns} FROM ${this.tableName}`;

    // WHERE
    if (this.conditions.length > 0) {
      const whereParts: string[] = [];
      for (let i = 0; i < this.conditions.length; i++) {
        const c = this.conditions[i];
        const col = toSnakeCase(c.column);
        const sqlOp = this.mapOperator(c.operator);
        params.push(c.value);
        const clause = `${col} ${sqlOp} $${params.length}`;
        whereParts.push(i === 0 ? clause : `${c.logic} ${clause}`);
      }
      sql += ` WHERE ${whereParts.join(' ')}`;
    }

    // ORDER BY
    if (this.orderClauses.length > 0) {
      const orderParts = this.orderClauses.map(o => `${toSnakeCase(o.column)} ${o.direction}`);
      sql += ` ORDER BY ${orderParts.join(', ')}`;
    }

    // LIMIT / OFFSET
    if (this.limitValue !== undefined) {
      params.push(this.limitValue);
      sql += ` LIMIT $${params.length}`;
    }
    if (this.offsetValue !== undefined) {
      params.push(this.offsetValue);
      sql += ` OFFSET $${params.length}`;
    }

    return { sql, params };
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────────

  private mapOperator(op: ComparisonOperator): string {
    const map: Record<ComparisonOperator, string> = {
      eq: '=',
      neq: '!=',
      gt: '>',
      gte: '>=',
      lt: '<',
      lte: '<=',
      like: 'LIKE',
      ilike: 'ILIKE',
    };
    return map[op];
  }
}