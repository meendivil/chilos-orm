# chilos-orm

A lightweight, TypeScript-first ORM with pluggable database adapters, parameterized queries, a fluent query builder, and built-in relationship support.

## Features

- **Multi-database support** — PostgreSQL, MySQL, and SQLite out of the box
- **Parameterized queries** — protection against SQL injection by default
- **Fluent query builder** — chainable API with support for `where`, `orWhere`, `orderBy`, `limit`, `offset`
- **Relationships** — `hasMany`, `hasOne`, `belongsTo` with lazy loading
- **Hydrated models** — query results are returned as proper model instances with methods, not plain objects
- **Serialization** — `toJSON()` includes nested relationship data
- **Zero magic** — no global state, explicit wiring, easy to test

## Supported Databases

| Database   | Adapter           | Driver (peer dependency)  |
|------------|-------------------|---------------------------|
| PostgreSQL | `PostgresAdapter` | `pg`                      |
| MySQL      | `MySQLAdapter`    | `mysql2`                  |
| SQLite     | `SQLiteAdapter`   | `better-sqlite3`          |

All three adapters expose the same `DatabaseAdapter` interface. Your models, services, and queries work identically across databases — the adapter handles dialect differences internally (placeholder conversion, `ILIKE` support, boolean handling, etc.).

## Installation

```bash
npm install chilos-orm
```

Then install the driver for your database:

```bash
# PostgreSQL
npm install pg

# MySQL
npm install mysql2

# SQLite
npm install better-sqlite3
```

## Quick Start

### 1. Define a model

Models extend `BaseModel` and declare their table name, primary key, and fields as static/public properties:

```typescript
import { BaseModel } from 'chilos-orm';

export class BookModel extends BaseModel {

  static tableName = 'book';
  static idName = 'bookId';

  public bookId: number = 0;
  public name: string = '';
  public description: string = '';
  public price: number = 0;
  public isbn: string = '';
  public stock: number = 0;
  public authorId: number = 0;
  public softDelete: boolean = false;

  constructor(params?: Partial<BookModel>) {
    super();
    if (params) Object.assign(this, params);
  }
}
```

### 2. Create an adapter and connect

```typescript
import { PostgresAdapter } from 'chilos-orm';

const adapter = new PostgresAdapter({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'secret',
  database: 'bookstore',
});
await adapter.connect();
```

Switching databases is a one-line change:

```typescript
import { MySQLAdapter } from 'chilos-orm';

const adapter = new MySQLAdapter({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'secret',
  database: 'bookstore',
});

// Or SQLite — no server needed:
import { SQLiteAdapter } from 'chilos-orm';

const adapter = new SQLiteAdapter({
  database: './bookstore.sqlite',
});
```

### 3. Create a service and use it

```typescript
import { DataService } from 'chilos-orm';
import { BookModel } from './BookModel';

const bookService = new DataService(new BookModel(), adapter);

// Create
await bookService.save(new BookModel({ name: 'Dune', price: 14.99, isbn: '0441013597' }));

// Read
const book = await bookService.getById(1);
const allBooks = await bookService.getAll();

// Update
const dune = new BookModel({ bookId: 1, name: 'Dune', price: 12.99 });
await bookService.update(dune);

// Soft delete
await bookService.softDeleteById(1);

// Disconnect when done
await adapter.disconnect();
```

## Custom Services

Extend `DataService` to add domain-specific query methods:

```typescript
import { DataService, DatabaseAdapter } from 'chilos-orm';
import { BookModel } from './BookModel';

export class BookService extends DataService<BookModel> {

  constructor(adapter: DatabaseAdapter) {
    super(new BookModel(), adapter);
  }

  async findByIsbn(isbn: string) {
    return this.findOneWhere(qb =>
      qb.where('isbn', 'eq', isbn)
    );
  }

  async findByAuthor(authorId: number) {
    return this.findWhere(qb =>
      qb.where('authorId', 'eq', authorId)
        .andWhere('softDelete', 'eq', false)
        .orderBy('name')
    );
  }

  async search(term: string) {
    return this.findWhere(qb =>
      qb.where('name', 'ilike', `%${term}%`)
        .orWhere('description', 'ilike', `%${term}%`)
    );
  }
}
```

## Query Builder

The query builder produces parameterized SQL. Values are never interpolated into the query string.

```typescript
const results = await bookService.findWhere(qb =>
  qb.where('price', 'lt', 12)
    .andWhere('stock', 'gt', 0)
    .andWhere('softDelete', 'eq', false)
    .orderBy('price', 'DESC')
    .limit(20)
);
```

### Available Operators

| Operator | SQL      | Example                              |
|----------|----------|--------------------------------------|
| `eq`     | `=`      | `.where('status', 'eq', 'active')`   |
| `neq`    | `!=`     | `.where('stock', 'neq', 0)`          |
| `gt`     | `>`      | `.where('price', 'gt', 10)`          |
| `gte`    | `>=`     | `.where('stock', 'gte', 5)`          |
| `lt`     | `<`      | `.where('price', 'lt', 20)`          |
| `lte`    | `<=`     | `.where('price', 'lte', 15)`         |
| `like`   | `LIKE`   | `.where('name', 'like', '%Dune%')`   |
| `ilike`  | `ILIKE`  | `.where('name', 'ilike', '%dune%')`  |

> `ilike` is automatically converted to `LIKE` on MySQL and SQLite, where `LIKE` is already case-insensitive.

### Legacy Criteria Format

The original object-based criteria format is also supported for backwards compatibility:

```typescript
await bookService.findByCriteria({
  and: {
    eq: { isbn: '0439708184' },
    like: { description: '%Harry Potter%' },
  },
  or: {
    eq: { price: 10 },
  },
});
```

## Relationships

Models support `hasMany`, `hasOne`, and `belongsTo` relationships with lazy loading.

### Defining Relationships

```typescript
import { BaseModel } from 'chilos-orm';

export class AuthorModel extends BaseModel {
  static tableName = 'author';
  static idName = 'id';

  static relationships = {
    books: AuthorModel.hasMany(() => require('./BookModel').BookModel, {
      foreignKey: 'author_id',
    }),
    profile: AuthorModel.hasOne(() => require('./AuthorProfileModel').AuthorProfileModel, {
      foreignKey: 'author_id',
    }),
  };

  public id: number = 0;
  public name: string = '';
  public email: string = '';
  // ...
}

export class BookModel extends BaseModel {
  static tableName = 'book';
  static idName = 'bookId';

  static relationships = {
    author: BookModel.belongsTo(() => require('./AuthorModel').AuthorModel, {
      foreignKey: 'author_id',
    }),
    editions: BookModel.hasMany(() => require('./EditionModel').EditionModel, {
      foreignKey: 'book_id',
      localKey: 'bookId',
    }),
  };

  // ...
}
```

> Relationships use lazy references (`() => require(...)`) to avoid circular dependency issues between models.

### Loading Relationships

```typescript
const authorService = new DataService(new AuthorModel(), adapter);

// Get an author
const result = await authorService.getById(1);
const author = result.data!;

// Load one or multiple relationships
await author.load('books', authorService);
await author.load(['books', 'profile'], authorService);

// Access loaded data
const books = author.getRelated('books');
const profile = author.getRelated('profile');
```

### Relationship Types

| Type         | Description                        | Foreign key lives on |
|--------------|------------------------------------|----------------------|
| `hasMany`    | One-to-many (Author → Books)       | Related model        |
| `hasOne`     | One-to-one (Author → Profile)      | Related model        |
| `belongsTo`  | Many-to-one / inverse (Book → Author) | This model        |

### Serialization

`toJSON()` includes loaded relationship data, with nested serialization:

```typescript
await author.load(['books', 'profile'], authorService);
console.log(JSON.stringify(author.toJSON(), null, 2));
```

```json
{
  "id": 1,
  "name": "J.K. Rowling",
  "email": "jk@example.com",
  "books": [
    { "bookId": 1, "name": "Harry Potter and the Sorcerer's Stone", "price": 9.99 },
    { "bookId": 2, "name": "Harry Potter and the Chamber of Secrets", "price": 10.99 }
  ],
  "profile": {
    "bio": "British author best known for the Harry Potter series.",
    "website": "https://jkrowling.com"
  }
}
```

## Cross-Database Compatibility

Each adapter internally handles dialect differences so your code stays the same:

| Feature             | PostgreSQL      | MySQL             | SQLite              |
|---------------------|-----------------|-------------------|---------------------|
| Placeholders        | `$1, $2, $3`    | Converted to `?`  | Converted to `?`    |
| `ILIKE`             | Native          | Converted to `LIKE` | Converted to `LIKE` |
| `RETURNING *`       | Native          | Removed           | Removed             |
| Boolean params      | `true`/`false`  | `true`/`false`    | Converted to `1`/`0` |
| Connection          | Pool (`pg`)     | Pool (`mysql2`)   | File (`better-sqlite3`) |

## Examples

The `examples/` folder contains working demos for all three databases:

```
examples/
├── AuthorModel.ts           # Model with hasMany + hasOne
├── AuthorProfileModel.ts    # Model with belongsTo
├── BookModel.ts             # Model with belongsTo + hasMany
├── BookService.ts           # Custom service with query builder methods
├── EditionModel.ts          # Model with belongsTo
├── PublisherModel.ts        # Model with hasMany
├── demo_pg.ts               # Full PostgreSQL demo
├── demo_mysql.ts            # Full MySQL demo
├── demo_sqlite.ts           # Full SQLite demo
├── schema_pg.sql            # PostgreSQL schema + seed data
├── schema_mysql.sql         # MySQL schema + seed data
└── schema_sqlite.sql        # SQLite schema + seed data
```

### Running the examples

```bash
# PostgreSQL
psql -U postgres -c "CREATE DATABASE bookstore;"
psql -U postgres -d bookstore -f examples/schema_pg.sql
npx ts-node examples/demo_pg.ts

# MySQL
mysql -u root -p < examples/schema_mysql.sql
npx ts-node examples/demo_mysql.ts

# SQLite
sqlite3 bookstore.sqlite < examples/schema_sqlite.sql
npx ts-node examples/demo_sqlite.ts
```

## Error Handling

All errors extend `OrmError` with a `code` property:

```typescript
import { ConnectionError, QueryError } from 'chilos-orm';

try {
  await bookService.save(new BookModel({ name: 'Test' }));
} catch (err) {
  if (err instanceof QueryError) {
    console.error('Query failed:', err.message, err.code);
  }
  if (err instanceof ConnectionError) {
    console.error('Connection issue:', err.message);
  }
}
```

| Error             | Code                | When                           |
|-------------------|---------------------|--------------------------------|
| `ConnectionError` | `CONNECTION_ERROR`  | Can't connect / not connected  |
| `QueryError`      | `QUERY_ERROR`       | SQL execution failure          |
| `OrmError`        | (custom)            | Base class for all ORM errors  |

## Project Structure

```
src/
├── index.ts                  # Public exports
├── types.ts                  # Interfaces, error classes, type definitions
├── BaseModel.ts              # Abstract model with relationships and serialization
├── DataService.ts            # Generic CRUD, query builder, relationship loading
├── QueryBuilder.ts           # Fluent parameterized query builder
├── utils.ts                  # toSnakeCase / toCamelCase helpers
└── adapters/
    ├── DatabaseAdapter.ts    # Adapter interface
    ├── PostgresAdapter.ts    # PostgreSQL implementation (pg)
    ├── MySQLAdapter.ts       # MySQL implementation (mysql2)
    └── SQLiteAdapter.ts      # SQLite implementation (better-sqlite3)
```

## License

MIT
