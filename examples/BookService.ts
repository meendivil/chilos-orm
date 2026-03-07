import { DataService, DatabaseAdapter } from '../src';
import { BookModel } from './BookModel';

export class BookService extends DataService<BookModel> {

  constructor(adapter: DatabaseAdapter) {
    super(new BookModel(), adapter);
  }

  public async findByName(name: string) {
    return this.findOneWhere(qb =>
      qb.where('name', 'eq', name)
    );
  }

  public async findByIsbn(isbn: string) {
    return this.findOneWhere(qb =>
      qb.where('isbn', 'eq', isbn)
    );
  }

  public async findByAuthor(authorId: number) {
    return this.findWhere(qb =>
      qb.where('authorId', 'eq', authorId)
        .andWhere('softDelete', 'eq', false)
        .orderBy('name')
    );
  }

  public async findByPublisher(publisherId: number) {
    return this.findWhere(qb =>
      qb.where('publisherId', 'eq', publisherId)
        .andWhere('softDelete', 'eq', false)
    );
  }

  public async search(term: string) {
    return this.findWhere(qb =>
      qb.where('name', 'ilike', `%${term}%`)
        .orWhere('description', 'ilike', `%${term}%`)
    );
  }
  
}