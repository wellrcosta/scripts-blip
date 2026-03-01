# Blip List Generator

CLI para gerar automaticamente dois arquivos `.js` para uso na plataforma **Blip**:

1. **lista-&lt;timestamp&gt;.js** — Script de lista interativa para WhatsApp (interactive list) ou outros canais (Blipchat)
2. **lista-regex-&lt;timestamp&gt;.js** — Script com objeto `optionsRegex` para matching de inputs do usuário

---

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/wellrcosta/scripts-blip.git
cd scripts-blip

# Instale as dependências
npm install
```

---

## 🚀 Uso

### Modo de Desenvolvimento (com TypeScript)

```bash
npm run dev
# ou
npx ts-node src/index.ts
```

### Modo Produção (com JavaScript compilado)

```bash
# Compila TypeScript para JavaScript
npm run build

# Executa
node dist/index.js
```

---

## 📋 Fluxo do CLI

Ao executar, o CLI fará as seguintes perguntas:

1. **Texto do corpo** — Padrão: `*Clique no botão* e *selecione* sobre qual assunto você deseja falar 👇`
2. **Quantidade de opções** — Limite: 1 a 12 (WhatsApp suporta até 10, usamos margem de 12)
3. **Texto do botão do menu** — Padrão: `Opções`
4. **Título da seção** — Padrão: `Escolha uma opção`
5. **Para cada opção:**
   - Texto do botão (máx: 22 caracteres — limite WhatsApp)
   - Descrição (máx: 40 caracteres — limite WhatsApp, ENTER para vazio)

Os arquivos serão salvos em `./scripts/lista/` com timestamp no nome.

---

## 📁 Saída Gerada

Os arquivos são salvos em `./scripts/lista/`:

```
scripts/lista/
├── lista-2024-01-15T10-30-45-123Z.js
└── lista-regex-2024-01-15T10-30-45-123Z.js
```

---

## 🔧 Build de Executáveis

Use o `pkg` para gerar executáveis multiplataforma:

```bash
# Build único para todas as plataformas
npm run package

# Build individual
npm run package:win      # Windows x64
npm run package:linux    # Linux x64
npm run package:macos    # macOS x64
```

Os binários serão gerados na pasta `./bin/`.

---

## 📤 Build via GitHub Actions

O projeto inclui workflow para build automático multiplataforma:

1. Push para a branch `develop` ou crie uma tag
2. O GitHub Actions compilará automaticamente para:
   - Windows x64 (`.exe`)
   - Linux x64
   - macOS x64
3. Os binários estarão disponíveis como **Artifacts** no workflow

---

## 📝 Scripts npm

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Roda em modo desenvolvimento (ts-node) |
| `npm run build` | Compila TypeScript para `./dist` |
| `npm run clean` | Remove a pasta `./dist` |
| `npm run package` | Gera executáveis para todas as plataformas |
| `npm run package:win` | Gera executável Windows (.exe) |
| `npm run package:linux` | Gera executável Linux |
| `npm run package:macos` | Gera executável macOS |

---

## 📄 Exemplo de Saída

### lista-2024-01-15T10-30-45-123Z.js

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

### lista-regex-2024-01-15T10-30-45-123Z.js

```javascript
function run(input) {
    try {
        const optionsRegex = {
            "(^1$|Baixa\\s+[Gg][Rr][Aa][Vv][Aa][Mm][Ee]).*": "Baixa de Gravame",
            "(^2$|Renegocia[cç][ãa][Oo]).*": "Renegociação"
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

## ⚙️ Estrutura do Projeto

```
src/
├── index.ts              # CLI principal
├── lib/
│   ├── escape.ts        # Funções de escape para JS/JSON
│   ├── validation.ts    # Validações de input
│   └── regex-generator.ts # Gerador de patterns regex com acentos
```

---

## 🛡️ Tolerância a Acentos

O regex gerado automaticamente aceita variações com/sem acento:

| Input aceito | Match para |
|-------------|------------|
| `1` ou `Baixa de Gravame` | Baixa de Gravame |
| `baixa de gravame` | Baixa de Gravame |
| `Baixa gravame` | Baixa de Gravame (espaço é opcional) |

---

## 📄 Licença

MIT
