package utils

import (
	"fmt"
	"os"
	"path"
	"runtime"
)

func GetHomeDir() (string, error) {
	switch runtime.GOOS {
	case "linux":
		return "/etc/projdocs", nil
	case "darwin":
		binaryPath, err := os.Executable()
		if err != nil {
			return "", err
		}
		return path.Join(path.Dir(binaryPath), "app-data"), nil
	default:
		return "", fmt.Errorf("OS %s not supported", runtime.GOOS)
	}
}
