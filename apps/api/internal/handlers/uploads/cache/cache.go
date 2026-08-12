package cache

import (
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/projdocs/projdocs/apps/api/internal/database"
	"github.com/projdocs/projdocs/apps/api/internal/storage/models"
)

type Entry struct {
	cfg       *database.PublicStorageProvidersSelect
	info      *models.Info
	ExpiresAt time.Time
}

type Instance struct {
	mu      sync.RWMutex
	entries map[string]Entry
	ttl     time.Duration
}

func New(ttl time.Duration) *Instance {
	c := &Instance{
		entries: make(map[string]Entry),
		ttl:     ttl,
	}
	go c.reap()
	return c
}

func (c *Instance) Get(uploadID string) *Entry {
	c.mu.RLock()
	defer c.mu.RUnlock()
	e, ok := c.entries[uploadID]
	if !ok || time.Now().After(e.ExpiresAt) {
		return nil
	}
	return &e
}

func (c *Instance) Set(id uuid.UUID, cfg *database.PublicStorageProvidersSelect, info *models.Info) *Entry {
	c.mu.Lock()
	defer c.mu.Unlock()
	entry := Entry{
		cfg:       cfg,
		ExpiresAt: time.Now().Add(c.ttl),
		info:      info,
	}
	c.entries[id.String()] = entry
	return &entry
}

func (c *Instance) Delete(uploadID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.entries, uploadID)
}

func (e *Entry) UploadInfo() *models.Info {
	return e.info
}

func (e *Entry) ProviderMeta() *database.PublicStorageProvidersSelect {
	return e.cfg
}

// reap removes expired entries every ttl/2 to prevent unbounded growth.
func (c *Instance) reap() {
	for range time.Tick(c.ttl / 2) {
		c.mu.Lock()
		for id, e := range c.entries {
			if time.Now().After(e.ExpiresAt) {
				delete(c.entries, id)
			}
		}
		c.mu.Unlock()
	}
}
