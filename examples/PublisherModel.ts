import { BaseModel } from '../src';

export class PublisherModel extends BaseModel {

  static tableName = 'publisher';
  static idName = 'id';

  static relationships = {
    books: PublisherModel.hasMany(() => require('./BookModel').BookModel, {
      foreignKey: 'publisher_id',
    }),
  };

  public id: number = 0;
  public name: string = '';
  public country: string = '';
  public foundedYear: number = 0;
  public softDelete: boolean = false;

  constructor(params?: Partial<PublisherModel>) {
    super();
    if (params) Object.assign(this, params);
  }
  
}