import { BaseModel } from '../src';

export class AuthorProfileModel extends BaseModel {
  
  static tableName = 'author_profile';
  static idName = 'id';

  static relationships = {
    // Each profile belongs to one author
    author: AuthorProfileModel.belongsTo(() => require('./AuthorModel').AuthorModel, {
      foreignKey: 'author_id',
    }),
  };

  public id: number = 0;
  public authorId: number = 0;
  public bio: string = '';
  public website: string = '';
  public bornAt: string = '';
  public softDelete: boolean = false;

  constructor(params?: Partial<AuthorProfileModel>) {
    super();
    if (params) Object.assign(this, params);
  }
  
}