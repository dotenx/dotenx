package runnerstore

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/db"
)

type RunnerStore interface {
	Store(ctx context.Context, accountId, runnerType string) (string, error)
	Get(ctx context.Context, runnerId string) (string, error)
	GetAccountId(ctx context.Context, runnerId string) (string, error)
}

type runnerStore struct {
	db *db.DB
}

func New(db *db.DB) *runnerStore {
	return &runnerStore{db: db}
}
