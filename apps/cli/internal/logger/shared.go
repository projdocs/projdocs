package logger

import (
	"fmt"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"io"
	"os"
	"sync"
)

type Constructor = func(writer io.Writer, level zap.AtomicLevel) (*zap.SugaredLogger, error)

var (
	global *zap.SugaredLogger
	once   sync.Once
	level  zap.AtomicLevel = zap.NewAtomicLevel()

	DefaultConstructor Constructor = ConsoleLogger
	DefaultWriter      io.Writer   = os.Stdout
)

func SetLevel(lvl zapcore.Level) {
	level.SetLevel(lvl)
}

func Global() *zap.SugaredLogger {
	once.Do(func() {

		// strict null checks
		if DefaultConstructor == nil {
			DefaultConstructor = ConsoleLogger
		}
		if DefaultWriter == nil {
			DefaultWriter = os.Stdout
		}

		logger, err := DefaultConstructor(DefaultWriter, level)
		if err != nil {
			panic(fmt.Sprintf("failed to initialize logger: %v", err))
		}

		global = logger
	})
	return global
}
