/**
 * Funções de escape para gerar código JavaScript seguro
 */

/**
 * Escapa crases, barras invertidas e ${} para template literals
 * Usado no texto do corpo que vai dentro de template strings
 */
export function escapeTemplateLiteral(str: string): string {
  return str
    .replace(/\\/g, '\\\\')  // Escapa barras invertidas primeiro
    .replace(/`/g, '\\`')     // Escapa crases
    .replace(/\$\{/g, '\\${'); // Escapa ${ (template expression)
}

/**
 * Escapa aspas duplas e barras invertidas para strings JSON
 * Usado em valores que vão dentro de JSON
 */
export function escapeJsonString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

/**
 * Escapa caracteres especiais para regex
 * Usado quando o padrão regex contém caracteres que precisam ser escapados
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
