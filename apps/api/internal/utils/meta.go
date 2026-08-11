package utils

import "sync"

type Meta struct {
	mu   sync.Mutex
	data map[string]any
}

func NewMeta() *Meta {
	return &Meta{
		data: make(map[string]any),
	}
}

func (m *Meta) Get(key string) (any, bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	v, ok := m.data[key]
	return v, ok
}

func (m *Meta) Update(fn func(data map[string]any)) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.data == nil {
		m.data = make(map[string]any)
	}
	fn(m.data)
}
