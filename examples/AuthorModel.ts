import { BaseModel } from '../src'

export class AuthorModel extends BaseModel {

  static tableName = 'author';
  static idName = 'id';

  static relationships = {
    // One author has many books
    books: AuthorModel.hasMany(() => require('./BookModel').BookModel, {
    foreignKey: 'author_id',
    }),
    // One author has one profile
    profile: AuthorModel.hasOne(() => require('./AuthorProfileModel').AuthorProfileModel, {
    foreignKey: 'author_id',
    }),
  };

  public id: number = 0;
  public name: string = '';
  public email: string = '';
  public country: string = '';
  public softDelete: boolean = false;

  constructor(params?: Partial<AuthorModel>) {
    super();
    if (params) Object.assign(this, params);
  }
  
}