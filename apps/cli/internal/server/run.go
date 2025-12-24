package server

import (
	"context"
	"fmt"
	"github.com/projdocs/projdocs/apps/cli/internal/logger"
	"net"
	"net/http"
	"time"
)

const DefaultHost = "127.0.0.1"
const DefaultPort = uint16(8080)

type Server struct {
	instance *http.Server
	ln       *net.Listener
}

func (s *Server) mustInit() {
	if s.instance == nil {
		logger.Global().Panic("Server.instance is null")
	}
	if s.ln == nil {
		logger.Global().Panic("Server.ln is null")
	}
}

func (s *Server) Start() chan error {
	s.mustInit()
	logger.Global().Info(fmt.Sprintf("listening on %s", (*(s.ln)).Addr()))
	var serveErr chan error
	serveErr = make(chan error, 1)
	serveErr <- s.instance.Serve(*s.ln)
	return serveErr
}

func (s *Server) Stop(ctx context.Context) error {
	s.mustInit()
	return s.instance.Shutdown(ctx)
}

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

func NewServer(config RunConfig) (*Server, error) {

	srv := http.Server{
		Addr:              config.GetAddress(),
		Handler:           NewHandler(),
		ReadHeaderTimeout: 5 * time.Second,
	}

	if ln, err := net.Listen("tcp", config.GetAddress()); err != nil {
		return nil, err
	} else {
		return &Server{
			instance: &srv,
			ln:       &ln,
		}, nil
	}

	//select {
	//case <-ctx.Done():
	//	logger.Global().Debugf("http server shutting down (cause=runtime context cancelled)")
	//	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	//	defer cancel()
	//	_ = srv.Shutdown(shutdownCtx)
	//	return nil
	//case err := <-errCh:
	//	if errors.Is(err, http.ErrServerClosed) {
	//		logger.Global().Debugf("http server shutting down gracefully")
	//		return nil
	//	}
	//	logger.Global().Debug("http server shutting down (error encountered)")
	//	logger.Global().Errorf("http server encountered a runtime error: %v", err)
	//	return err
	//}
}
