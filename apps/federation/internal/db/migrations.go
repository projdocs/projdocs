package db

import (
	"embed"
	"fmt"
	"sort"
	"strings"
)

//go:embed migrations/*.sql
var migrations embed.FS

type Migration struct {
	Timestamp string
	Name      string
	Contents  string
}

func Migrations() ([]Migration, error) {
	entries, err := migrations.ReadDir("migrations")
	if err != nil {
		return nil, fmt.Errorf("read migrations dir: %w", err)
	}

	var out []Migration

	for _, e := range entries {
		if e.IsDir() {
			continue
		}

		name := e.Name()
		if !strings.HasSuffix(name, ".sql") {
			continue
		}

		ts, migName, err := parseMigrationFilename(name)
		if err != nil {
			return nil, err
		}

		b, err := migrations.ReadFile("migrations/" + name)
		if err != nil {
			return nil, fmt.Errorf("read migration %s: %w", name, err)
		}

		out = append(out, Migration{
			Timestamp: ts,
			Name:      migName,
			Contents:  string(b),
		})
	}

	// Ensure deterministic order
	sort.Slice(out, func(i, j int) bool {
		return out[i].Timestamp < out[j].Timestamp
	})

	return out, nil
}

func parseMigrationFilename(filename string) (timestamp, name string, err error) {
	// Expected: 20250102150405_create_users.sql
	base := strings.TrimSuffix(filename, ".sql")
	parts := strings.SplitN(base, "_", 2)
	if len(parts) != 2 {
		return "", "", fmt.Errorf("invalid migration filename: %s", filename)
	}

	return parts[0], parts[1], nil
}
