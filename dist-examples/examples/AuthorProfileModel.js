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
exports.AuthorProfileModel = void 0;
var src_1 = require("../src");
var AuthorProfileModel = /** @class */ (function (_super) {
    __extends(AuthorProfileModel, _super);
    function AuthorProfileModel(params) {
        var _this = _super.call(this) || this;
        _this.id = 0;
        _this.authorId = 0;
        _this.bio = '';
        _this.website = '';
        _this.bornAt = '';
        _this.softDelete = false;
        if (params)
            Object.assign(_this, params);
        return _this;
    }
    AuthorProfileModel.tableName = 'author_profile';
    AuthorProfileModel.idName = 'id';
    AuthorProfileModel.relationships = {
        // Each profile belongs to one author
        author: AuthorProfileModel.belongsTo(function () { return require('./AuthorModel').AuthorModel; }, {
            foreignKey: 'author_id',
        }),
    };
    return AuthorProfileModel;
}(src_1.BaseModel));
exports.AuthorProfileModel = AuthorProfileModel;
