/**
 * Convierte camelCase a snake_case.
 * bookId → book_id
 * softDelete → soft_delete
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');  // evitar _book_id si empieza con mayúscula
}

/**
 * Convierte snake_case a camelCase.
 * package_type_id → packageTypeId
 * soft_delete → softDelete
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}