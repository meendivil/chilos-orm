"use strict";
// ─── Database query result ────────────────────────────────────────────────────
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
exports.QueryError = exports.ConnectionError = exports.OrmError = void 0;
// ─── Typed errors ────────────────────────────────────────────────────────────
var OrmError = /** @class */ (function (_super) {
    __extends(OrmError, _super);
    function OrmError(message, code, cause) {
        var _this = _super.call(this, message) || this;
        _this.name = 'OrmError';
        _this.code = code;
        _this.cause = cause;
        return _this;
    }
    return OrmError;
}(Error));
exports.OrmError = OrmError;
var ConnectionError = /** @class */ (function (_super) {
    __extends(ConnectionError, _super);
    function ConnectionError(message, cause) {
        var _this = _super.call(this, message, 'CONNECTION_ERROR', cause) || this;
        _this.name = 'ConnectionError';
        return _this;
    }
    return ConnectionError;
}(OrmError));
exports.ConnectionError = ConnectionError;
var QueryError = /** @class */ (function (_super) {
    __extends(QueryError, _super);
    function QueryError(message, cause) {
        var _this = _super.call(this, message, 'QUERY_ERROR', cause) || this;
        _this.name = 'QueryError';
        return _this;
    }
    return QueryError;
}(OrmError));
exports.QueryError = QueryError;
