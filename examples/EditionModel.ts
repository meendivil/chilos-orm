import { BaseModel } from '../src';

export class EditionModel extends BaseModel {

  static tableName = 'edition';
  static idName = 'id';

  static relationships = {
    // Each edition belongs to one book
    book: EditionModel.belongsTo(() => require('./BookModel').BookModel, {
      foreignKey: 'book_id',
    }),
  };

  public id: number = 0;
  public bookId: number = 0;
  public editionNumber: number = 1;
  public format: string = 'hardcover';
  public publishDate: string = '';
  public pages: number = 0;
  public softDelete: boolean = false;

  constructor(params?: Partial<EditionModel>) {
    super();
    if (params) Object.assign(this, params);
  }
  
}