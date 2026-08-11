package handlers

import (
	"time"

	caches "github.com/projdocs/projdocs/apps/api/internal/handlers/uploads/cache"
)

var cache = caches.New(1 * time.Hour)
