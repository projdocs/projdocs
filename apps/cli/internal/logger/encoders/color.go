package encoders

import (
	"github.com/fatih/color"
	"go.uber.org/zap/buffer"
	"go.uber.org/zap/zapcore"
)

type msgColorEncoder struct {
	zapcore.Encoder
}

func (e *msgColorEncoder) EncodeEntry(
	ent zapcore.Entry,
	_ []zapcore.Field,
) (*buffer.Buffer, error) {

	switch ent.Level {
	case zapcore.DebugLevel:
		ent.Message = color.HiBlackString(ent.Message)
	case zapcore.InfoLevel:
		ent.Message = color.HiCyanString(ent.Message)
	case zapcore.WarnLevel:
		ent.Message = color.HiYellowString(ent.Message)
	case zapcore.ErrorLevel:
		ent.Message = color.HiRedString(ent.Message)
	case zapcore.PanicLevel:
		ent.Message = color.MagentaString(ent.Message)
	case zapcore.FatalLevel:
		ent.Message = color.New(color.BgRed, color.FgWhite, color.Bold).Sprint(ent.Message)
	}

	return e.Encoder.EncodeEntry(ent, nil)
}

func NewMsgOnlyColorEncoder() zapcore.Encoder {
	cfg := zapcore.EncoderConfig{
		MessageKey:     "msg",
		LevelKey:       "",
		TimeKey:        "",
		NameKey:        "",
		CallerKey:      "",
		FunctionKey:    "",
		StacktraceKey:  "",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeDuration: zapcore.StringDurationEncoder,
	}

	base := zapcore.NewConsoleEncoder(cfg)
	return &msgColorEncoder{Encoder: base}
}
