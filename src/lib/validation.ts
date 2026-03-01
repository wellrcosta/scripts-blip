/**
 * Funções de validação para o CLI
 */

const BOTAO_LIMITE = 22;
const DESCRICAO_LIMITE = 40;

/**
 * Valida a quantidade de botões/opções
 * WhatsApp permite no máximo 10 itens em uma seção de lista interativa
 * Seguindo especificação: limite de 1 a 12 (com margem)
 */
export function validarQuantidadeOpcoes(input: string): { valido: boolean; valor?: number; mensagem?: string } {
  const trimmed = input.trim();
  
  // Se vazio, inválido
  if (trimmed === '') {
    return { valido: false, mensagem: 'Por favor, digite um número.' };
  }
  
  const num = parseInt(trimmed, 10);
  
  if (isNaN(num)) {
    return { valido: false, mensagem: 'Por favor, digite um número válido.' };
  }
  
  if (num < 1) {
    return { valido: false, mensagem: 'O número mínimo é 1.' };
  }
  
  if (num > 12) {
    return { 
      valido: false, 
      mensagem: `O limite máximo é 12 opções. No WhatsApp, listas interativas têm limite de 10 itens por seção (estamos dando margem até 12).` 
    };
  }
  
  return { valido: true, valor: num };
}

/**
 * Valida o título do botão (máximo 22 caracteres para WhatsApp)
 */
export function validarTituloBotao(texto: string): { valido: boolean; mensagem?: string } {
  if (texto.length > BOTAO_LIMITE) {
    return {
      valido: false,
      mensagem: `O título deve ter no máximo ${BOTAO_LIMITE} caracteres (limite do WhatsApp). Você digitou ${texto.length}.`
    };
  }
  return { valido: true };
}

/**
 * Valida a descrição (máximo 40 caracteres para WhatsApp)
 */
export function validarDescricao(texto: string): { valido: boolean; mensagem?: string } {
  if (texto.length > DESCRICAO_LIMITE) {
    return {
      valido: false,
      mensagem: `A descrição deve ter no máximo ${DESCRICAO_LIMITE} caracteres (limite do WhatsApp). Você digitou ${texto.length}.`
    };
  }
  return { valido: true };
}

/**
 * Pega o valor ou retorna o padrão se vazio
 */
export function getValorOuPadrao(input: string, padrao: string): string {
  const trimmed = input.trim();
  return trimmed === '' ? padrao : trimmed;
}
