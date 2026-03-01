package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"github.com/wellrcosta/blip-list-generator/internal/generator"
	"github.com/wellrcosta/blip-list-generator/internal/utils"
	"github.com/wellrcosta/blip-list-generator/internal/validator"
)

const (
	TextoPadrao   = "*Clique no botão* e *selecione* sobre qual assunto você deseja falar 👇"
	BotaoPadrao   = "Opções"
	SecaoPadrao   = "Escolha uma opção"
	PastaSaida    = "./scripts/lista"
)

// ANSI colors
const (
	Reset   = "\033[0m"
	Red     = "\033[31m"
	Green   = "\033[32m"
	Yellow  = "\033[33m"
	Blue    = "\033[34m"
	Cyan    = "\033[36m"
	Bold    = "\033[1m"
)

func print(msg string, color string) {
	fmt.Println(color + msg + Reset)
}

func clearScreen() {
	fmt.Print("\033[H\033[2J")
}

func showBanner() {
	clearScreen()
	print("="+strings.Repeat("=", 59), Cyan)
	print("📋  BLIP LIST GENERATOR (GO)", Bold+Cyan)
	print("Gerador de scripts de lista interativa", Cyan)
	print("="+strings.Repeat("=", 59), Cyan)
	fmt.Println()
}

func ask(rl *bufio.Reader, prompt string) string {
	fmt.Print(prompt)
	input, _ := rl.ReadString('\n')
	return strings.TrimSpace(input)
}

func askTextoCorpo(rl *bufio.Reader) string {
	print("📝 ETAPA 1: TEXTO DO CORPO", Yellow)
	fmt.Println()
	print(fmt.Sprintf(`Padrão: "%s"`, TextoPadrao), Cyan)
	print("(Aperte ENTER para usar o padrão)", Cyan)
	fmt.Println()
	
	resposta := ask(rl, "Digite o texto: ")
	texto := validator.GetOrDefault(resposta, TextoPadrao)
	
	fmt.Println()
	print("✅ Texto definido", Green)
	fmt.Println()
	return texto
}

func askQuantidade(rl *bufio.Reader) int {
	print("🔢 ETAPA 2: QUANTIDADE DE OPÇÕES", Yellow)
	fmt.Println()
	print("Limite: 1 a 12 opções (WhatsApp: até 10)", Cyan)
	fmt.Println()
	
	for {
		resposta := ask(rl, "Quantas opções? ")
		result := validator.ValidateQuantidade(resposta)
		
		if result.Valid {
			fmt.Println()
			print(fmt.Sprintf("✅ Quantidade: %d", result.Value), Green)
			fmt.Println()
			return result.Value
		}
		
		print(fmt.Sprintf("⚠️  %s", result.Message), Yellow)
		fmt.Println()
	}
}

func askBotaoMenu(rl *bufio.Reader) string {
	print("📱 ETAPA 3: BOTÃO DO MENU", Yellow)
	fmt.Println()
	print(fmt.Sprintf(`Padrão: "%s"`, BotaoPadrao), Cyan)
	
	resposta := ask(rl, "Texto do botão: ")
	botao := validator.GetOrDefault(resposta, BotaoPadrao)
	
	fmt.Println()
	print(fmt.Sprintf("✅ Botão: \"%s\"", botao), Green)
	fmt.Println()
	return botao
}

func askTituloSecao(rl *bufio.Reader) string {
	print("📑 ETAPA 4: TÍTULO DA SEÇÃO", Yellow)
	fmt.Println()
	print(fmt.Sprintf(`Padrão: "%s"`, SecaoPadrao), Cyan)
	
	resposta := ask(rl, "Título da seção: ")
	titulo := validator.GetOrDefault(resposta, SecaoPadrao)
	
	fmt.Println()
	print(fmt.Sprintf("✅ Título: \"%s\"", titulo), Green)
	fmt.Println()
	return titulo
}

func askOpcoes(rl *bufio.Reader, quantidade int) []generator.Option {
	var opcoes []generator.Option
	
	print("📋 ETAPA 5: CONFIGURAR OPÇÕES", Yellow)
	fmt.Println()
	print("Título: máx 22 caracteres | Descrição: máx 40 caracteres", Cyan)
	fmt.Println()
	
	for i := 1; i <= quantidade; i++ {
		print(fmt.Sprintf("--- Opção %d/%d ---", i, quantidade), Yellow)
		
		var titulo string
		for {
			titulo = ask(rl, "Título: ")
			titulo = strings.TrimSpace(titulo)
			if titulo == "" {
				print("⚠️  Obrigatório!", Yellow)
				continue
			}
			if err := validator.ValidateTitulo(titulo); err != nil {
				print(fmt.Sprintf("⚠️  %s", err.Error()), Yellow)
				continue
			}
			break
		}
		
		var descricao string
		for {
			descricao = ask(rl, "Descrição (ENTER=vazio): ")
			if err := validator.ValidateDescricao(descricao); err != nil {
				print(fmt.Sprintf("⚠️  %s", err.Error()), Yellow)
				continue
			}
			break
		}
		
		opcoes = append(opcoes, generator.Option{
			ID:    fmt.Sprintf("ID 1.%d", i),
			Title: titulo,
			Desc:  descricao,
		})
		
		fmt.Println()
		print(fmt.Sprintf("✅ Opção %d salva", i), Green)
		fmt.Println()
	}
	
	return opcoes
}

func salvarArquivos(textoCorpo, botaoMenu, tituloSecao string, opcoes []generator.Option) (string, string, error) {
	timestamp := utils.GenerateTimestamp()
	
	listaContent := generator.GenerateListaFile(textoCorpo, botaoMenu, tituloSecao, opcoes)
	regexContent := generator.GenerateRegexFile(opcoes)
	
	listaPath, err := utils.WriteFile(PastaSaida, fmt.Sprintf("lista-%s.js", timestamp), listaContent)
	if err != nil {
		return "", "", fmt.Errorf("failed to write lista file: %w", err)
	}
	
	regexPath, err := utils.WriteFile(PastaSaida, fmt.Sprintf("lista-regex-%s.js", timestamp), regexContent)
	if err != nil {
		return "", "", fmt.Errorf("failed to write regex file: %w", err)
	}
	
	return listaPath, regexPath, nil
}

func main() {
	showBanner()
	
	rl := bufio.NewReader(os.Stdin)
	
	// Collect inputs
	textoCorpo := askTextoCorpo(rl)
	quantidade := askQuantidade(rl)
	botaoMenu := askBotaoMenu(rl)
	tituloSecao := askTituloSecao(rl)
	opcoes := askOpcoes(rl, quantidade)
	
	// Generate files
	fmt.Println()
	print("💾 Gerando arquivos...", Yellow)
	fmt.Println()
	
	listaPath, regexPath, err := salvarArquivos(textoCorpo, botaoMenu, tituloSecao, opcoes)
	if err != nil {
		print(fmt.Sprintf("❌ Erro: %s", err.Error()), Red)
		os.Exit(1)
	}
	
	// Success
	print("✅ Arquivos gerados com sucesso!", Green)
	fmt.Println()
	print(fmt.Sprintf("📄 %s", listaPath), Cyan)
	print(fmt.Sprintf("📄 %s", regexPath), Cyan)
	fmt.Println()
}
