package config

import (
	"github.com/train360-corp/projdocs/apps/federation/internal/utils"
	"sync"
)

type GlobalConfig struct {
	Verbose *bool
}

var once sync.Once
var global *GlobalConfig

func Global() *GlobalConfig {
	once.Do(func() {
		global = &GlobalConfig{
			Verbose: utils.Pointer(false),
		}
	})
	return global
}
