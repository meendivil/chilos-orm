"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.PostgresAdapter = void 0;
var types_1 = require("../types");
var PostgresAdapter = /** @class */ (function () {
    function PostgresAdapter(config) {
        this.config = config;
    }
    PostgresAdapter.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var Pool, client, err_1;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('pg')); })];
                    case 1:
                        Pool = (_g.sent()).Pool;
                        this.pool = new Pool({
                            host: this.config.host,
                            port: this.config.port,
                            user: this.config.user,
                            password: this.config.password,
                            database: this.config.database,
                            min: (_b = (_a = this.config.pool) === null || _a === void 0 ? void 0 : _a.min) !== null && _b !== void 0 ? _b : 2,
                            max: (_d = (_c = this.config.pool) === null || _c === void 0 ? void 0 : _c.max) !== null && _d !== void 0 ? _d : 10,
                            idleTimeoutMillis: (_f = (_e = this.config.pool) === null || _e === void 0 ? void 0 : _e.idleTimeoutMs) !== null && _f !== void 0 ? _f : 30000,
                        });
                        return [4 /*yield*/, this.pool.connect()];
                    case 2:
                        client = _g.sent();
                        client.release();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _g.sent();
                        throw new types_1.ConnectionError("Failed to connect to PostgreSQL at ".concat(this.config.host, ":").concat(this.config.port), err_1 instanceof Error ? err_1 : new Error(String(err_1)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PostgresAdapter.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pool) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.pool.end()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    PostgresAdapter.prototype.query = function (sql_1) {
        return __awaiter(this, arguments, void 0, function (sql, params) {
            var result, err_2;
            var _a;
            if (params === void 0) { params = []; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.pool) {
                            throw new types_1.ConnectionError('No active connection. Call connect() first.');
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.pool.query(sql, params)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, {
                                rows: result.rows,
                                rowCount: (_a = result.rowCount) !== null && _a !== void 0 ? _a : 0,
                            }];
                    case 3:
                        err_2 = _b.sent();
                        throw new types_1.QueryError("Query failed: ".concat(sql), err_2 instanceof Error ? err_2 : new Error(String(err_2)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return PostgresAdapter;
}());
exports.PostgresAdapter = PostgresAdapter;
