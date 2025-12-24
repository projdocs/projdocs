package kong

import (
	_ "embed"
)

//go:embed kong.yml
var ConfigFile []byte
var ContainerName string = "projdocs-supabase-kong"
