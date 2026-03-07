import { PostgresAdapter, DataService } from '../src';
import { BookModel } from './BookModel';
import { BookService } from './BookService';
import { AuthorModel } from './AuthorModel';
import { PublisherModel } from './PublisherModel';
import { AuthorProfileModel } from './AuthorProfileModel';
import { EditionModel } from './EditionModel';

async function main() {
  // ─── 1. Connect ────────────────────────────────────────────────────────
  const adapter = new PostgresAdapter({
    host: process.env.DB_HOST ?? 'localhost',
    port: 5432,
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? '',
    database: process.env.DB_NAME ?? 'bookstore',
  });
  await adapter.connect();
  console.log('Connected to database.\n');

  // ─── 2. Create services ───────────────────────────────────────────────
  const bookService = new BookService(adapter);
  const authorService = new DataService(new AuthorModel(), adapter);
  const publisherService = new DataService(new PublisherModel(), adapter);
  const editionService = new DataService(new EditionModel(), adapter);
  const profileService = new DataService(new AuthorProfileModel(), adapter);

  // ─── 3. Basic CRUD ────────────────────────────────────────────────────
  console.log('=== All Books ===');
  const allBooks = await bookService.getAll();
  console.log(allBooks.data);
  console.log();

  console.log('=== All Authors ===');
  const allAuthors = await authorService.getAll();
  console.log(allAuthors.data);
  console.log();

  // ─── 4. belongsTo — Book → Author & Publisher ─────────────────────────
  console.log('=== belongsTo: Book #1 → Author & Publisher ===');
  const bookResult = await bookService.getById(1);
  const book = bookResult.data!;

  // Load both relationships at once
  await book.load(['author', 'publisher'], bookService);

  const author = book.getRelated('author');
  const publisher = book.getRelated('publisher');
  console.log(`Book: "${book.name}"`);
  console.log(`Author: ${author?.name} (${author?.country})`);
  console.log(`Publisher: ${publisher?.name} (${publisher?.country})`);
  console.log();

  // ─── 5. hasMany — Author → Books ─────────────────────────────────────
  console.log('=== hasMany: Author #1 → Books ===');
  const authorResult = await authorService.getById(1);
  const jkRowling = authorResult.data!;

  await jkRowling.load('books', authorService);

  const rowlingBooks = jkRowling.getRelated('books') as BookModel[];
  console.log(`Author: ${jkRowling.name}`);
  console.log(`Books (${rowlingBooks?.length}):`);
  rowlingBooks?.forEach(b => {
    console.log(`  - "${b.name}" ($${b.price})`);
  });
  console.log();

  // ─── 6. hasOne — Author → Profile ────────────────────────────────────
  console.log('=== hasOne: Author #1 → Profile ===');
  await jkRowling.load('profile', authorService);

  const profile = jkRowling.getRelated('profile');
  console.log(`Author: ${jkRowling.name}`);
  console.log(`Bio: ${profile?.bio}`);
  console.log(`Website: ${profile?.website}`);
  console.log();

  // ─── 7. hasMany — Book → Editions ─────────────────────────────────────
  console.log('=== hasMany: Book #1 → Editions ===');
  await book.load('editions', bookService);

  const editions = book.getRelated('editions') as EditionModel[];
  console.log(`Book: "${book.name}"`);
  console.log(`Editions (${editions?.length}):`);
  editions?.forEach(e => {
    console.log(`  - Edition #${e.editionNumber}: ${e.format}, ${e.pages} pages (${e.publishDate})`);
  });
  console.log();

  // ─── 8. belongsTo — Edition → Book ───────────────────────────────────
  console.log('=== belongsTo: Edition #7 → Book ===');
  const editionResult = await editionService.getById(7);
  const duneEdition = editionResult.data!;

  await duneEdition.load('book', editionService);

  const duneBook = duneEdition.getRelated('book');
  console.log(`Edition: #${duneEdition.editionNumber} (${duneEdition.format})`);
  console.log(`Book: "${duneBook?.name}" — ${duneBook?.description}`);
  console.log();

  // ─── 9. toJSON — Full serialization with nested relations ─────────────
  console.log('=== toJSON: Author with all nested data ===');
  const martinResult = await authorService.getById(2);
  const martin = martinResult.data!;

  await martin.load(['books', 'profile'], authorService);
  console.log(JSON.stringify(martin.toJSON(), null, 2));
  console.log();

  // ─── 10. Query Builder ────────────────────────────────────────────────
  console.log('=== Query Builder: Books under $12 with stock ===');
  const affordable = await bookService.findWhere(qb =>
    qb.where('price', 'lt', 12)
      .andWhere('stock', 'gt', 0)
      .andWhere('softDelete', 'eq', false)
      .orderBy('price', 'DESC')
  );
  affordable.data?.forEach(b => {
    console.log(`  "${b.name}" — $${b.price} (${b.stock} in stock)`);
  });
  console.log();

  // ─── 11. Search ───────────────────────────────────────────────────────
  console.log('=== Search: "Potter" ===');
  const searchResults = await bookService.search('Potter');
  searchResults.data?.forEach(b => {
    console.log(`  "${b.name}" — ${b.isbn}`);
  });
  console.log();

  // ─── 12. Disconnect ──────────────────────────────────────────────────
  await adapter.disconnect();
  console.log('Disconnected.');
}

main().catch(console.error);