/**
 * Converts camelCase to snake_case.
 * bookId → book_id
 * softDelete → soft_delete
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');  // avoid _book_id if string starts with uppercase
}

/**
 * Converts snake_case to camelCase.
 * package_type_id → packageTypeId
 * soft_delete → softDelete
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}