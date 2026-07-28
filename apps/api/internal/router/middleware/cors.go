package middleware

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins: []string{"*"}, // tighten in production
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPatch,
			http.MethodHead,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowHeaders: []string{
			"*",
			"Authorization",
			//"Origin",
			//"Content-Type",
			//"Content-Length",
			//"Authorization",
			//"X-Requested-With",
			//"If-Range",
			//"Range",
			//"Content-ID",
			//// TUS protocol headers
			//"Tus-Resumable",
			//"Upload-Length",
			//"Upload-Offset",
			//"Upload-Metadata",
			//"Upload-Defer-Length",
			//"Upload-Concat",
			//"X-HTTP-Method-Override",
			//
			//// supabase
			//"x-supabase-api-version",
			//"x-client-info",
			//"apikey",
			//"x-retry-count",
			//"prefer",
			//"accept-profile",
		},
		ExposeHeaders: []string{
			"Location",
			"Tus-Resumable",
			"Tus-Version",
			"Tus-Max-Size",
			"Tus-Extension",
			"Upload-Offset",
			"Upload-Length",
			"Upload-Expires",
			"Content-Range",
			"Content-ID",
			"ETag",
		},
		AllowCredentials: false, // must be false when AllowOrigins is "*"
		MaxAge:           12 * time.Hour,
	})
}
