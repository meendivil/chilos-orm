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
exports.AuthorModel = void 0;
var src_1 = require("../src");
var AuthorModel = /** @class */ (function (_super) {
    __extends(AuthorModel, _super);
    function AuthorModel(params) {
        var _this = _super.call(this) || this;
        _this.id = 0;
        _this.name = '';
        _this.email = '';
        _this.country = '';
        _this.softDelete = false;
        if (params)
            Object.assign(_this, params);
        return _this;
    }
    AuthorModel.tableName = 'author';
    AuthorModel.idName = 'id';
    AuthorModel.relationships = {
        // One author has many books
        books: AuthorModel.hasMany(function () { return require('./BookModel').BookModel; }, {
            foreignKey: 'author_id',
        }),
        // One author has one profile
        profile: AuthorModel.hasOne(function () { return require('./AuthorProfileModel').AuthorProfileModel; }, {
            foreignKey: 'author_id',
        }),
    };
    return AuthorModel;
}(src_1.BaseModel));
exports.AuthorModel = AuthorModel;
