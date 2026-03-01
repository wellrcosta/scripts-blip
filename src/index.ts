#!/usr/bin/env node
/**
 * CLI para gerar scripts de lista interativa e regex para plataforma Blip
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

interface Opcao {
  id: string;
  titulo: string;
  descricao: string;
}

interface ParsedInput {
  valido: boolean;
  valor?: number;
  mensagem?: string;
}

const CONFIG = {
  TEXTO_PADRAO: '*Clique no botão* e *selecione* sobre qual assunto você deseja falar 👇',
  BOTAO_PADRAO: 'Opções',
  SECAO_PADRAO: 'Escolha uma opção',
  PASTA_SAIDA: './scripts/lista'
};

// Cores ANSI
const COR = {
  reset: '\x1b[0m',
  vermelho: '\x1b[31m',
  verde: '\x1b[32m',
  amarelo: '\x1b[33m',
  ciano: '\x1b[36m',
  negrito: '\x1b[1m'
};

function print(msg: string, cor: string = COR.reset): void {
  console.log(cor + msg + COR.reset);
}

function criarInterface(): readline.Interface {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function perguntar(rl: readline.Interface, texto: string): Promise<string> {
  return new Promise((resolve) => rl.question(texto, resolve));
}

function limparTela(): void {
  console.clear();
}

function mostrarBanner(): void {
  limparTela();
  print('='.repeat(60), COR.ciano);
  print('📋  BLIP LIST GENERATOR', COR.negrito + COR.ciano);
  print('Gerador de scripts de lista interativa', COR.ciano);
  print('='.repeat(60), COR.ciano);
  console.log('');
}

function gerarTimestamp(): string {
  const iso = new Date().toISOString();
  return iso.replace(/:/g, '-').replace(/\./g, '-').replace('T', '_');
}

// ===== ESCAPE FUNCTIONS =====
function escapeTemplateLiteral(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
}

function escapeJsonString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// ===== VALIDATION FUNCTIONS =====
function validarQuantidadeOpcoes(input: string): ParsedInput {
  const trimmed = input.trim();
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
    return { valido: false, mensagem: 'O limite máximo é 12 opções (WhatsApp suporta até 10).' };
  }
  return { valido: true, valor: num };
}

function validarTituloBotao(texto: string): { valido: boolean; mensagem?: string } {
  if (texto.length > 22) {
    return { valido: false, mensagem: `Máximo 22 caracteres (limite WhatsApp). Você digitou ${texto.length}.` };
  }
  return { valido: true };
}

function validarDescricao(texto: string): { valido: boolean; mensagem?: string } {
  if (texto.length > 40) {
    return { valido: false, mensagem: `Máximo 40 caracteres (limite WhatsApp). Você digitou ${texto.length}.` };
  }
  return { valido: true };
}

function getValorOuPadrao(input: string, padrao: string): string {
  const trimmed = input.trim();
  return trimmed === '' ? padrao : trimmed;
}

// ===== REGEX GENERATOR =====
const MAPEAMENTO_ACENTOS: Record<string, string> = {
  'a': '[aáàâãäAÁÀÂÃÄ]', 'A': '[aáàâãäAÁÀÂÃÄ]',
  'e': '[eéèêëEÉÈÊË]', 'E': '[eéèêëEÉÈÊË]',
  'i': '[iíìîïIÍÌÎÏ]', 'I': '[iíìîïIÍÌÎÏ]',
  'o': '[oóòôõöOÓÒÔÕÖ]', 'O': '[oóòôõöOÓÒÔÕÖ]',
  'u': '[uúùûüUÚÙÛÜ]', 'U': '[uúùûüUÚÙÛÜ]',
  'c': '[cçCÇ]', 'C': '[cçCÇ]',
  'n': '[nñNÑ]', 'N': '[nñNÑ]'
};

function letraParaRegex(letra: string): string {
  if (letra === ' ') return '\\s+';
  if (MAPEAMENTO_ACENTOS[letra]) return MAPEAMENTO_ACENTOS[letra];
  const especiais = /[.*+?^${}()|[\]\\]/;
  if (especiais.test(letra)) return '\\' + letra;
  const lower = letra.toLowerCase();
  const upper = letra.toUpperCase();
  if (lower !== upper) return `[${lower}${upper}]`;
  return letra;
}

function gerarPatternRegex(numeroOpcao: number, titulo: string): string {
  const numeroStr = numeroOpcao.toString();
  let padraoTitulo = '';
  for (const char of titulo) {
    padraoTitulo += letraParaRegex(char);
  }
  return `(^${numeroStr}$|${padraoTitulo}).*`;
}

// ===== INPUT QUESTIONS =====
async function perguntaTextoCorpo(rl: readline.Interface): Promise<string> {
  print('📝 ETAPA 1: TEXTO DO CORPO', COR.amarelo);
  console.log('');
  print(`Padrão: "${CONFIG.TEXTO_PADRAO}"`, COR.ciano);
  print('(Aperte ENTER para usar o padrão)', COR.ciano);
  console.log('');
  const resposta = await perguntar(rl, 'Digite o texto: ');
  const texto = getValorOuPadrao(resposta, CONFIG.TEXTO_PADRAO);
  console.log(''); print('✅ Texto definido', COR.verde); console.log('');
  return texto;
}

async function perguntaQuantidade(rl: readline.Interface): Promise<number> {
  print('🔢 ETAPA 2: QUANTIDADE DE OPÇÕES', COR.amarelo);
  console.log('');
  print('Limite: 1 a 12 opções (WhatsApp: até 10)', COR.ciano);
  console.log('');
  while (true) {
    const resposta = await perguntar(rl, 'Quantas opções? ');
    const resultado = validarQuantidadeOpcoes(resposta);
    if (resultado.valido && resultado.valor !== undefined) {
      console.log(''); print(`✅ Quantidade: ${resultado.valor}`, COR.verde); console.log('');
      return resultado.valor;
    }
    print(`⚠️  ${resultado.mensagem}`, COR.vermelho);
    console.log('');
  }
}

async function perguntaBotaoMenu(rl: readline.Interface): Promise<string> {
  print('📱 ETAPA 3: BOTÃO DO MENU', COR.amarelo);
  console.log('');
  print(`Padrão: "${CONFIG.BOTAO_PADRAO}"`, COR.ciano);
  const resposta = await perguntar(rl, 'Texto do botão: ');
  const botao = getValorOuPadrao(resposta, CONFIG.BOTAO_PADRAO);
  console.log(''); print(`✅ Botão: "${botao}"`, COR.verde); console.log('');
  return botao;
}

async function perguntaTituloSecao(rl: readline.Interface): Promise<string> {
  print('📑 ETAPA 4: TÍTULO DA SEÇÃO', COR.amarelo);
  console.log('');
  print(`Padrão: "${CONFIG.SECAO_PADRAO}"`, COR.ciano);
  const resposta = await perguntar(rl, 'Título da seção: ');
  const titulo = getValorOuPadrao(resposta, CONFIG.SECAO_PADRAO);
  console.log(''); print(`✅ Título: "${titulo}"`, COR.verde); console.log('');
  return titulo;
}

async function perguntaOpcoes(rl: readline.Interface, quantidade: number): Promise<Opcao[]> {
  const opcoes: Opcao[] = [];
  print('📋 ETAPA 5: CONFIGURAR OPÇÕES', COR.amarelo);
  console.log('');
  print('Título: máx 22 caracteres | Descrição: máx 40 caracteres (ENTER=vazio)', COR.ciano);
  console.log('');
  for (let i = 1; i <= quantidade; i++) {
    print(`--- Opção ${i}/${quantidade} ---`, COR.amarelo);
    let titulo = '';
    while (true) {
      titulo = (await perguntar(rl, 'Título: ')).trim();
      if (titulo === '') { print('⚠️ Obrigatório!', COR.vermelho); continue; }
      const v = validarTituloBotao(titulo);
      if (v.valido) break;
      print(`⚠️ ${v.mensagem}`, COR.vermelho);
    }
    let descricao = '';
    while (true) {
      descricao = await perguntar(rl, 'Descrição (ENTER=vazio): ');
      const v = validarDescricao(descricao);
      if (v.valido) break;
      print(`⚠️ ${v.mensagem}`, COR.vermelho);
    }
    opcoes.push({ id: `ID 1.${i}`, titulo, descricao });
    console.log(''); print(`✅ Opção ${i} salva`, COR.verde); console.log('');
  }
  return opcoes;
}

// ===== FILE GENERATORS =====
function gerarConteudoLista(textoCorpo: string, botaoMenu: string, tituloSecao: string, opcoes: Opcao[]): string {
  const textoEscapado = escapeTemplateLiteral(textoCorpo);
  const botaoEscapado = escapeJsonString(botaoMenu);
  const secaoEscapado = escapeJsonString(tituloSecao);
  const rows = opcoes.map(op => {
    const t = escapeJsonString(op.titulo);
    const d = escapeJsonString(op.descricao);
    return `                        {\n                            "id": "${op.id}",\n                            "title": "${t}",\n                            "description": "${d}"\n                        }`;
  }).join(',\n');
  const options = opcoes.map(op => `            { "text": "${escapeJsonString(op.titulo)}" }`).join(',\n');
  return `function run(source) {\n    try {\n        let template;\n        const text = \`${textoEscapado}\`;\n        if (source == "whatsapp")\n            template = {\n                "recipient_type": "individual",\n                "type": "interactive",\n                "interactive": {\n                    "type": "list",\n                    "body": { "text": text },\n                    "action": {\n                        "button": "${botaoEscapado}",\n                        "sections": [\n                            {\n                                "title": "${secaoEscapado}",\n                                "rows": [\n${rows}\n                                ]\n                            }\n                        ]\n                    }\n                }\n            };\n        else\n            template = {\n                "text": text,\n                "options": [\n${options}\n                ]\n            };\n        return template;\n    } catch (err) {\n        return false;\n    }\n}`;
}

function gerarConteudoRegex(opcoes: Opcao[]): string {
  const entries = opcoes.map((op, i) => {
    const pattern = gerarPatternRegex(i + 1, op.titulo);
    return `        "${pattern}": "${escapeJsonString(op.titulo)}"`;
  }).join(',\n');
  return `function run(input) {\n    try {\n        const optionsRegex = {\n${entries}\n        };\n        let data = null;\n        for (let key in optionsRegex) {\n            const matching = new RegExp(key, "i");\n            if (matching.test(input)) {\n                data = optionsRegex[key];\n                return data;\n            }\n        }\n        if (data == null) {\n            return 'Input inesperado';\n        }\n        return data;\n    } catch (e) {\n        return 'Input inesperado';\n    }\n}`;
}

async function salvarArquivos(
  textoCorpo: string,
  botaoMenu: string,
  tituloSecao: string,
  opcoes: Opcao[]
): Promise<{ lista: string; regex: string }> {
  const timestamp = gerarTimestamp();
  const pastaSaida = path.resolve(CONFIG.PASTA_SAIDA);
  if (!fs.existsSync(pastaSaida)) {
    fs.mkdirSync(pastaSaida, { recursive: true });
  }
  const caminhoLista = path.join(pastaSaida, `lista-${timestamp}.js`);
  const caminhoRegex = path.join(pastaSaida, `lista-regex-${timestamp}.js`);
  fs.writeFileSync(caminhoLista, gerarConteudoLista(textoCorpo, botaoMenu, tituloSecao, opcoes), 'utf8');
  fs.writeFileSync(caminhoRegex, gerarConteudoRegex(opcoes), 'utf8');
  return { lista: caminhoLista, regex: caminhoRegex };
}

async function main(): Promise<void> {
  const rl = criarInterface();
  try {
    mostrarBanner();
    const textoCorpo = await perguntaTextoCorpo(rl);
    const quantidade = await perguntaQuantidade(rl);
    const botaoMenu = await perguntaBotaoMenu(rl);
    const tituloSecao = await perguntaTituloSecao(rl);
    const opcoes = await perguntaOpcoes(rl, quantidade);
    console.log('');
    print('💾 Gerando arquivos...', COR.amarelo);
    console.log('');
    const arquivos = await salvarArquivos(textoCorpo, botaoMenu, tituloSecao, opcoes);
    print('✅ Arquivos gerados!', COR.verde);
    console.log('');
    print(`📄 ${arquivos.lista}`, COR.ciano);
    print(`📄 ${arquivos.regex}`, COR.ciano);
    console.log('');
  } finally {
    rl.close();
  }
}

main().catch(err => { console.error('Erro:', err); process.exit(1); });
