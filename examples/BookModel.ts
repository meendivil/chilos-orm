import { BaseModel } from '../src';

export class BookModel extends BaseModel {

  static tableName = 'book';
  static idName = 'bookId';

  static relationships = {
    // Each book belongs to one author
    author: BookModel.belongsTo(() => require('./AuthorModel').AuthorModel, {
      foreignKey: 'author_id',
    }),
    // Each book belongs to one publisher
    publisher: BookModel.belongsTo(() => require('./PublisherModel').PublisherModel, {
      foreignKey: 'publisher_id',
    }),
    // One book has many editions
    editions: BookModel.hasMany(() => require('./EditionModel').EditionModel, {
      foreignKey: 'book_id',
      localKey: 'bookId',
    }),
  };

  public bookId: number = 0;
  public name: string = '';
  public description: string = '';
  public price: number = 0;
  public isbn: string = '';
  public stock: number = 0;
  public authorId: number = 0;
  public publisherId: number = 0;
  public softDelete: boolean = false;

  constructor(params?: Partial<BookModel>) {
    super();
    if (params) Object.assign(this, params);
  }
  
}