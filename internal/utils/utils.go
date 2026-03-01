// Package utils provides utility functions for the CLI
package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// EscapeTemplateLiteral escapes backticks and template expressions for JS template literals
func EscapeTemplateLiteral(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "`", "\\`")
	s = strings.ReplaceAll(s, "${", "\\${")
	return s
}

// EscapeJSONString escapes quotes and backslashes for JSON strings
func EscapeJSONString(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "\"", "\\\"")
	return s
}

// EscapeRegex escapes special regex characters
func EscapeRegex(s string) string {
	return regexp.QuoteMeta(s)
}

// GenerateTimestamp creates a timestamp for filenames
// Format: 2024-01-15_10-30-45-123Z (replacing : and . with -)
func GenerateTimestamp() string {
	t := time.Now().UTC()
	iso := t.Format(time.RFC3339Nano)
	// Replace : and . with -
	timestamp := strings.ReplaceAll(iso, ":", "-")
	timestamp = strings.ReplaceAll(timestamp, ".", "-")
	return timestamp
}

// EnsureDir creates a directory if it doesn't exist
func EnsureDir(path string) error {
	return os.MkdirAll(path, 0755)
}

// WriteFile writes content to a file, ensuring the directory exists
func WriteFile(dir, filename, content string) (string, error) {
	if err := EnsureDir(dir); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}
	
	fullPath := filepath.Join(dir, filename)
	if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}
	
	return fullPath, nil
}
