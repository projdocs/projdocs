package server

import (
	"context"
	"errors"
	"fmt"
	"github.com/train360-corp/projdocs/apps/federation/pkg/logger"
	"net"
	"net/http"
	"os/signal"
	"syscall"
	"time"
)

const DefaultHost = "127.0.0.1"
const DefaultPort = uint16(8080)

type RunConfig struct {
	Host *string
	Port *uint16
}

func (cfg RunConfig) GetAddress() string {
	host := DefaultHost
	if cfg.Host != nil {
		host = *cfg.Host
	}
	port := DefaultPort
	if cfg.Port != nil {
		port = *cfg.Port
	}
	return fmt.Sprintf("%s:%d", host, port)
}

func Run(config RunConfig) error {

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	srv := &http.Server{
		Addr:              config.GetAddress(),
		Handler:           NewServer(),
		ReadHeaderTimeout: 5 * time.Second,
	}

	var errCh chan error
	if ln, err := net.Listen("tcp", config.GetAddress()); err != nil {
		return err
	} else {
		errCh = make(chan error, 1)
		go func() {
			logger.Global().Info(fmt.Sprintf("listening on %s", ln.Addr()))
			errCh <- srv.Serve(ln)
		}()
	}

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = srv.Shutdown(shutdownCtx)
		return nil
	case err := <-errCh:
		if errors.Is(err, http.ErrServerClosed) {
			// http.ErrServerClosed is expected on Shutdown
			return nil
		}
		return err
	}
}
