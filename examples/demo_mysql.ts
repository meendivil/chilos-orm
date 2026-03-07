import { MySQLAdapter, DataService } from '../src';
import { BookModel } from './BookModel';
import { BookService } from './BookService';
import { AuthorModel } from './AuthorModel';

/**
 * MySQL Demo
 *
 * Setup:
 *   1. npm install mysql2
 *   2. mysql -u root -p < schema-mysql.sql
 *   3. Set environment variables (or edit defaults below)
 *   4. npx ts-node examples/demo-mysql.ts
 */
async function main() {
  const adapter = new MySQLAdapter({
    host: process.env.DB_HOST ?? 'localhost',
    port: 3306,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASS ?? '',
    database: process.env.DB_NAME ?? 'bookstore',
  });
  await adapter.connect();
  console.log('Connected to MySQL.\n');

  // Services work exactly the same — the adapter handles the differences
  const bookService = new BookService(adapter);
  const authorService = new DataService(new AuthorModel(), adapter);

  // ─── All books ────────────────────────────────────────────────────────
  console.log('=== All Books ===');
  const allBooks = await bookService.getAll();
  allBooks.data?.forEach(b => console.log(`  "${b.name}" — $${b.price}`));
  console.log();

  // ─── belongsTo: Book → Author ─────────────────────────────────────────
  console.log('=== belongsTo: Book #1 → Author ===');
  const bookResult = await bookService.getById(1);
  const book = bookResult.data!;
  await book.load('author', bookService);
  const author = book.getRelated('author');
  console.log(`Book: "${book.name}"`);
  console.log(`Author: ${author?.name}`);
  console.log();

  // ─── hasMany: Author → Books ──────────────────────────────────────────
  console.log('=== hasMany: Author #1 → Books ===');
  const authorResult = await authorService.getById(1);
  const jk = authorResult.data!;
  await jk.load('books', authorService);
  const books = jk.getRelated('books') as BookModel[];
  console.log(`Author: ${jk.name}`);
  books?.forEach(b => console.log(`  - "${b.name}"`));
  console.log();

  // ─── Query Builder (same API, adapter converts $1 to ? internally) ────
  console.log('=== Query Builder ===');
  const results = await bookService.findWhere(qb =>
    qb.where('price', 'lt', 12)
      .andWhere('stock', 'gt', 0)
      .orderBy('price', 'DESC')
  );
  results.data?.forEach(b => console.log(`  "${b.name}" — $${b.price}`));

  await adapter.disconnect();
  console.log('\nDisconnected.');
}

main().catch(console.error);