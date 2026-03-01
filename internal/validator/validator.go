// Package validator provides input validation functions
package validator

import (
	"fmt"
	"strconv"
	"strings"
)

const (
	MaxOpcoes     = 12
	MinOpcoes     = 1
	MaxTituloLen  = 22
	MaxDescLen    = 40
)

// ValidationResult holds the result of a validation
type ValidationResult struct {
	Valid   bool
	Value   int
	Message string
}

// ValidateQuantidade validates the number of options
func ValidateQuantidade(input string) ValidationResult {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return ValidationResult{Valid: false, Message: "Please enter a number"}
	}
	
	num, err := strconv.Atoi(trimmed)
	if err != nil {
		return ValidationResult{Valid: false, Message: "Please enter a valid number"}
	}
	
	if num < MinOpcoes {
		return ValidationResult{Valid: false, Message: "Minimum is 1 option"}
	}
	
	if num > MaxOpcoes {
		return ValidationResult{
			Valid:   false,
			Message: fmt.Sprintf("Maximum is %d options (WhatsApp interactive lists support up to 10, we allow up to %d)", MaxOpcoes, MaxOpcoes),
		}
	}
	
	return ValidationResult{Valid: true, Value: num}
}

// ValidateTitulo validates the button title length
func ValidateTitulo(text string) error {
	if len(text) > MaxTituloLen {
		return fmt.Errorf("maximum %d characters (WhatsApp limit), you entered %d", MaxTituloLen, len(text))
	}
	return nil
}

// ValidateDescricao validates the description length
func ValidateDescricao(text string) error {
	if len(text) > MaxDescLen {
		return fmt.Errorf("maximum %d characters (WhatsApp limit), you entered %d", MaxDescLen, len(text))
	}
	return nil
}

// GetOrDefault returns the input or the default if input is empty
func GetOrDefault(input, defaultval string) string {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return defaultval
	}
	return trimmed
}
