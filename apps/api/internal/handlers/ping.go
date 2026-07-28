package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/internal/types/response"
)

func Ping(c *gin.Context) {
	response.Data(c, gin.H{"message": "pong"})
}
