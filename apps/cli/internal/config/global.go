package config

import (
	"sync"
)

var (
	global         *Global
	initGlobalOnce sync.Once
)

type Global struct {
	Verbose *bool
}

func GetGlobal() *Global {
	initGlobalOnce.Do(func() {
		var defaultVerbose bool = false
		global = &Global{
			Verbose: &defaultVerbose,
		}
	})
	return global
}
