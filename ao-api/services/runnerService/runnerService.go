package runnerservice

import (
	"context"

	runnerstore "github.com/utopiops/automated-ops/ao-api/stores/runnerStore"
)

var noContext = context.Background()

type RunnerService interface {
	Store(accountId, runnerType string) (string, error)
	Get(runnerId string) (string, error)
	GetAccountId(runnerId string) (string, error)
}

type runnerService struct {
	store runnerstore.RunnerStore
}

func NewRunnerService(runnerStore runnerstore.RunnerStore) RunnerService {
	return &runnerService{store: runnerStore}
}

func (r *runnerService) Store(accountId, runnerType string) (string, error) {
	return r.store.Store(noContext, accountId, runnerType)
}

func (r *runnerService) Get(runnerId string) (string, error) {
	return r.store.Get(noContext, runnerId)
}

func (r *runnerService) GetAccountId(runnerId string) (string, error) {
	return r.store.GetAccountId(noContext, runnerId)
}
