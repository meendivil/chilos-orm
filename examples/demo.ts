import { PostgresAdapter } from '../src';
import { BookModel } from './BookModel';
import { BookService } from './BookService';

async function main() {
  // 1. Create adapter and connect
  const adapter = new PostgresAdapter({
    host: process.env.DB_HOST ?? 'localhost',
    port: 5432,
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? '',
    database: process.env.DB_NAME ?? 'bookstore',
  });
  await adapter.connect();

  // 2. Create service
  const bookService = new BookService(adapter);

  // 3. CRUD operations
  const book = new BookModel(1, "Harry Potter and the Sorcerer's Stone", "Harry Potter", 6.28, "0439708184", 1, false);
  await bookService.save(book);
  await bookService.update(book);
  await bookService.getById(1);
  await bookService.getAll();
  await bookService.softDelete(book);
  await bookService.softDeleteById(1);

  // 4. Legacy criteria format — still works
  const byCriteria = await bookService.findByCriteria({
    and: {
      eq: { isbn: "0439708184" },
      like: { description: "%Harry Potter%" },
    },
    or: {
      eq: { price: 10 },
    },
  });
  console.log('By criteria:', byCriteria);

  // 5. New fluent query builder
  const byBuilder = await bookService.findWhere(qb =>
    qb.where('isbn', 'eq', '0439708184')
      .andWhere('description', 'like', '%Harry Potter%')
      .orWhere('price', 'lte', 10)
      .orderBy('name')
      .limit(20)
  );
  console.log('By builder:', byBuilder);

  // 6. Custom BookService methods
  await bookService.findByName("Harry");
  await bookService.search("Potter");

  // 7. Disconnect
  await adapter.disconnect();
}

main().catch(console.error);