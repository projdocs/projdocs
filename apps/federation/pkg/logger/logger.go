package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"os"
	"sync"
)

var once sync.Once
var global *zap.Logger
var level zap.AtomicLevel = zap.NewAtomicLevel()

type Format string

const (
	FormatJSON    Format = "json"
	FormatConsole Format = "console"
)

func Global() *zap.Logger {
	if global == nil {
		panic("logger not initialized")
	}
	return global
}

func Init(format Format) (e error) {
	once.Do(func() {
		log, err := newLogger(format)
		if err != nil {
			e = err
		} else {
			global = log
		}
	})
	return
}

func SetLevel(lvl zapcore.Level) {
	level.SetLevel(lvl)
}

func newLogger(format Format) (*zap.Logger, error) {

	encoderCfg := zapcore.EncoderConfig{
		TimeKey:       "ts",
		LevelKey:      "level",
		NameKey:       "logger",
		MessageKey:    "msg",
		StacktraceKey: "stacktrace",
		EncodeTime:    zapcore.ISO8601TimeEncoder,
		EncodeLevel:   zapcore.LowercaseLevelEncoder,
		LineEnding:    zapcore.DefaultLineEnding,
	}

	var encoder zapcore.Encoder

	switch format {
	case FormatConsole:
		encoderCfg.EncodeLevel = zapcore.CapitalColorLevelEncoder
		encoder = zapcore.NewConsoleEncoder(encoderCfg)
	default:
		encoder = zapcore.NewJSONEncoder(encoderCfg)
	}

	core := zapcore.NewCore(
		encoder,
		zapcore.AddSync(os.Stdout),
		level,
	)

	logger := zap.New(
		core,
		zap.AddCaller(),
		zap.AddCallerSkip(1),
	)

	return logger, nil
}
