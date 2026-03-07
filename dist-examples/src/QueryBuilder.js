"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
var utils_1 = require("./utils");
var QueryBuilder = /** @class */ (function () {
    function QueryBuilder(tableName) {
        this.conditions = [];
        this.orderClauses = [];
        this.tableName = tableName;
    }
    // ─── WHERE ───────────────────────────────────────────────────────────────
    QueryBuilder.prototype.where = function (column, operator, value) {
        this.conditions.push({ logic: 'AND', column: column, operator: operator, value: value });
        return this;
    };
    QueryBuilder.prototype.andWhere = function (column, operator, value) {
        return this.where(column, operator, value);
    };
    QueryBuilder.prototype.orWhere = function (column, operator, value) {
        this.conditions.push({ logic: 'OR', column: column, operator: operator, value: value });
        return this;
    };
    // ─── ORDER / LIMIT / OFFSET ──────────────────────────────────────────────
    QueryBuilder.prototype.orderBy = function (column, direction) {
        if (direction === void 0) { direction = 'ASC'; }
        this.orderClauses.push({ column: column, direction: direction });
        return this;
    };
    QueryBuilder.prototype.limit = function (n) {
        this.limitValue = n;
        return this;
    };
    QueryBuilder.prototype.offset = function (n) {
        this.offsetValue = n;
        return this;
    };
    // ─── BUILD ───────────────────────────────────────────────────────────────
    QueryBuilder.prototype.buildSelect = function (columns) {
        if (columns === void 0) { columns = '*'; }
        var params = [];
        var sql = "SELECT ".concat(columns, " FROM ").concat(this.tableName);
        // WHERE
        if (this.conditions.length > 0) {
            var whereParts = [];
            for (var i = 0; i < this.conditions.length; i++) {
                var c = this.conditions[i];
                var col = (0, utils_1.toSnakeCase)(c.column);
                var sqlOp = this.mapOperator(c.operator);
                params.push(c.value);
                var clause = "".concat(col, " ").concat(sqlOp, " $").concat(params.length);
                whereParts.push(i === 0 ? clause : "".concat(c.logic, " ").concat(clause));
            }
            sql += " WHERE ".concat(whereParts.join(' '));
        }
        // ORDER BY
        if (this.orderClauses.length > 0) {
            var orderParts = this.orderClauses.map(function (o) { return "".concat((0, utils_1.toSnakeCase)(o.column), " ").concat(o.direction); });
            sql += " ORDER BY ".concat(orderParts.join(', '));
        }
        // LIMIT / OFFSET
        if (this.limitValue !== undefined) {
            params.push(this.limitValue);
            sql += " LIMIT $".concat(params.length);
        }
        if (this.offsetValue !== undefined) {
            params.push(this.offsetValue);
            sql += " OFFSET $".concat(params.length);
        }
        return { sql: sql, params: params };
    };
    // ─── PRIVATE ─────────────────────────────────────────────────────────────
    QueryBuilder.prototype.mapOperator = function (op) {
        var map = {
            eq: '=',
            neq: '!=',
            gt: '>',
            gte: '>=',
            lt: '<',
            lte: '<=',
            like: 'LIKE',
            ilike: 'ILIKE',
        };
        return map[op];
    };
    return QueryBuilder;
}());
exports.QueryBuilder = QueryBuilder;
