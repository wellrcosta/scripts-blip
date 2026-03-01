package generator

import (
	"strconv"
	"strings"
)

var accentMap = map[string]string{
	"a": "[aáàâãäAÁÀÂÃÄ]", "A": "[aáàâãäAÁÀÂÃÄ]",
	"e": "[eéèêëEÉÈÊË]", "E": "[eéèêëEÉÈÊË]",
	"i": "[iíìîïIÍÌÎÏ]", "I": "[iíìîïIÍÌÎÏ]",
	"o": "[oóòôõöOÓÒÔÕÖ]", "O": "[oóòôõöOÓÒÔÕÖ]",
	"u": "[uúùûüUÚÙÛÜ]", "U": "[uúùûüUÚÙÛÜ]",
	"c": "[cçCÇ]", "C": "[cçCÇ]",
	"n": "[nñNÑ]", "N": "[nñNÑ]",
}

func charToRegex(char string) string {
	if char == " " {
		return `\s+`
	}
	if mapped, ok := accentMap[char]; ok {
		return mapped
	}
	specialChars := `.*+?^${}()|[\]`
	if strings.Contains(specialChars, char) {
		return `\` + char
	}
	lower := strings.ToLower(char)
	upper := strings.ToUpper(char)
	if lower != upper {
		return `[` + lower + upper + `]`
	}
	return char
}

func GeneratePatternRegex(numeroOpcao int, titulo string) string {
	numeroStr := strconv.Itoa(numeroOpcao)
	var pattern strings.Builder
	for _, r := range titulo {
		pattern.WriteString(charToRegex(string(r)))
	}
	return `(^` + numeroStr + `$|` + pattern.String() + `).*`
}
