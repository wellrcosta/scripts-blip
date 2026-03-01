package generator

import (
	"strconv"
	"strings"
)

var accentMap = map[string]string{
	"a": "[aáàâãä]",
	"e": "[eéèêë]",
	"i": "[iíìîï]",
	"o": "[oóòôõö]",
	"u": "[uúùûü]",
	"c": "[cç]",
	"n": "[nñ]",
}

func charToRegex(char string) string {
	// Space becomes just a space (not \s+)
	if char == " " {
		return " "
	}
	// Check if lowercase version has accent mapping
	lower := strings.ToLower(char)
	if mapped, ok := accentMap[lower]; ok {
		return mapped
	}
	// Special regex characters
	specialChars := `.*+?^${}()|[\]`
	if strings.Contains(specialChars, char) {
		return `\` + char
	}
	// Regular char - use case insensitive via lowercase only
	// Since we'll use toLowerCase() on input, we only need lowercase
	return strings.ToLower(char)
}

func GeneratePatternRegex(numeroOpcao int, titulo string) string {
	numeroStr := strconv.Itoa(numeroOpcao)
	var pattern strings.Builder
	for _, r := range titulo {
		pattern.WriteString(charToRegex(string(r)))
	}
	return `(^` + numeroStr + `$|` + pattern.String() + `).*`
}
