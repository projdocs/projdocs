package authorize

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/config"
	"github.com/projdocs/projdocs/apps/api/internal/router/middleware"
	"github.com/projdocs/projdocs/apps/api/internal/types/response"
)

type GenerateLinkRequest struct {
	Type  string `json:"type"`
	Email string `json:"email"`
}

type GenerateLinkResponse struct {
	HashedToken string `json:"hashed_token"`
}

func Register(r *gin.RouterGroup) {
	r.GET("/desktop", func(ctx *gin.Context) {

		var email string
		if _email, ok := ctx.Get(middleware.AuthenticationJWTEmailGinContextKey); !ok {
			response.Error(ctx, http.StatusBadRequest, "session: missing email")
			return
		} else {
			email = _email.(string)
		}

		cfg, err := config.Get()
		if err != nil {
			response.Error(ctx, http.StatusInternalServerError, "unable to load config")
			return
		}

		body, err := json.Marshal(GenerateLinkRequest{
			Type:  "magiclink",
			Email: email,
		})
		if err != nil {
			response.Error(ctx, http.StatusInternalServerError, "unable to generate session request body")
			return
		}

		// create request
		httpReq, err := http.NewRequest(
			http.MethodPost,
			strings.TrimSuffix(cfg.KongURL, "/")+"/auth/v1/admin/generate_link",
			bytes.NewReader(body),
		)
		if err != nil {
			response.Error(ctx, http.StatusInternalServerError, "unable to generate session request")
			return
		}

		httpReq.Header.Set("Content-Type", "application/json")
		httpReq.Header.Set("apikey", cfg.BearerTokens.SecretKey)
		httpReq.Header.Set("Authorization", "Bearer "+cfg.BearerTokens.SecretKey)

		resp, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			response.Error(ctx, http.StatusInternalServerError, "unable to send session request")
			return
		}
		defer resp.Body.Close()

		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			response.Error(ctx, http.StatusInternalServerError, "unable to read session response body")
			return
		}

		if resp.StatusCode >= 300 {
			response.Error(ctx, http.StatusInternalServerError, fmt.Sprintf("bad status code: %d", resp.StatusCode))
			return
		}

		var out GenerateLinkResponse
		if err := json.Unmarshal(respBody, &out); err != nil {
			response.Error(ctx, http.StatusInternalServerError, "unable to parse session response body")
			return
		}

		response.Data(ctx, http.StatusOK, out.HashedToken)
		return
	})
}
