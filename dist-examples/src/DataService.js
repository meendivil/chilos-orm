"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
var utils_1 = require("./utils");
var QueryBuilder_1 = require("./QueryBuilder");
var DataService = /** @class */ (function () {
    function DataService(model, adapter) {
        this.model = model;
        this.adapter = adapter;
    }
    // ─── Query execution ─────────────────────────────────────────────────────
    /**
     * Executes a parameterized query.
     *
     * BEFORE: executeQuery("SELECT * FROM book WHERE id = " + id)     ← SQL injection
     * NOW:    executeQuery("SELECT * FROM book WHERE id = $1", [id])  ← safe
     */
    DataService.prototype.executeQuery = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, params) {
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.adapter.query(query, params)];
            });
        });
    };
    // ─── READ ────────────────────────────────────────────────────────────────
    DataService.prototype.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var table, idCol, query, result, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = this.model.getTableName();
                        idCol = (0, utils_1.toSnakeCase)(this.model.getIdName());
                        query = "SELECT * FROM ".concat(table, " WHERE ").concat(idCol, " = $1");
                        return [4 /*yield*/, this.executeQuery(query, [id])];
                    case 1:
                        result = _a.sent();
                        row = result.rows[0];
                        return [2 /*return*/, {
                                success: true,
                                data: row ? this.hydrateRow(row) : undefined,
                            }];
                }
            });
        });
    };
    DataService.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "SELECT * FROM ".concat(this.model.getTableName());
                        return [4 /*yield*/, this.executeQuery(query)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: result.rows.map(function (row) { return _this.hydrateRow(row); }),
                            }];
                }
            });
        });
    };
    // ─── CREATE ──────────────────────────────────────────────────────────────
    DataService.prototype.save = function (newModel) {
        return __awaiter(this, void 0, void 0, function () {
            var record, columns, placeholders, params, _i, _a, _b, key, value, query;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        record = newModel.toRecord();
                        columns = [];
                        placeholders = [];
                        params = [];
                        for (_i = 0, _a = Object.entries(record); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            columns.push((0, utils_1.toSnakeCase)(key));
                            params.push(value);
                            placeholders.push("$".concat(params.length));
                        }
                        query = "INSERT INTO ".concat(this.model.getTableName(), " (").concat(columns.join(', '), ") VALUES (").concat(placeholders.join(', '), ")");
                        return [4 /*yield*/, this.executeQuery(query, params)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, message: 'Successfully saved' }];
                }
            });
        });
    };
    // ─── UPDATE ──────────────────────────────────────────────────────────────
    DataService.prototype.update = function (newModel) {
        return __awaiter(this, void 0, void 0, function () {
            var record, idName, setClauses, params, _i, _a, _b, key, value, query;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        record = newModel.toRecord();
                        idName = this.model.getIdName();
                        setClauses = [];
                        params = [];
                        for (_i = 0, _a = Object.entries(record); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            // Don't include the ID in the SET clause
                            if (key === idName)
                                continue;
                            if (value === undefined)
                                continue;
                            params.push(value);
                            setClauses.push("".concat((0, utils_1.toSnakeCase)(key), " = $").concat(params.length));
                        }
                        // The ID goes as the last parameter in the WHERE clause
                        params.push(record[idName]);
                        query = "UPDATE ".concat(this.model.getTableName(), " SET ").concat(setClauses.join(', '), " WHERE ").concat((0, utils_1.toSnakeCase)(idName), " = $").concat(params.length);
                        return [4 /*yield*/, this.executeQuery(query, params)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, message: 'Successfully updated' }];
                }
            });
        });
    };
    // ─── SOFT DELETE ─────────────────────────────────────────────────────────
    DataService.prototype.softDelete = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var idName, record, idCol, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        idName = this.model.getIdName();
                        record = model.toRecord();
                        idCol = (0, utils_1.toSnakeCase)(idName);
                        query = "UPDATE ".concat(this.model.getTableName(), " SET soft_delete = true WHERE ").concat(idCol, " = $1");
                        return [4 /*yield*/, this.executeQuery(query, [record[idName]])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { success: true, message: 'Successfully deleted' }];
                }
            });
        });
    };
    DataService.prototype.softDeleteById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var idCol, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        idCol = (0, utils_1.toSnakeCase)(this.model.getIdName());
                        query = "UPDATE ".concat(this.model.getTableName(), " SET soft_delete = true WHERE ").concat(idCol, " = $1");
                        return [4 /*yield*/, this.executeQuery(query, [id])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { success: true, message: 'Successfully deleted' }];
                }
            });
        });
    };
    // ─── FIND BY CRITERIA (legacy format, parameterized) ────────────────────
    DataService.prototype.findByCriteria = function (criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var params, whereClause, query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = [];
                        whereClause = '';
                        if (criteria.and) {
                            whereClause = this.buildFilterGroup('AND', criteria.and, params, whereClause);
                        }
                        if (criteria.or) {
                            whereClause = this.buildFilterGroup('OR', criteria.or, params, whereClause);
                        }
                        query = "SELECT * FROM ".concat(this.model.getTableName(), " WHERE ").concat(whereClause);
                        return [4 /*yield*/, this.executeQuery(query, params)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, { success: true, data: result.rows }];
                }
            });
        });
    };
    /**
     * Converts an OperatorGroup into parameterized SQL clauses.
     *
     * BEFORE (joinFilter):
     *   query = query + `${el} = '${values[k][el]}'`    ← concatenated value directly
     *
     * NOW:
     *   query = query + `${el} = $3`                     ← placeholder
     *   params.push(values[k][el])                       ← value goes separately
     */
    DataService.prototype.buildFilterGroup = function (logic, group, params, currentQuery) {
        var operatorMap = {
            eq: '=',
            like: 'LIKE',
        };
        for (var _i = 0, _a = Object.entries(group); _i < _a.length; _i++) {
            var _b = _a[_i], operator = _b[0], fields = _b[1];
            var sqlOp = operatorMap[operator];
            if (!sqlOp || !fields)
                continue;
            for (var _c = 0, _d = Object.entries(fields); _c < _d.length; _c++) {
                var _e = _d[_c], column = _e[0], value = _e[1];
                params.push(value);
                var clause = "".concat((0, utils_1.toSnakeCase)(column), " ").concat(sqlOp, " $").concat(params.length);
                currentQuery = currentQuery
                    ? "".concat(currentQuery, " ").concat(logic, " ").concat(clause)
                    : clause;
            }
        }
        return currentQuery;
    };
    // ─── Utility (exposed for subclasses like BookService) ───────────────────
    DataService.prototype.toSnakeCase = function (str) {
        return (0, utils_1.toSnakeCase)(str);
    };
    // ─── FIND with Query Builder (fluent API) ──────────────────────────────
    DataService.prototype.findWhere = function (buildFn) {
        return __awaiter(this, void 0, void 0, function () {
            var qb, built, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        qb = new QueryBuilder_1.QueryBuilder(this.model.getTableName());
                        built = buildFn(qb).buildSelect();
                        return [4 /*yield*/, this.executeQuery(built.sql, built.params)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: result.rows.map(function (row) { return _this.hydrateRow(row); }),
                            }];
                }
            });
        });
    };
    DataService.prototype.findOneWhere = function (buildFn) {
        return __awaiter(this, void 0, void 0, function () {
            var qb, built, result, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        qb = new QueryBuilder_1.QueryBuilder(this.model.getTableName());
                        built = buildFn(qb).limit(1).buildSelect();
                        return [4 /*yield*/, this.executeQuery(built.sql, built.params)];
                    case 1:
                        result = _a.sent();
                        row = result.rows[0];
                        return [2 /*return*/, {
                                success: true,
                                data: row ? this.hydrateRow(row) : undefined,
                            }];
                }
            });
        });
    };
    // ─── Relationship loading helpers ──────────────────────────────────────
    /**
     * Finds a record by ID from another model's table.
     * Used by belongsTo.
     */
    DataService.prototype.getByIdFrom = function (targetModel, id) {
        return __awaiter(this, void 0, void 0, function () {
            var table, idCol, query, result, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = targetModel.getTableName();
                        idCol = (0, utils_1.toSnakeCase)(targetModel.getIdName());
                        query = "SELECT * FROM ".concat(table, " WHERE ").concat(idCol, " = $1");
                        return [4 /*yield*/, this.executeQuery(query, [id])];
                    case 1:
                        result = _a.sent();
                        row = result.rows[0];
                        if (row) {
                            return [2 /*return*/, { success: true, data: this.rowToModel(targetModel, row) }];
                        }
                        return [2 /*return*/, { success: true, data: undefined }];
                }
            });
        });
    };
    /**
     * Finds multiple records where foreignKey = value.
     * Used by hasMany.
     */
    DataService.prototype.findWhereFrom = function (targetModel, foreignKey, value) {
        return __awaiter(this, void 0, void 0, function () {
            var table, query, result, models;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = targetModel.getTableName();
                        query = "SELECT * FROM ".concat(table, " WHERE ").concat(foreignKey, " = $1");
                        return [4 /*yield*/, this.executeQuery(query, [value])];
                    case 1:
                        result = _a.sent();
                        models = result.rows.map(function (row) { return _this.rowToModel(targetModel, row); });
                        return [2 /*return*/, { success: true, data: models }];
                }
            });
        });
    };
    /**
     * Finds a single record where foreignKey = value.
     * Used by hasOne.
     */
    DataService.prototype.findOneWhereFrom = function (targetModel, foreignKey, value) {
        return __awaiter(this, void 0, void 0, function () {
            var table, query, result, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = targetModel.getTableName();
                        query = "SELECT * FROM ".concat(table, " WHERE ").concat(foreignKey, " = $1 LIMIT 1");
                        return [4 /*yield*/, this.executeQuery(query, [value])];
                    case 1:
                        result = _a.sent();
                        row = result.rows[0];
                        if (row) {
                            return [2 /*return*/, { success: true, data: this.rowToModel(targetModel, row) }];
                        }
                        return [2 /*return*/, { success: true, data: undefined }];
                }
            });
        });
    };
    /**
     * Converts a DB row (snake_case) into a model instance (camelCase).
     */
    DataService.prototype.rowToModel = function (targetModel, row) {
        var ModelClass = targetModel.constructor;
        var instance = new ModelClass();
        for (var _i = 0, _a = Object.entries(row); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            var camelKey = this.toCamelCase(key);
            instance[camelKey] = value;
        }
        return instance;
    };
    /**
     * Converts a DB row into an instance of this service's model.
     */
    DataService.prototype.hydrateRow = function (row) {
        var ModelClass = this.model.constructor;
        var instance = new ModelClass();
        for (var _i = 0, _a = Object.entries(row); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            var camelKey = this.toCamelCase(key);
            instance[camelKey] = value;
        }
        return instance;
    };
    DataService.prototype.toCamelCase = function (str) {
        return str.replace(/_([a-z])/g, function (_, char) { return char.toUpperCase(); });
    };
    return DataService;
}());
exports.DataService = DataService;
