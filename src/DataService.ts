import { BaseModel } from './BaseModel';
import { DatabaseAdapter } from './adapters/DatabaseAdapter';
import { QueryResult, ServiceResult, QueryError, FilterCriteria, OperatorGroup } from './types';
import { toSnakeCase } from './utils';
import { QueryBuilder } from './QueryBuilder';

export class DataService<T extends BaseModel> {

  private adapter: DatabaseAdapter;
  protected model: T;

  constructor(model: T, adapter: DatabaseAdapter) {
    this.model = model;
    this.adapter = adapter;
  }

  // ─── Ejecución de queries ────────────────────────────────────────────────

  /**
   * Ejecuta una query parametrizada.
   *
   * ANTES:  executeQuery("SELECT * FROM book WHERE id = " + id)     ← SQL injection
   * AHORA:  executeQuery("SELECT * FROM book WHERE id = $1", [id])  ← seguro
   */
  protected async executeQuery<R = Record<string, unknown>>(
    query: string,
    params: unknown[] = []
  ): Promise<QueryResult<R>> {
    return this.adapter.query<R>(query, params);
  }

  // ─── READ ────────────────────────────────────────────────────────────────

  public async getById(id: number | string): Promise<ServiceResult<T>> {
    const table = this.model.getTableName();
    const idCol = toSnakeCase(this.model.getIdName());

    const query = `SELECT * FROM ${table} WHERE ${idCol} = $1`;
    const result = await this.executeQuery<T>(query, [id]);

    return {
      success: true,
      data: result.rows[0],
    };
  }

  public async getAll(): Promise<ServiceResult<T[]>> {
    const query = `SELECT * FROM ${this.model.getTableName()}`;
    const result = await this.executeQuery<T>(query);

    return {
      success: true,
      data: result.rows,
    };
  }

  // ─── CREATE ──────────────────────────────────────────────────────────────

  public async save(newModel: BaseModel): Promise<ServiceResult> {
    const record = newModel.toRecord();
    const columns: string[] = [];
    const placeholders: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(record)) {
      columns.push(toSnakeCase(key));
      params.push(value);
      placeholders.push(`$${params.length}`);
    }

    const query = `INSERT INTO ${this.model.getTableName()} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    await this.executeQuery(query, params);

    return { success: true, message: 'Successfully saved' };
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────

  public async update(newModel: BaseModel): Promise<ServiceResult> {
    const record = newModel.toRecord();
    const idName = this.model.getIdName();
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(record)) {
      // No incluir el ID en el SET
      if (key === idName) continue;
      if (value === undefined) continue;

      params.push(value);
      setClauses.push(`${toSnakeCase(key)} = $${params.length}`);
    }

    // El ID va como último parámetro en el WHERE
    params.push(record[idName]);
    const query = `UPDATE ${this.model.getTableName()} SET ${setClauses.join(', ')} WHERE ${toSnakeCase(idName)} = $${params.length}`;
    await this.executeQuery(query, params);

    return { success: true, message: 'Successfully updated' };
  }

  // ─── SOFT DELETE ─────────────────────────────────────────────────────────

  public async softDelete(model: BaseModel): Promise<ServiceResult> {
    const idName = this.model.getIdName();
    const record = model.toRecord();
    const idCol = toSnakeCase(idName);

    const query = `UPDATE ${this.model.getTableName()} SET soft_delete = true WHERE ${idCol} = $1`;
    await this.executeQuery(query, [record[idName]]);

    return { success: true, message: 'Successfully deleted' };
  }

  public async softDeleteById(id: number | string): Promise<ServiceResult> {
    const idCol = toSnakeCase(this.model.getIdName());
    const query = `UPDATE ${this.model.getTableName()} SET soft_delete = true WHERE ${idCol} = $1`;
    await this.executeQuery(query, [id]);

    return { success: true, message: 'Successfully deleted' };
  }

  // ─── FIND BY CRITERIA (tu formato original, pero seguro) ────────────────

  public async findByCriteria(criteria: FilterCriteria): Promise<ServiceResult<T[]>> {
    const params: unknown[] = [];
    let whereClause = '';

    if (criteria.and) {
      whereClause = this.buildFilterGroup('AND', criteria.and, params, whereClause);
    }
    if (criteria.or) {
      whereClause = this.buildFilterGroup('OR', criteria.or, params, whereClause);
    }

    const query = `SELECT * FROM ${this.model.getTableName()} WHERE ${whereClause}`;
    const result = await this.executeQuery<T>(query, params);

    return { success: true, data: result.rows };
  }

  /**
   * Convierte un OperatorGroup en cláusulas SQL parametrizadas.
   *
   * ANTES (tu joinFilter):
   *   query = query + `${el} = '${values[k][el]}'`    ← concatenaba el valor directo
   *
   * AHORA:
   *   query = query + `${el} = $3`                     ← placeholder
   *   params.push(values[k][el])                       ← valor va separado
   */
  private buildFilterGroup(
    logic: 'AND' | 'OR',
    group: OperatorGroup,
    params: unknown[],
    currentQuery: string
  ): string {
    const operatorMap: Record<string, string> = {
      eq: '=',
      like: 'LIKE',
    };

    for (const [operator, fields] of Object.entries(group)) {
      const sqlOp = operatorMap[operator];
      if (!sqlOp || !fields) continue;

      for (const [column, value] of Object.entries(fields)) {
        params.push(value);
        const clause = `${toSnakeCase(column)} ${sqlOp} $${params.length}`;
        currentQuery = currentQuery
          ? `${currentQuery} ${logic} ${clause}`
          : clause;
      }
    }

    return currentQuery;
  }

  // ─── UTILIDAD (expuesta para subclases como BookService) ─────────────────

  protected toSnakeCase(str: string): string {
    return toSnakeCase(str);
  }

  // ─── FIND CON QUERY BUILDER (nueva API fluida) ─────────────────────────

  public async findWhere(
    buildFn: (qb: QueryBuilder) => QueryBuilder
  ): Promise<ServiceResult<T[]>> {
    const qb = new QueryBuilder(this.model.getTableName());
    const built = buildFn(qb).buildSelect();
    const result = await this.executeQuery<T>(built.sql, built.params);

    return { success: true, data: result.rows };
  }

  public async findOneWhere(
    buildFn: (qb: QueryBuilder) => QueryBuilder
  ): Promise<ServiceResult<T>> {
    const qb = new QueryBuilder(this.model.getTableName());
    const built = buildFn(qb).limit(1).buildSelect();
    const result = await this.executeQuery<T>(built.sql, built.params);

    return { success: true, data: result.rows[0] };
  }

  // ─── Métodos para carga de relaciones ──────────────────────────────────

  public async getByIdFrom(
    targetModel: BaseModel,
    id: number | string
  ): Promise<ServiceResult<any>> {
    const table = targetModel.getTableName();
    const idCol = toSnakeCase(targetModel.getIdName());

    const query = `SELECT * FROM ${table} WHERE ${idCol} = $1`;
    const result = await this.executeQuery(query, [id]);

    const row = result.rows[0];
    if (row) {
      return { success: true, data: this.rowToModel(targetModel, row) };
    }
    return { success: true, data: undefined };
  }

  public async findWhereFrom(
    targetModel: BaseModel,
    foreignKey: string,
    value: unknown
  ): Promise<ServiceResult<any[]>> {
    const table = targetModel.getTableName();
    const query = `SELECT * FROM ${table} WHERE ${foreignKey} = $1`;
    const result = await this.executeQuery(query, [value]);

    const models = result.rows.map((row: Record<string, unknown>) => this.rowToModel(targetModel, row));
    return { success: true, data: models };
  }

  public async findOneWhereFrom(
    targetModel: BaseModel,
    foreignKey: string,
    value: unknown
  ): Promise<ServiceResult<any>> {
    const table = targetModel.getTableName();
    const query = `SELECT * FROM ${table} WHERE ${foreignKey} = $1 LIMIT 1`;
    const result = await this.executeQuery(query, [value]);

    const row = result.rows[0];
    if (row) {
      return { success: true, data: this.rowToModel(targetModel, row) };
    }
    return { success: true, data: undefined };
  }

  private rowToModel(targetModel: BaseModel, row: Record<string, unknown>): BaseModel {
    const ModelClass = targetModel.constructor as any;
    const instance = new ModelClass();

    for (const [key, value] of Object.entries(row)) {
      const camelKey = this.toCamelCase(key);
      (instance as any)[camelKey] = value;
    }

    return instance;
  }

  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_: string, char: string) => char.toUpperCase());
  }
}