/**
 * Gerador de patterns regex para matching de opções
 * Com tolerância a acentos e variações comuns
 */

/**
 * Mapeamento de caracteres para classes regex com acentos
 */
const MAPEAMENTO_ACENTOS: Record<string, string> = {
  'a': '[aáàâãäAÁÀÂÃÄ]',
  'A': '[aáàâãäAÁÀÂÃÄ]',
  'e': '[eéèêëEÉÈÊË]',
  'E': '[eéèêëEÉÈÊË]',
  'i': '[iíìîïIÍÌÎÏ]',
  'I': '[iíìîïIÍÌÎÏ]',
  'o': '[oóòôõöOÓÒÔÕÖ]',
  'O': '[oóòôõöOÓÒÔÕÖ]',
  'u': '[uúùûüUÚÙÛÜ]',
  'U': '[uúùûüUÚÙÛÜ]',
  'c': '[cçCÇ]',
  'C': '[cçCÇ]',
  'n': '[nñNÑ]',
  'N': '[nñNÑ]',
};

/**
 * Converte uma letra para seu padrão regex com acentos
 */
function letraParaRegex(letra: string): string {
  // Se for espaço, retorna \s+
  if (letra === ' ') {
    return '\\s+';
  }
  
  // Se tiver mapeamento, usa a classe
  if (MAPEAMENTO_ACENTOS[letra]) {
    return MAPEAMENTO_ACENTOS[letra];
  }
  
  // Caractere especial que precisa ser escapado em regex
  const especiais = /[.*+?^${}()|[\]\\]/;
  if (especiais.test(letra)) {
    return '\\' + letra;
  }
  
  // Caractere normal
  return letra;
}

/**
 * Gera o pattern regex para um título de opção
 * Ex: "Baixa de Gravame" -> (^1$|Baixa\s+de\s+Gravame).*
 * Com tolerância a acentos
 */
export function gerarPatternRegex(numeroOpcao: number, titulo: string): string {
  const numeroStr = numeroOpcao.toString();
  
  // Monta o padrão do título com tolerância a acentos
  let padraoTitulo = '';
  
  for (const char of titulo) {
    padraoTitulo += letraParaRegex(char);
  }
  
  // O formato é: (^numero$|padraoTitulo).*
  return `(^${numeroStr}$|${padraoTitulo}).*`;
}

/**
 * Interface para opção com seu pattern
 */
export interface OpcaoRegex {
  id: string;
  titulo: string;
  pattern: string;
}

/**
 * Gera todas as opções com patterns regex
 */
export function gerarOpcoesRegex(titulos: string[]): OpcaoRegex[] {
  return titulos.map((titulo, index) => ({
    id: `ID 1.${index + 1}`,
    titulo,
    pattern: gerarPatternRegex(index + 1, titulo)
  }));
}
