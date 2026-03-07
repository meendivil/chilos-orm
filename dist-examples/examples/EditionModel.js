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
exports.EditionModel = void 0;
var src_1 = require("../src");
var EditionModel = /** @class */ (function (_super) {
    __extends(EditionModel, _super);
    function EditionModel(params) {
        var _this = _super.call(this) || this;
        _this.id = 0;
        _this.bookId = 0;
        _this.editionNumber = 1;
        _this.format = 'hardcover';
        _this.publishDate = '';
        _this.pages = 0;
        _this.softDelete = false;
        if (params)
            Object.assign(_this, params);
        return _this;
    }
    EditionModel.tableName = 'edition';
    EditionModel.idName = 'id';
    EditionModel.relationships = {
        // Each edition belongs to one book
        book: EditionModel.belongsTo(function () { return require('./BookModel').BookModel; }, {
            foreignKey: 'book_id',
        }),
    };
    return EditionModel;
}(src_1.BaseModel));
exports.EditionModel = EditionModel;
