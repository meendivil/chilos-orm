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
var src_1 = require("../src");
var BookService_1 = require("./BookService");
var AuthorModel_1 = require("./AuthorModel");
var PublisherModel_1 = require("./PublisherModel");
var AuthorProfileModel_1 = require("./AuthorProfileModel");
var EditionModel_1 = require("./EditionModel");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adapter, bookService, authorService, publisherService, editionService, profileService, allBooks, allAuthors, bookResult, book, author, publisher, authorResult, jkRowling, rowlingBooks, profile, editions, editionResult, duneEdition, duneBook, martinResult, martin, affordable, searchResults;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    adapter = new src_1.PostgresAdapter({
                        host: (_a = process.env.DB_HOST) !== null && _a !== void 0 ? _a : 'localhost',
                        port: 5432,
                        user: (_b = process.env.DB_USER) !== null && _b !== void 0 ? _b : 'postgres',
                        password: (_c = process.env.DB_PASS) !== null && _c !== void 0 ? _c : '',
                        database: (_d = process.env.DB_NAME) !== null && _d !== void 0 ? _d : 'bookstore',
                    });
                    return [4 /*yield*/, adapter.connect()];
                case 1:
                    _g.sent();
                    console.log('Connected to database.\n');
                    bookService = new BookService_1.BookService(adapter);
                    authorService = new src_1.DataService(new AuthorModel_1.AuthorModel(), adapter);
                    publisherService = new src_1.DataService(new PublisherModel_1.PublisherModel(), adapter);
                    editionService = new src_1.DataService(new EditionModel_1.EditionModel(), adapter);
                    profileService = new src_1.DataService(new AuthorProfileModel_1.AuthorProfileModel(), adapter);
                    // ─── 3. Basic CRUD ────────────────────────────────────────────────────
                    console.log('=== All Books ===');
                    return [4 /*yield*/, bookService.getAll()];
                case 2:
                    allBooks = _g.sent();
                    console.log(allBooks.data);
                    console.log();
                    console.log('=== All Authors ===');
                    return [4 /*yield*/, authorService.getAll()];
                case 3:
                    allAuthors = _g.sent();
                    console.log(allAuthors.data);
                    console.log();
                    // ─── 4. belongsTo — Book → Author & Publisher ─────────────────────────
                    console.log('=== belongsTo: Book #1 → Author & Publisher ===');
                    return [4 /*yield*/, bookService.getById(1)];
                case 4:
                    bookResult = _g.sent();
                    book = bookResult.data;
                    // Load both relationships at once
                    return [4 /*yield*/, book.load(['author', 'publisher'], bookService)];
                case 5:
                    // Load both relationships at once
                    _g.sent();
                    author = book.getRelated('author');
                    publisher = book.getRelated('publisher');
                    console.log("Book: \"".concat(book.name, "\""));
                    console.log("Author: ".concat(author === null || author === void 0 ? void 0 : author.name, " (").concat(author === null || author === void 0 ? void 0 : author.country, ")"));
                    console.log("Publisher: ".concat(publisher === null || publisher === void 0 ? void 0 : publisher.name, " (").concat(publisher === null || publisher === void 0 ? void 0 : publisher.country, ")"));
                    console.log();
                    // ─── 5. hasMany — Author → Books ─────────────────────────────────────
                    console.log('=== hasMany: Author #1 → Books ===');
                    return [4 /*yield*/, authorService.getById(1)];
                case 6:
                    authorResult = _g.sent();
                    jkRowling = authorResult.data;
                    return [4 /*yield*/, jkRowling.load('books', authorService)];
                case 7:
                    _g.sent();
                    rowlingBooks = jkRowling.getRelated('books');
                    console.log("Author: ".concat(jkRowling.name));
                    console.log("Books (".concat(rowlingBooks === null || rowlingBooks === void 0 ? void 0 : rowlingBooks.length, "):"));
                    rowlingBooks === null || rowlingBooks === void 0 ? void 0 : rowlingBooks.forEach(function (b) {
                        console.log("  - \"".concat(b.name, "\" ($").concat(b.price, ")"));
                    });
                    console.log();
                    // ─── 6. hasOne — Author → Profile ────────────────────────────────────
                    console.log('=== hasOne: Author #1 → Profile ===');
                    return [4 /*yield*/, jkRowling.load('profile', authorService)];
                case 8:
                    _g.sent();
                    profile = jkRowling.getRelated('profile');
                    console.log("Author: ".concat(jkRowling.name));
                    console.log("Bio: ".concat(profile === null || profile === void 0 ? void 0 : profile.bio));
                    console.log("Website: ".concat(profile === null || profile === void 0 ? void 0 : profile.website));
                    console.log();
                    // ─── 7. hasMany — Book → Editions ─────────────────────────────────────
                    console.log('=== hasMany: Book #1 → Editions ===');
                    return [4 /*yield*/, book.load('editions', bookService)];
                case 9:
                    _g.sent();
                    editions = book.getRelated('editions');
                    console.log("Book: \"".concat(book.name, "\""));
                    console.log("Editions (".concat(editions === null || editions === void 0 ? void 0 : editions.length, "):"));
                    editions === null || editions === void 0 ? void 0 : editions.forEach(function (e) {
                        console.log("  - Edition #".concat(e.editionNumber, ": ").concat(e.format, ", ").concat(e.pages, " pages (").concat(e.publishDate, ")"));
                    });
                    console.log();
                    // ─── 8. belongsTo — Edition → Book ───────────────────────────────────
                    console.log('=== belongsTo: Edition #7 → Book ===');
                    return [4 /*yield*/, editionService.getById(7)];
                case 10:
                    editionResult = _g.sent();
                    duneEdition = editionResult.data;
                    return [4 /*yield*/, duneEdition.load('book', editionService)];
                case 11:
                    _g.sent();
                    duneBook = duneEdition.getRelated('book');
                    console.log("Edition: #".concat(duneEdition.editionNumber, " (").concat(duneEdition.format, ")"));
                    console.log("Book: \"".concat(duneBook === null || duneBook === void 0 ? void 0 : duneBook.name, "\" \u2014 ").concat(duneBook === null || duneBook === void 0 ? void 0 : duneBook.description));
                    console.log();
                    // ─── 9. toJSON — Full serialization with nested relations ─────────────
                    console.log('=== toJSON: Author with all nested data ===');
                    return [4 /*yield*/, authorService.getById(2)];
                case 12:
                    martinResult = _g.sent();
                    martin = martinResult.data;
                    return [4 /*yield*/, martin.load(['books', 'profile'], authorService)];
                case 13:
                    _g.sent();
                    console.log(JSON.stringify(martin.toJSON(), null, 2));
                    console.log();
                    // ─── 10. Query Builder ────────────────────────────────────────────────
                    console.log('=== Query Builder: Books under $12 with stock ===');
                    return [4 /*yield*/, bookService.findWhere(function (qb) {
                            return qb.where('price', 'lt', 12)
                                .andWhere('stock', 'gt', 0)
                                .andWhere('softDelete', 'eq', false)
                                .orderBy('price', 'DESC');
                        })];
                case 14:
                    affordable = _g.sent();
                    (_e = affordable.data) === null || _e === void 0 ? void 0 : _e.forEach(function (b) {
                        console.log("  \"".concat(b.name, "\" \u2014 $").concat(b.price, " (").concat(b.stock, " in stock)"));
                    });
                    console.log();
                    // ─── 11. Search ───────────────────────────────────────────────────────
                    console.log('=== Search: "Potter" ===');
                    return [4 /*yield*/, bookService.search('Potter')];
                case 15:
                    searchResults = _g.sent();
                    (_f = searchResults.data) === null || _f === void 0 ? void 0 : _f.forEach(function (b) {
                        console.log("  \"".concat(b.name, "\" \u2014 ").concat(b.isbn));
                    });
                    console.log();
                    // ─── 12. Disconnect ──────────────────────────────────────────────────
                    return [4 /*yield*/, adapter.disconnect()];
                case 16:
                    // ─── 12. Disconnect ──────────────────────────────────────────────────
                    _g.sent();
                    console.log('Disconnected.');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
