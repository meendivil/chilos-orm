"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSnakeCase = toSnakeCase;
exports.toCamelCase = toCamelCase;
/**
 * Converts camelCase to snake_case.
 * bookId → book_id
 * softDelete → soft_delete
 */
function toSnakeCase(str) {
    return str
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, ''); // avoid _book_id if string starts with uppercase
}
/**
 * Converts snake_case to camelCase.
 * package_type_id → packageTypeId
 * soft_delete → softDelete
 */
function toCamelCase(str) {
    return str.replace(/_([a-z])/g, function (_, char) { return char.toUpperCase(); });
}
