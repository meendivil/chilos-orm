import { DataService, DatabaseAdapter } from '../src';
import { BookModel } from './BookModel';

export class BookService extends DataService<BookModel> {

  constructor(adapter: DatabaseAdapter) {
    super(new BookModel(), adapter);
  }

  public async findByName(name: string) {
    // ANTES: `SELECT * FROM book WHERE name = '${name}'`  ← SQL injection
    // AHORA: parametrizado
    return this.findOneWhere(qb =>
      qb.where('name', 'eq', name)
    );
  }

  public async findByIsbn(isbn: string) {
    return this.findOneWhere(qb =>
      qb.where('isbn', 'eq', isbn)
    );
  }

  public async search(term: string) {
    return this.findWhere(qb =>
      qb.where('name', 'ilike', `%${term}%`)
        .orWhere('description', 'ilike', `%${term}%`)
    );
  }

  public async findInStock() {
    return this.findWhere(qb =>
      qb.where('stock', 'gt', 0)
        .andWhere('softDelete', 'eq', false)
        .orderBy('name')
    );
  }
}