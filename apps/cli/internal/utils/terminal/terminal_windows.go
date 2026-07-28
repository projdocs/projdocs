//go:build windows

package terminal

func SuppressInterruptEcho() (restore func()) {
	// Windows consoles don't echo control characters the way Unix ttys
	// do (no ECHOCTL equivalent), so there's nothing to suppress here.
	return func() {}
}
