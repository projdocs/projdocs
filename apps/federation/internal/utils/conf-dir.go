package utils

import (
	"fmt"
	"os"
	"runtime"
)

const (
	ConfigFilePerms os.FileMode = 0640
)

func getProdConfigDir() (string, error) {

	const (
		ProdConfigDir  string      = "/etc/federation"
		ConfigDirPerms os.FileMode = 0750
	)

	// /etc requires root to create/chown
	if os.Geteuid() != 0 {
		return "", fmt.Errorf("must run as root to initialize %s", ProdConfigDir)
	}

	// Create (idempotent)
	if err := os.MkdirAll(ProdConfigDir, ConfigDirPerms); err != nil {
		return "", fmt.Errorf("mkdir %s: %w", ProdConfigDir, err)
	}

	// Enforce perms (umask-safe)
	if err := os.Chmod(ProdConfigDir, ConfigDirPerms); err != nil {
		return "", fmt.Errorf("chmod %s: %w", ProdConfigDir, err)
	}

	// Enforce ownership root:root
	if err := os.Chown(ProdConfigDir, 0, 0); err != nil {
		return "", fmt.Errorf("chown %s to root:root: %w", ProdConfigDir, err)
	}

	// Sanity check
	if info, err := os.Stat(ProdConfigDir); err != nil {
		return "", fmt.Errorf("stat %s: %w", ProdConfigDir, err)
	} else if !info.IsDir() {
		return "", fmt.Errorf("%s exists but is not a directory", ProdConfigDir)
	}

	return ProdConfigDir, nil
}

func getDevConfigDir() (string, error) {
	return os.Getwd()
}

func GetConfigDir() (string, error) {
	if runtime.GOOS == "linux" {
		return getProdConfigDir()
	} else if runtime.GOOS == "darwin" {
		return getDevConfigDir()
	} else {
		return "", fmt.Errorf("platform not supported: %s", runtime.GOOS)
	}
}

//func GetConfigDir() (string, error) {
//
//	var (
//		path string
//		err  error
//		stat os.FileInfo
//	)
//
//	switch runtime.GOOS {
//	case "darwin":
//		path, err = os.Getwd()
//		if err != nil {
//			return "", fmt.Errorf("failed to get current working directory: %w", err)
//		}
//		break
//	case "linux":
//		path = "/etc/federation"
//		break
//	default:
//		return "", fmt.Errorf("unsupported platform: %s", runtime.GOOS)
//	}
//
//	stat, err = os.Stat(path)
//	if err != nil {
//		if errors.Is(err, os.ErrNotExist) {
//			err = os.MkdirAll(path, ConfigDirPerms)
//			if err != nil {
//				return "", fmt.Errorf("failed to create config dir: %w", err)
//			}
//		} else {
//			return "", fmt.Errorf("failed to check if config directory (%s) exists: %w", path, err)
//		}
//	} else if !stat.IsDir() {
//		return "", fmt.Errorf("failed to check if config directory (%s) exists: location exists, but is not a directory", path)
//	}
//
//	if err := os.Chmod(ConfigDir, ConfigDirPerms); err != nil {
//		return "", fmt.Errorf("chmod %s: %w", ConfigDir, err)
//	}
//
//	return path, nil
//}
