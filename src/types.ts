// ─── Database query result ────────────────────────────────────────────────────

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

// ─── Service method return type ──────────────────────────────────────────────

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: OrmError;
}

// ─── Typed errors ────────────────────────────────────────────────────────────

export class OrmError extends Error {
  public readonly code: string;
  public readonly cause?: Error;

  constructor(message: string, code: string, cause?: Error) {
    super(message);
    this.name = 'OrmError';
    this.code = code;
    this.cause = cause;
  }
}

export class ConnectionError extends OrmError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONNECTION_ERROR', cause);
    this.name = 'ConnectionError';
  }
}

export class QueryError extends OrmError {
  constructor(message: string, cause?: Error) {
    super(message, 'QUERY_ERROR', cause);
    this.name = 'QueryError';
  }
}

// ─── Query Builder types ─────────────────────────────────────────────────────

export type ComparisonOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike';

// ─── Legacy criteria format (backwards compatibility) ────────────────────────

export interface OperatorGroup {
  eq?: Record<string, unknown>;
  like?: Record<string, string>;
}

export interface FilterCriteria {
  and?: OperatorGroup;
  or?: OperatorGroup;
}

// ─── Relationships ───────────────────────────────────────────────────────────

export type RelationType = 'hasMany' | 'hasOne' | 'belongsTo';

export interface Relationship {
  type: RelationType;
  model: () => typeof import('./BaseModel').BaseModel;  // lazy function to avoid circular deps
  foreignKey: string;
  localKey?: string;
  ownerKey?: string;
  eager?: boolean;
}

export interface RelationshipOptions {
  foreignKey?: string;
  localKey?: string;
  ownerKey?: string;
  eager?: boolean;
}