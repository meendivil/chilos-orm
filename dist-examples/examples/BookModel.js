"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookModel = void 0;
var src_1 = require("../src");
var BookModel = /** @class */ (function (_super) {
    __extends(BookModel, _super);
    function BookModel(params) {
        var _this = _super.call(this) || this;
        _this.bookId = 0;
        _this.name = '';
        _this.description = '';
        _this.price = 0;
        _this.isbn = '';
        _this.stock = 0;
        _this.authorId = 0;
        _this.publisherId = 0;
        _this.softDelete = false;
        if (params)
            Object.assign(_this, params);
        return _this;
    }
    BookModel.tableName = 'book';
    BookModel.idName = 'bookId';
    BookModel.relationships = {
        // Each book belongs to one author
        author: BookModel.belongsTo(function () { return require('./AuthorModel').AuthorModel; }, {
            foreignKey: 'author_id',
        }),
        // Each book belongs to one publisher
        publisher: BookModel.belongsTo(function () { return require('./PublisherModel').PublisherModel; }, {
            foreignKey: 'publisher_id',
        }),
        // One book has many editions
        editions: BookModel.hasMany(function () { return require('./EditionModel').EditionModel; }, {
            foreignKey: 'book_id',
            localKey: 'bookId',
        }),
    };
    return BookModel;
}(src_1.BaseModel));
exports.BookModel = BookModel;
