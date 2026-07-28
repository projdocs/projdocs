package migrations

import (
	"embed"
	"fmt"
)

//go:embed gen
var folder embed.FS

type Type struct {
	Name     string
	Contents []byte
}

func Get() ([]Type, error) {

	dir, err := folder.ReadDir("gen")
	if err != nil {
		return nil, fmt.Errorf("read migrations: %w", err)
	}

	migrations := []Type{}
	for _, file := range dir {
		if file.IsDir() {
			return nil, fmt.Errorf("read migrations: gen/%s is a directory", file.Name())
		}
		f, err := folder.ReadFile(fmt.Sprintf("gen/%s", file.Name()))
		if err != nil {
			return nil, fmt.Errorf("read migrations: gen/%s: %w", file.Name(), err)
		}
		migrations = append(migrations, Type{
			Name:     file.Name(),
			Contents: f,
		})
	}

	return migrations, nil
}
