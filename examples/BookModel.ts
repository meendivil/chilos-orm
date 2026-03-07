import { BaseModel } from '../src';  // o 'mi-orm' cuando publiques

export class BookModel extends BaseModel {

  public bookId: number;
  public name: string;
  public description: string;
  public price: number;
  public isbn: string;
  public stock: number;
  public softDelete: boolean;

  constructor();
  constructor(bookId: number, name: string, description: string, price: number, isbn: string, stock: number, softDelete: boolean);
  constructor(bookId?: number, name?: string, description?: string, price?: number, isbn?: string, stock?: number, softDelete?: boolean) {
    super("book", "bookId");
    this.bookId = bookId ?? 0;
    this.name = name ?? "";
    this.description = description ?? "";
    this.price = price ?? 0;
    this.isbn = isbn ?? "";
    this.stock = stock ?? 0;
    this.softDelete = softDelete ?? false;
  }
}