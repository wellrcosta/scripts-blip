package generator

import (
	"strings"
	"github.com/wellrcosta/blip-list-generator/internal/utils"
)

// Option represents a menu option
type Option struct {
	ID    string
	Title string
	Desc  string
}

// GenerateListaFile generates the lista-<timestamp>.js content
func GenerateListaFile(textoCorpo, botaoMenu, tituloSecao string, opcoes []Option) string {
	textoEscapado := utils.EscapeTemplateLiteral(textoCorpo)
	botaoEsc := utils.EscapeJSONString(botaoMenu)
	secaoEsc := utils.EscapeJSONString(tituloSecao)

	var rows []string
	for _, op := range opcoes {
		row := `                        {
                            "id": "` + op.ID + `",
                            "title": "` + utils.EscapeJSONString(op.Title) + `",
                            "description": "` + utils.EscapeJSONString(op.Desc) + `" 
                        }`
		rows = append(rows, row)
	}

	var options []string
	for _, op := range opcoes {
		opt := `            { "text": "` + utils.EscapeJSONString(op.Title) + `" }`
		options = append(options, opt)
	}

	return `function run(source) {
    try {
        let template;
        const text = ` + "`" + textoEscapado + "`" + `;
        if (source == "whatsapp")
            template = {
                "recipient_type": "individual",
                "type": "interactive",
                "interactive": {
                    "type": "list",
                    "body": { "text": text },
                    "action": {
                        "button": "` + botaoEsc + `",
                        "sections": [
                            {
                                "title": "` + secaoEsc + `",
                                "rows": [
` + strings.Join(rows, ",\n") + `
                                ]
                            }
                        ]
                    }
                }
            };
        else
            template = {
                "text": text,
                "options": [
` + strings.Join(options, ",\n") + `
                ]
            };
        return template;
    } catch (err) {
        return false;
    }
}`
}

// GenerateRegexFile generates the lista-regex-<timestamp>.js content
func GenerateRegexFile(opcoes []Option) string {
	var entries []string
	for i, op := range opcoes {
		pattern := GeneratePatternRegex(i+1, op.Title)
		entry := `        "` + pattern + `": "` + utils.EscapeJSONString(op.Title) + `"`
		entries = append(entries, entry)
	}

	return `function run(input) {
    try {
        const optionsRegex = {
` + strings.Join(entries, ",\n") + `
        };
        let data = null;
        const inputLower = input.toString().toLowerCase();
        for (let key in optionsRegex) {
            const matching = new RegExp(key, "i");
            if (matching.test(inputLower)) {
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
}`
}
