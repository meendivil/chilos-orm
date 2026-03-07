// Core
export { BaseModel } from './BaseModel';
export { DataService } from './DataService';
export { QueryBuilder } from './QueryBuilder';

// Adapters
export { PostgresAdapter } from './adapters/PostgresAdapter';
export { MySQLAdapter } from './adapters/MySQLAdapter';
export { SQLiteAdapter } from './adapters/SQLiteAdapter'
export type { SQLiteConfig } from './adapters/SQLiteAdapter';
export type { DatabaseAdapter, DatabaseConfig } from './adapters/DatabaseAdapter';

// Types
export type {
    QueryResult,
    ServiceResult,
    FilterCriteria,
    ComparisonOperator,
    Relationship,
    RelationshipOptions,
    RelationType
} from './types';

export { OrmError, ConnectionError, QueryError } from './types';

// Utils
export { toSnakeCase } from './utils';