package db

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/train360-corp/projdocs/apps/federation/pkg/logger"
)

type Instance struct {
	ID          int64  `db:"id"`
	UID         string `db:"uid"`
	ContainerID int64  `db:"container_id"`
	CIDR        string `db:"cidr"`
}

// assumes you have: var sqlite *sql.DB
func CreateInstance(ctx context.Context, containerID int64) (Instance, error) {
	conn, err := sqlite.Conn(ctx)
	if err != nil {
		return Instance{}, fmt.Errorf("get conn: %w", err)
	}
	defer conn.Close()

	committed := false
	defer func() {
		if !committed {
			_, _ = conn.ExecContext(ctx, `ROLLBACK;`)
		}
	}()

	// Start an IMMEDIATE transaction (write lock up-front)
	if _, err := conn.ExecContext(ctx, `BEGIN IMMEDIATE;`); err != nil {
		return Instance{}, fmt.Errorf("begin immediate: %w", err)
	}

	next, err := nextCIDR(ctx, conn)
	if err != nil {
		return Instance{}, err
	}

	logger.Global().Debug(next)

	res, err := conn.ExecContext(ctx, `
INSERT INTO instances (container_id, cidr)
VALUES (?, ?)
`, containerID, next)
	if err != nil {
		return Instance{}, fmt.Errorf("insert instance: %w", err)
	}

	id, err := res.LastInsertId()
	if err != nil {
		return Instance{}, fmt.Errorf("last insert id: %w", err)
	}

	var out Instance
	if err := conn.QueryRowContext(ctx, `
SELECT id, uid, container_id, cidr
FROM instances
WHERE id = ?
`, id).Scan(&out.ID, &out.UID, &out.ContainerID, &out.CIDR); err != nil {
		return Instance{}, fmt.Errorf("select inserted instance: %w", err)
	}

	if _, err := conn.ExecContext(ctx, `COMMIT;`); err != nil {
		return Instance{}, fmt.Errorf("commit: %w", err)
	}
	committed = true

	return out, nil
}

// nextCIDR computes the next available 172.16.X.Y/32 using "max+1" ordering.
// host = X*256 + Y, allocate 1..65534.
func nextCIDR(ctx context.Context, q queryer) (string, error) {
	var maxHost sql.NullInt64

	const sqlMax = `
SELECT MAX(
	CAST(substr(cidr, 8, instr(substr(cidr, 8), '.') - 1) AS INTEGER) * 256 +
	CAST(substr(
		cidr,
		8 + instr(substr(cidr, 8), '.'),
		instr(cidr, '/32') - (8 + instr(substr(cidr, 8), '.'))
	) AS INTEGER)
) AS max_host
FROM instances
WHERE cidr IS NOT NULL;
`

	if err := q.QueryRowContext(ctx, sqlMax).Scan(&maxHost); err != nil {
		return "", fmt.Errorf("compute max host: %w", err)
	}

	nextHost := int64(1)
	if maxHost.Valid {
		nextHost = maxHost.Int64 + 1
	}

	if nextHost < 1 || nextHost > 65534 {
		return "", fmt.Errorf("no available CIDR remaining (nextHost=%d)", nextHost)
	}

	x := nextHost / 256
	y := nextHost % 256

	return fmt.Sprintf("172.16.%d.%d/32", x, y), nil
}

type queryer interface {
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}
