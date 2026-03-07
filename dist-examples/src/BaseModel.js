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
exports.BaseModel = void 0;
var utils_1 = require("./utils");
var BaseModel = /** @class */ (function () {
    function BaseModel() {
        // ─── Loaded relationship data ───────────────────────────────────────────
        this._relatedData = {};
        this._loadedRelations = new Set();
        this._relatedData = {};
        this._loadedRelations = new Set();
    }
    // ─── Base accessors ─────────────────────────────────────────────────────
    BaseModel.prototype.getTableName = function () {
        return this.constructor.tableName;
    };
    BaseModel.prototype.getIdName = function () {
        return this.constructor.idName;
    };
    BaseModel.prototype.getId = function () {
        return this[this.constructor.idName];
    };
    BaseModel.prototype.setId = function (id) {
        this[this.constructor.idName] = id;
    };
    // ─── toRecord ──────────────────────────────────────────────────────────
    /**
     * Returns the model properties as key-value pairs,
     * excluding internal fields.
     */
    BaseModel.prototype.toRecord = function () {
        var record = {};
        for (var _i = 0, _a = Object.entries(this); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (key.startsWith('_') || key === 'relationships')
                continue;
            record[key] = value;
        }
        return record;
    };
    // ─── Relationship definition (static helpers) ──────────────────────────
    //
    // Usage in a model:
    //   static relationships = {
    //     sessions: PackageTypeModel.hasMany(() => PackageSessionTypeModel, {
    //       foreignKey: 'package_type_id'
    //     }),
    //   };
    BaseModel.hasMany = function (relatedModel, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var foreignKey = options.foreignKey
            || "".concat((0, utils_1.toSnakeCase)(this.name.replace('Model', '')), "_id");
        var localKey = options.localKey || this.idName;
        return {
            type: 'hasMany',
            model: relatedModel,
            foreignKey: foreignKey,
            localKey: localKey,
            eager: (_a = options.eager) !== null && _a !== void 0 ? _a : false,
        };
    };
    BaseModel.hasOne = function (relatedModel, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var foreignKey = options.foreignKey
            || "".concat((0, utils_1.toSnakeCase)(this.name.replace('Model', '')), "_id");
        var localKey = options.localKey || this.idName;
        return {
            type: 'hasOne',
            model: relatedModel,
            foreignKey: foreignKey,
            localKey: localKey,
            eager: (_a = options.eager) !== null && _a !== void 0 ? _a : false,
        };
    };
    BaseModel.belongsTo = function (relatedModel, options) {
        var _a;
        if (options === void 0) { options = {}; }
        // foreignKey default is resolved at load time since the reference is lazy
        var foreignKey = options.foreignKey || '';
        var ownerKey = options.ownerKey || 'id';
        return {
            type: 'belongsTo',
            model: relatedModel,
            foreignKey: foreignKey,
            ownerKey: ownerKey,
            eager: (_a = options.eager) !== null && _a !== void 0 ? _a : false,
        };
    };
    // ─── Relationship loading ──────────────────────────────────────────────
    //
    // Receives the DataService as a parameter to avoid circular dependencies.
    //
    // Usage:
    //   const pkg = await packageService.getById(1);
    //   await pkg.data.load('sessions', dataService);
    //   const sessions = pkg.data.getRelated('sessions');
    BaseModel.prototype.load = function (relations, dataService // DataService — usamos any para evitar circular dep
    ) {
        return __awaiter(this, void 0, void 0, function () {
            var relationNames, modelRelationships, _i, relationNames_1, name_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        relationNames = typeof relations === 'string' ? [relations] : relations;
                        modelRelationships = this.constructor.relationships;
                        _i = 0, relationNames_1 = relationNames;
                        _a.label = 1;
                    case 1:
                        if (!(_i < relationNames_1.length)) return [3 /*break*/, 4];
                        name_1 = relationNames_1[_i];
                        if (!modelRelationships[name_1]) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.loadRelation(name_1, modelRelationships[name_1], dataService)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, this];
                }
            });
        });
    };
    BaseModel.prototype.loadRelation = function (relationName, relation, dataService) {
        return __awaiter(this, void 0, void 0, function () {
            var RelatedModel, relatedInstance, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this._loadedRelations.has(relationName))
                            return [2 /*return*/];
                        RelatedModel = relation.model();
                        relatedInstance = new RelatedModel();
                        _a = relation.type;
                        switch (_a) {
                            case 'belongsTo': return [3 /*break*/, 1];
                            case 'hasMany': return [3 /*break*/, 3];
                            case 'hasOne': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.loadBelongsTo(relationName, relation, relatedInstance, dataService)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, this.loadHasMany(relationName, relation, RelatedModel, dataService)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.loadHasOne(relationName, relation, RelatedModel, dataService)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        this._loadedRelations.add(relationName);
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseModel.prototype.loadBelongsTo = function (relationName, relation, relatedInstance, dataService) {
        return __awaiter(this, void 0, void 0, function () {
            var fkCamel, foreignKeyValue, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fkCamel = this.toCamelCase(relation.foreignKey);
                        foreignKeyValue = this[fkCamel];
                        if (!(foreignKeyValue != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, dataService.getByIdFrom(relatedInstance, foreignKeyValue)];
                    case 1:
                        result = _a.sent();
                        if (result.success && result.data) {
                            this._relatedData[relationName] = result.data;
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    BaseModel.prototype.loadHasMany = function (relationName, relation, RelatedModel, dataService) {
        return __awaiter(this, void 0, void 0, function () {
            var localKeyValue, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        localKeyValue = this[(_a = relation.localKey) !== null && _a !== void 0 ? _a : this.getIdName()];
                        if (!(localKeyValue != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, dataService.findWhereFrom(new RelatedModel(), relation.foreignKey, localKeyValue)];
                    case 1:
                        result = _b.sent();
                        if (result.success && result.data) {
                            this._relatedData[relationName] = result.data;
                        }
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    BaseModel.prototype.loadHasOne = function (relationName, relation, RelatedModel, dataService) {
        return __awaiter(this, void 0, void 0, function () {
            var localKeyValue, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        localKeyValue = this[(_a = relation.localKey) !== null && _a !== void 0 ? _a : this.getIdName()];
                        if (!(localKeyValue != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, dataService.findOneWhereFrom(new RelatedModel(), relation.foreignKey, localKeyValue)];
                    case 1:
                        result = _b.sent();
                        if (result.success && result.data) {
                            this._relatedData[relationName] = result.data;
                        }
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    // ─── Related data access ────────────────────────────────────────────────
    BaseModel.prototype.getRelated = function (relationName) {
        var _a;
        return (_a = this._relatedData[relationName]) !== null && _a !== void 0 ? _a : null;
    };
    // ─── Serialization ─────────────────────────────────────────────────────
    BaseModel.prototype.toJSON = function () {
        var json = {};
        // Model's own fields
        for (var _i = 0, _a = Object.entries(this.toRecord()); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            json[key] = value;
        }
        // Loaded related data
        for (var _c = 0, _d = Object.entries(this._relatedData); _c < _d.length; _c++) {
            var _e = _d[_c], key = _e[0], related = _e[1];
            if (Array.isArray(related)) {
                json[key] = related.map(function (item) { return item.toJSON ? item.toJSON() : item; });
            }
            else if (related) {
                json[key] = related.toJSON ? related.toJSON() : related;
            }
        }
        return json;
    };
    // ─── Protected utilities ───────────────────────────────────────────────
    BaseModel.prototype.toCamelCase = function (str) {
        return str.replace(/_([a-z])/g, function (_, char) { return char.toUpperCase(); });
    };
    // ─── Metadata (static) ──────────────────────────────────────────────────
    BaseModel.tableName = '';
    BaseModel.idName = 'id';
    BaseModel.relationships = {};
    return BaseModel;
}());
exports.BaseModel = BaseModel;
