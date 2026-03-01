# Blip List Generator

CLI para gerar automaticamente dois arquivos `.js` para uso na plataforma **Blip**:

1. **lista-&lt;timestamp&gt;.js** — Script de lista interativa para WhatsApp (interactive list) ou outros canais (Blipchat)
2. **lista-regex-&lt;timestamp&gt;.js** — Script com objeto `optionsRegex` para matching de inputs do usuário

---

## 🚀 Tecnologia

**Go 1.21+** — compiled to native executables for Windows, Linux, and macOS

---

## 📦 Instalação

### Prerequisites

- [Go 1.21+](https://go.dev/dl/)

### Clone and Build

```bash
# Clone the repository
git clone https://github.com/wellrcosta/scripts-blip.git
cd scripts-blip

# Install dependencies and build
go mod tidy
go build -o bin/blip-list-generator ./cmd/blip-list-generator

# Run
./bin/blip-list-generator
```

---

## 📋 Uso

Execute o CLI e siga as perguntas interativas:

```bash
./bin/blip-list-generator
```

### Fluxo

1. **Texto do corpo** — Padrão: `*Clique no botão* e *selecione* sobre qual assunto você deseja falar 👇`
2. **Quantidade de opções** — Limite: 1 a 12 (WhatsApp suporta até 10)
3. **Texto do botão do menu** — Padrão: `Opções`
4. **Título da seção** — Padrão: `Escolha uma opção`
5. **Para cada opção:**
   - Título (máx 22 caracteres — limite WhatsApp)
   - Descrição (máx 40 caracteres — limite WhatsApp, ENTER para vazio)

Arquivos são salvos em `./scripts/lista/` com timestamp ISO no nome.

---

## 🛠️ Desenvolvimento

```bash
# Run in development mode
go run ./cmd/blip-list-generator

# Run tests
go test ./...

# Build for current platform
go build -o bin/blip-list-generator ./cmd/blip-list-generator
```

---

## 📦 Build Multiplataforma

### Manual

```bash
# Linux (AMD64)
GOOS=linux GOARCH=amd64 go build -o bin/blip-list-generator-linux ./cmd/blip-list-generator

# Windows (AMD64)
GOOS=windows GOARCH=amd64 go build -o bin/blip-list-generator.exe ./cmd/blip-list-generator

# macOS (AMD64)
GOOS=darwin GOARCH=amd64 go build -o bin/blip-list-generator-macos ./cmd/blip-list-generator
```

### GitHub Actions

Builds automáticos para todas as plataformas são executados em push para `main` ou `develop`.

**Artefatos:** Disponíveis na aba Actions → Build Executables

---

## 📁 Estrutura do Projeto

```
src/
├── cmd/
│   └── blip-list-generator/
│       └── main.go          # CLI entry point
├── internal/
│   ├── generator/
│   │   ├── lista.go         # Generator for lista-*.js
│   │   └── regex.go         # Regex pattern generation
│   ├── validator/
│   │   └── validator.go     # Input validation
│   └── utils/
│       └── utils.go         # Utility functions
├── go.mod
├── go.sum
└── README.md
```

---

## 📄 Exemplo de Saída

### lista-2024-01-15_10-30-45-123Z.js

```javascript
function run(source) {
    try {
        let template;
        const text = `*Clique no botão* e *selecione* sobre qual assunto você deseja falar 👇`;
        if (source == "whatsapp")
            template = {
                "recipient_type": "individual",
                "type": "interactive",
                "interactive": {
                    "type": "list",
                    "body": { "text": text },
                    "action": {
                        "button": "Opções",
                        "sections": [{
                            "title": "Escolha uma opção",
                            "rows": [
                                { "id": "ID 1.1", "title": "Baixa de Gravame", "description": "" },
                                { "id": "ID 1.2", "title": "Renegociação", "description": "" }
                            ]
                        }]
                    }
                }
            };
        else
            template = {
                "text": text,
                "options": [
                    { "text": "Baixa de Gravame" },
                    { "text": "Renegociação" }
                ]
            };
        return template;
    } catch (err) {
        return false;
    }
}
```

### lista-regex-2024-01-15_10-30-45-123Z.js

```javascript
function run(input) {
    try {
        const optionsRegex = {
            "(^1$|Baixa\\s+[Gg][Rr][Aa][Vv][Aa][Mm][Ee]).*": "Baixa de Gravame",
            "(^2$|[Rr][Ee][Nn][Ee][Gg][Oo][Cc][Ii][Aa][Cc][Aa@@][Oo]).*": "Renegociação"
        };
        let data = null;
        for (let key in optionsRegex) {
            const matching = new RegExp(key, "i");
            if (matching.test(input)) {
                data = optionsRegex[key];
                return data;
            }
        }
        if (data == null) {
            return 'Input inesperado';
        }
        return data;
    } catch (e) {
        return 'Input inesperado';
    }
}
```

---

## 🛡️ Tolerância a Acentos

O regex gerado automaticamente aceita variações com/sem acento:

| Input | Match para |
|-------|------------|
| `1`, `Baixa de Gravame` | Baixa de Gravame |
| `baixa de gravame` | Baixa de Gravame |
| `baixa gravame` | Baixa de Gravame (espaços opcionais) |

---

## 📄 Licença

MIT
