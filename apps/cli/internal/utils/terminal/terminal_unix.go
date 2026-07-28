//go:build unix

package terminal

import (
	"os"

	"golang.org/x/sys/unix"
)

func SuppressInterruptEcho() (restore func()) {
	fd := int(os.Stdin.Fd())

	termios, err := unix.IoctlGetTermios(fd, ioctlGetTermios)
	if err != nil {
		return func() {}
	}

	original := *termios
	termios.Lflag &^= unix.ECHOCTL

	if err := unix.IoctlSetTermios(fd, ioctlSetTermios, termios); err != nil {
		return func() {}
	}

	return func() {
		_ = unix.IoctlSetTermios(fd, ioctlSetTermios, &original)
	}
}
