package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/train360-corp/projdocs/apps/federation/pkg/logger"
	"go.uber.org/zap"
)

func migrate(ctx context.Context, sqlite *sql.DB) error {
	start := time.Now()

	logger.Global().Debug("starting migration")

	tx, err := sqlite.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		logger.Global().Debug("begin tx failed", zap.Error(err))
		return fmt.Errorf("begin tx: %w", err)
	}

	committed := false
	defer func() {
		if !committed {
			if err := tx.Rollback(); err != nil {
				logger.Global().Debug("rollback failed", zap.Error(err))
			} else {
				logger.Global().Debug("rolled back migration transaction")
			}
		}
	}()

	logger.Global().Debug("transaction started")

	// Ensure migrations table exists
	logger.Global().Debug("ensuring _migrations table exists")
	if _, err := tx.ExecContext(ctx, `
CREATE TABLE IF NOT EXISTS _migrations (
	id INTEGER PRIMARY KEY NOT NULL UNIQUE,
	timestamp TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	contents TEXT NOT NULL,
	applied_at TEXT NOT NULL
);
`); err != nil {
		logger.Global().Debug("create _migrations table failed", zap.Error(err))
		return fmt.Errorf("create _migrations table: %w", err)
	}

	// Load applied timestamps
	logger.Global().Debug("loading applied migrations")
	applied := map[string]struct{}{}

	rows, err := tx.QueryContext(ctx, `SELECT timestamp FROM _migrations`)
	if err != nil {
		logger.Global().Debug("select applied migrations failed", zap.Error(err))
		return fmt.Errorf("select applied migrations: %w", err)
	}

	appliedCount := 0
	for rows.Next() {
		var ts string
		if err := rows.Scan(&ts); err != nil {
			_ = rows.Close()
			logger.Global().Debug("scan applied migration failed", zap.Error(err))
			return fmt.Errorf("scan applied migration: %w", err)
		}
		applied[ts] = struct{}{}
		appliedCount++
	}
	if err := rows.Err(); err != nil {
		_ = rows.Close()
		logger.Global().Debug("iterate applied migrations failed", zap.Error(err))
		return fmt.Errorf("iterate applied migrations: %w", err)
	}
	_ = rows.Close()

	logger.Global().Debug("applied migrations loaded",
		zap.Int("count", appliedCount),
	)

	// Load embedded migrations
	migs, err := Migrations()
	if err != nil {
		logger.Global().Debug("load embedded migrations failed", zap.Error(err))
		return fmt.Errorf("load embedded migrations: %w", err)
	}

	logger.Global().Debug("embedded migrations discovered",
		zap.Int("count", len(migs)),
	)

	now := time.Now().UTC().Format(time.RFC3339)

	ins, err := tx.PrepareContext(ctx, `
INSERT INTO _migrations (timestamp, name, contents, applied_at)
VALUES (?, ?, ?, ?)
`)
	if err != nil {
		logger.Global().Debug("prepare insert migration failed", zap.Error(err))
		return fmt.Errorf("prepare insert migration: %w", err)
	}
	defer ins.Close()

	appliedNow := 0
	skipped := 0

	for _, m := range migs {
		if _, ok := applied[m.Timestamp]; ok {
			skipped++
			logger.Global().Debug("skipping migration",
				zap.String("timestamp", m.Timestamp),
				zap.String("name", m.Name),
			)
			continue
		}

		logger.Global().Debug("applying migration",
			zap.String("timestamp", m.Timestamp),
			zap.String("name", m.Name),
		)

		stepStart := time.Now()

		if _, err := tx.ExecContext(ctx, m.Contents); err != nil {
			logger.Global().Debug("apply migration failed",
				zap.String("timestamp", m.Timestamp),
				zap.String("name", m.Name),
				zap.Duration("dur", time.Since(stepStart)),
				zap.Error(err),
			)
			return fmt.Errorf("apply migration %s_%s: %w", m.Timestamp, m.Name, err)
		}

		if _, err := ins.ExecContext(ctx, m.Timestamp, m.Name, m.Contents, now); err != nil {
			logger.Global().Debug("record migration failed",
				zap.String("timestamp", m.Timestamp),
				zap.String("name", m.Name),
				zap.Duration("dur", time.Since(stepStart)),
				zap.Error(err),
			)
			return fmt.Errorf("record migration %s_%s: %w", m.Timestamp, m.Name, err)
		}

		appliedNow++
		logger.Global().Debug("migration applied",
			zap.String("timestamp", m.Timestamp),
			zap.String("name", m.Name),
			zap.Duration("dur", time.Since(stepStart)),
		)
	}

	logger.Global().Debug("migration loop complete",
		zap.Int("applied_now", appliedNow),
		zap.Int("skipped", skipped),
	)

	logger.Global().Debug("committing migration transaction")
	if err := tx.Commit(); err != nil {
		logger.Global().Debug("commit failed", zap.Error(err))
		return fmt.Errorf("commit migrations tx: %w", err)
	}

	committed = true

	logger.Global().Debug("migration committed",
		zap.Duration("total_dur", time.Since(start)),
		zap.Int("applied_now", appliedNow),
		zap.Int("skipped", skipped),
		zap.Int("already_applied", appliedCount),
	)

	return nil
}
