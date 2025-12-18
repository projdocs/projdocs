package db

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/train360-corp/projdocs/apps/federation/internal/utils"
	"github.com/train360-corp/projdocs/apps/federation/pkg/logger"
	_ "modernc.org/sqlite"
	"os"
	"path/filepath"
	"runtime"
	"sync"
)

const (
	filename string = "db.sqlite"
)

var (
	sqlite *sql.DB
	once   sync.Once
)

func Init() {
	once.Do(func() {
		path, err := getDbPath()
		if err != nil {
			logger.Global().Panic(fmt.Sprintf("unable to get db path: %s", err))
		}
		logger.Global().Debug(fmt.Sprintf("db path: %s", path))

		dsn := fmt.Sprintf("file:%s?file:/var/lib/federation/app.db?mode=rw&_busy_timeout=5000&_foreign_keys=1", path)
		sqlite, err = sql.Open("sqlite", dsn)
		if err != nil {
			logger.Global().Panic(fmt.Sprintf("unable to open db: %s", err))
		}
		sqlite.SetMaxOpenConns(1)
		sqlite.SetMaxIdleConns(1)
		if _, e := sqlite.Exec(`PRAGMA journal_mode = WAL;`); e != nil {
			logger.Global().Error(e.Error())
		}
		if _, e := sqlite.Exec(`PRAGMA synchronous = NORMAL;`); e != nil {
			logger.Global().Error(e.Error())
		}
		if _, e := sqlite.Exec(`PRAGMA foreign_keys = ON;`); e != nil {
			logger.Global().Error(e.Error())
		}
		if _, e := sqlite.Exec(`PRAGMA busy_timeout = 5000;`); e != nil {
			logger.Global().Error(e.Error())
		}

		if e := migrate(context.Background(), sqlite); e != nil {
			logger.Global().Fatal(fmt.Sprintf("unable to handle migrations: %s", e))
		}

	})
	return
}

func getDbPath() (string, error) {

	confDir, err := utils.GetConfigDir()
	if err != nil {
		return "", fmt.Errorf("unable to get config dir: %w", err)
	}
	fp := filepath.Join(confDir, filename)

	// do not need to enforce file checks on macos (dev-only)
	if runtime.GOOS == "darwin" {
		return fp, nil
	}

	// create file without truncating if it already exists
	f, err := os.OpenFile(
		fp,
		os.O_RDWR|os.O_CREATE,
		utils.ConfigFilePerms,
	)
	if err != nil {
		return "", fmt.Errorf("create db file %s: %w", fp, err)
	}
	defer f.Close()

	// Enforce perms (umask-safe)
	if err := os.Chmod(fp, utils.ConfigFilePerms); err != nil {
		return "", fmt.Errorf("chmod db file %s: %w", fp, err)
	}

	if err := os.Chown(fp, 0, 0); err != nil {
		return "", fmt.Errorf("chown db file %s: %w", fp, err)
	}

	return fp, nil
}
