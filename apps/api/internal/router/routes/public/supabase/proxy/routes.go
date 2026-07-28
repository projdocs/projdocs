package proxy

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"path"

	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/config"
	"github.com/projdocs/projdocs/apps/api/internal/router/middleware"
	"github.com/projdocs/projdocs/apps/api/internal/types/response"
)

// Exact paths (relative to upstream) that receive the service role key.
var serviceKeyPaths = map[string]bool{
	"/auth/v1/admin/custom-providers": true,
}

func Register(r *gin.RouterGroup) error {
	cfg, err := config.Get()
	if err != nil {
		return fmt.Errorf("proxy: loading config: %w", err)
	}

	remote, err := url.Parse(cfg.KongURL)
	if err != nil {
		return fmt.Errorf("proxy: invalid upstream URL %q: %w", cfg.KongURL, err)
	}
	if (remote.Scheme != "http" && remote.Scheme != "https") || remote.Host == "" {
		return fmt.Errorf("proxy: upstream URL must be http(s)://host, got %q", cfg.KongURL)
	}

	proxy := &httputil.ReverseProxy{
		Rewrite: func(pr *httputil.ProxyRequest) {
			pr.SetURL(remote)
			pr.Out.Host = remote.Host
			pr.SetXForwarded()

			if serviceKeyPaths[path.Clean(pr.Out.URL.Path)] {
				pr.Out.Header.Set("apikey", cfg.BearerTokens.SecretKey)
				pr.Out.Header.Set("Authorization", "Bearer "+cfg.BearerTokens.SecretKey)
				return
			}

			pr.Out.Header.Set("apikey", cfg.BearerTokens.PublicKey)
			if pr.Out.Header.Get("Authorization") == "" {
				pr.Out.Header.Set("Authorization", "Bearer "+cfg.BearerTokens.PublicKey)
			}
		},
		ModifyResponse: func(resp *http.Response) error {
			var upstreamCORSHeaders = []string{
				"Access-Control-Allow-Origin",
				"Access-Control-Allow-Credentials",
				"Access-Control-Allow-Methods",
				"Access-Control-Allow-Headers",
				"Access-Control-Expose-Headers",
				"Access-Control-Max-Age",
			}
			for _, h := range upstreamCORSHeaders {
				resp.Header.Del(h)
			}
			return nil
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			log.Printf("proxy: upstream error method=%s path=%s err=%v", r.Method, r.URL.Path, err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadGateway)
			_, _ = w.Write([]byte(`{"data":null,"error":{"message":"upstream unavailable"}}`))
		},
		FlushInterval: -1,
	}

	r.Any("/*proxyPath", func(c *gin.Context) {
		c.Request.URL.Path = c.Param("proxyPath")
		c.Request.URL.RawPath = ""

		if serviceKeyPaths[path.Clean(c.Request.URL.Path)] {
			role, ok := c.Get(middleware.AuthenticationJWTRoleGinContextKey)
			if !ok || role != "admin" {
				response.Error(c, http.StatusForbidden, "insufficient privileges")
				return
			}
		}

		proxy.ServeHTTP(c.Writer, c.Request)
	})

	return nil
}
