package utopiopsService

import (
	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
	"github.com/utopiops/automated-ops/ao-api/stores/triggerStore"
)

type UtopiopsService interface {
}

type UtopiopsManager struct {
	TriggerStore     triggerStore.TriggerStore
	IntegrationStore integrationStore.IntegrationStore
}

func NewutopiopsService(trStore triggerStore.TriggerStore, intgStore integrationStore.IntegrationStore) UtopiopsService {
	return &UtopiopsManager{TriggerStore: trStore, IntegrationStore: intgStore}
}

func (manager *UtopiopsManager) UpdateUsedTimes() ([]string, error) {
	utopiopss := make([]string, 0)
	for _, integ := range models.Avaliableutopiopss {
		utopiopss = append(utopiopss, integ.Type)
	}
	return utopiopss, nil
}
