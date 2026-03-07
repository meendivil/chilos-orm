import { SQLiteAdapter, DataService } from '../src';
import { BookModel } from './BookModel';
import { BookService } from './BookService';
import { AuthorModel } from './AuthorModel';
import { EditionModel } from './EditionModel';

/**
 * SQLite Demo
 *
 * Setup:
 *   1. npm install better-sqlite3
 *   2. npm install --save-dev @types/better-sqlite3
 *   3. sqlite3 bookstore.sqlite < schema-sqlite.sql
 *   4. npx ts-node examples/demo-sqlite.ts
 *
 * Or use in-memory (no setup needed — schema created inline):
 *   See the in-memory example at the bottom of this file.
 */
async function main() {
  // ─── 1. Connect (file-based) ──────────────────────────────────────────
  const adapter = new SQLiteAdapter({
    database: './bookstore.sqlite',
  });
  await adapter.connect();
  console.log('Connected to SQLite.\n');

  // ─── 2. Services — same API as PostgreSQL and MySQL ───────────────────
  const bookService = new BookService(adapter);
  const authorService = new DataService(new AuthorModel(), adapter);
  const editionService = new DataService(new EditionModel(), adapter);

  // ─── 3. All books ─────────────────────────────────────────────────────
  console.log('=== All Books ===');
  const allBooks = await bookService.getAll();
  allBooks.data?.forEach(b => console.log(`  "${b.name}" — $${b.price}`));
  console.log();

  // ─── 4. belongsTo: Book → Author ─────────────────────────────────────
  console.log('=== belongsTo: Book #1 → Author ===');
  const bookResult = await bookService.getById(1);
  const book = bookResult.data!;
  await book.load(['author', 'publisher'], bookService);
  const author = book.getRelated('author');
  const publisher = book.getRelated('publisher');
  console.log(`Book: "${book.name}"`);
  console.log(`Author: ${author?.name}`);
  console.log(`Publisher: ${publisher?.name}`);
  console.log();

  // ─── 5. hasMany: Author → Books ──────────────────────────────────────
  console.log('=== hasMany: Author #1 → Books ===');
  const authorResult = await authorService.getById(1);
  const jk = authorResult.data!;
  await jk.load(['books', 'profile'], authorService);
  const books = jk.getRelated('books') as BookModel[];
  const profile = jk.getRelated('profile');
  console.log(`Author: ${jk.name}`);
  console.log(`Bio: ${profile?.bio}`);
  console.log(`Books (${books?.length}):`);
  books?.forEach(b => console.log(`  - "${b.name}" ($${b.price})`));
  console.log();

  // ─── 6. hasMany: Book → Editions ──────────────────────────────────────
  console.log('=== hasMany: Book #4 (Dune) → Editions ===');
  const duneResult = await bookService.getById(4);
  const dune = duneResult.data!;
  await dune.load('editions', bookService);
  const editions = dune.getRelated('editions') as EditionModel[];
  console.log(`Book: "${dune.name}"`);
  editions?.forEach(e => console.log(`  - Edition #${e.editionNumber}: ${e.format} (${e.pages} pages)`));
  console.log();

  // ─── 7. Query Builder ────────────────────────────────────────────────
  console.log('=== Query Builder: Books under $12 ===');
  const results = await bookService.findWhere(qb =>
    qb.where('price', 'lt', 12)
      .andWhere('stock', 'gt', 0)
      .orderBy('price', 'DESC')
  );
  results.data?.forEach(b => console.log(`  "${b.name}" — $${b.price}`));
  console.log();

  // ─── 8. Search (LIKE — case-insensitive in SQLite for ASCII) ─────────
  console.log('=== Search: "potter" ===');
  const searchResults = await bookService.search('potter');
  searchResults.data?.forEach(b => console.log(`  "${b.name}"`));
  console.log();

  // ─── 9. toJSON ────────────────────────────────────────────────────────
  console.log('=== toJSON: Full author with relations ===');
  console.log(JSON.stringify(jk.toJSON(), null, 2));
  console.log();

  // ─── 10. Disconnect ──────────────────────────────────────────────────
  await adapter.disconnect();
  console.log('Disconnected.');
}

main().catch(console.error);