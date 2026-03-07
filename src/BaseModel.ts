import { Relationship, RelationshipOptions } from './types';
import { toSnakeCase } from './utils';

export abstract class BaseModel {

  // ─── Metadata (static) ──────────────────────────────────────────────────

  static tableName: string = '';
  static idName: string = 'id';
  static relationships: Record<string, Relationship> = {};

  // ─── Loaded relationship data ───────────────────────────────────────────

  protected _relatedData: Record<string, any> = {};
  protected _loadedRelations: Set<string> = new Set();

  constructor() {
    this._relatedData = {};
    this._loadedRelations = new Set();
  }

  // ─── Base accessors ─────────────────────────────────────────────────────

  getTableName(): string {
    return (this.constructor as typeof BaseModel).tableName;
  }

  getIdName(): string {
    return (this.constructor as typeof BaseModel).idName;
  }

  getId(): unknown {
    return (this as any)[(this.constructor as typeof BaseModel).idName];
  }

  setId(id: number | string): void {
    (this as any)[(this.constructor as typeof BaseModel).idName] = id;
  }

  // ─── toRecord ──────────────────────────────────────────────────────────

  /**
   * Returns the model properties as key-value pairs,
   * excluding internal fields.
   */
  toRecord(): Record<string, unknown> {
    const record: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this)) {
      if (key.startsWith('_') || key === 'relationships') continue;
      record[key] = value;
    }
    return record;
  }

  // ─── Relationship definition (static helpers) ──────────────────────────
  //
  // Usage in a model:
  //   static relationships = {
  //     sessions: PackageTypeModel.hasMany(() => PackageSessionTypeModel, {
  //       foreignKey: 'package_type_id'
  //     }),
  //   };

  static hasMany(
    relatedModel: () => typeof BaseModel,
    options: RelationshipOptions = {}
  ): Relationship {
    const foreignKey = options.foreignKey
      || `${toSnakeCase(this.name.replace('Model', ''))}_id`;
    const localKey = options.localKey || this.idName;

    return {
      type: 'hasMany',
      model: relatedModel,
      foreignKey,
      localKey,
      eager: options.eager ?? false,
    };
  }

  static hasOne(
    relatedModel: () => typeof BaseModel,
    options: RelationshipOptions = {}
  ): Relationship {
    const foreignKey = options.foreignKey
      || `${toSnakeCase(this.name.replace('Model', ''))}_id`;
    const localKey = options.localKey || this.idName;

    return {
      type: 'hasOne',
      model: relatedModel,
      foreignKey,
      localKey,
      eager: options.eager ?? false,
    };
  }

  static belongsTo(
    relatedModel: () => typeof BaseModel,
    options: RelationshipOptions = {}
  ): Relationship {
    // foreignKey default is resolved at load time since the reference is lazy
    const foreignKey = options.foreignKey || ''; 
    const ownerKey = options.ownerKey || 'id';

    return {
      type: 'belongsTo',
      model: relatedModel,
      foreignKey,
      ownerKey,
      eager: options.eager ?? false,
    };
  }

  // ─── Relationship loading ──────────────────────────────────────────────
  //
  // Receives the DataService as a parameter to avoid circular dependencies.
  //
  // Usage:
  //   const pkg = await packageService.getById(1);
  //   await pkg.data.load('sessions', dataService);
  //   const sessions = pkg.data.getRelated('sessions');

  async load(
    relations: string | string[],
    dataService: any  // DataService — usamos any para evitar circular dep
  ): Promise<this> {
    const relationNames = typeof relations === 'string' ? [relations] : relations;
    const modelRelationships = (this.constructor as typeof BaseModel).relationships;

    for (const name of relationNames) {
      if (modelRelationships[name]) {
        await this.loadRelation(name, modelRelationships[name], dataService);
      }
    }

    return this;
  }

  private async loadRelation(
    relationName: string,
    relation: Relationship,
    dataService: any
  ): Promise<void> {
    if (this._loadedRelations.has(relationName)) return;

    // Resolve the lazy model reference
    const RelatedModel = relation.model();
    const relatedInstance = new (RelatedModel as any)();

    switch (relation.type) {
      case 'belongsTo':
        await this.loadBelongsTo(relationName, relation, relatedInstance, dataService);
        break;
      case 'hasMany':
        await this.loadHasMany(relationName, relation, RelatedModel, dataService);
        break;
      case 'hasOne':
        await this.loadHasOne(relationName, relation, RelatedModel, dataService);
        break;
    }

    this._loadedRelations.add(relationName);
  }

  private async loadBelongsTo(
    relationName: string,
    relation: Relationship,
    relatedInstance: BaseModel,
    dataService: any
  ): Promise<void> {
    // The foreignKey lives on THIS model (e.g. this.packageTypeId)
    const fkCamel = this.toCamelCase(relation.foreignKey);
    const foreignKeyValue = (this as any)[fkCamel];

    if (foreignKeyValue != null) {
      const result = await dataService.getByIdFrom(relatedInstance, foreignKeyValue);
      if (result.success && result.data) {
        this._relatedData[relationName] = result.data;
      }
    }
  }

  private async loadHasMany(
    relationName: string,
    relation: Relationship,
    RelatedModel: typeof BaseModel,
    dataService: any
  ): Promise<void> {
    // The foreignKey lives on the OTHER model
    const localKeyValue = (this as any)[relation.localKey ?? this.getIdName()];

    if (localKeyValue != null) {
      const result = await dataService.findWhereFrom(
        new (RelatedModel as any)(),
        relation.foreignKey,
        localKeyValue
      );
      if (result.success && result.data) {
        this._relatedData[relationName] = result.data;
      }
    }
  }

  private async loadHasOne(
    relationName: string,
    relation: Relationship,
    RelatedModel: typeof BaseModel,
    dataService: any
  ): Promise<void> {
    const localKeyValue = (this as any)[relation.localKey ?? this.getIdName()];

    if (localKeyValue != null) {
      const result = await dataService.findOneWhereFrom(
        new (RelatedModel as any)(),
        relation.foreignKey,
        localKeyValue
      );
      if (result.success && result.data) {
        this._relatedData[relationName] = result.data;
      }
    }
  }

  // ─── Related data access ────────────────────────────────────────────────

  getRelated<R = any>(relationName: string): R | null {
    return this._relatedData[relationName] ?? null;
  }

  // ─── Serialization ─────────────────────────────────────────────────────

  toJSON(): Record<string, any> {
    const json: Record<string, any> = {};

    // Model's own fields
    for (const [key, value] of Object.entries(this.toRecord())) {
      json[key] = value;
    }

    // Loaded related data
    for (const [key, related] of Object.entries(this._relatedData)) {
      if (Array.isArray(related)) {
        json[key] = related.map(item => item.toJSON ? item.toJSON() : item);
      } else if (related) {
        json[key] = related.toJSON ? related.toJSON() : related;
      }
    }

    return json;
  }

  // ─── Protected utilities ───────────────────────────────────────────────

  protected toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
  }
}