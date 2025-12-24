package logger

import (
	"github.com/projdocs/projdocs/apps/cli/internal/logger/encoders"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"io"
)

var ConsoleLogger Constructor = func(writer io.Writer, level zap.AtomicLevel) (*zap.SugaredLogger, error) {
	encoder := encoders.NewMsgOnlyColorEncoder()
	core := zapcore.NewCore(encoder, zapcore.AddSync(writer), level)
	logger := zap.New(core)
	return logger.Sugar(), nil
}
