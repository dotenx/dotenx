package integration_tests

import (
	"fmt"
	"log"
	"os"
	"testing"

	"github.com/dotenx/dotenx/ao-api/controllers/crud"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/executionService"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	triggerService "github.com/dotenx/dotenx/ao-api/services/triggersService"
	"github.com/dotenx/dotenx/ao-api/services/utopiopsService"
	"github.com/dotenx/dotenx/ao-api/stores/authorStore"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
	"github.com/dotenx/dotenx/ao-api/stores/oauthStore"
	"github.com/dotenx/dotenx/ao-api/stores/pipelineStore"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
	"github.com/dotenx/dotenx/ao-api/stores/triggerStore"
)

var crudController *crud.CRUDController

func TestMain(m *testing.M) {
	// do before test actions such as initializing db
	var err error
	dbConnection, err := utils.InitializeDB()
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
	pipelineStore := pipelineStore.New(dbConnection)
	IntegrationStore := integrationStore.New(dbConnection)
	TriggerStore := triggerStore.New(dbConnection)
	AuthorStore := authorStore.New(dbConnection)
	RedisStore := redisStore.New(nil)
	OauthStore := oauthStore.New(dbConnection)
	UtopiopsService := utopiopsService.NewutopiopsService(AuthorStore)
	IntegrationService := integrationService.NewIntegrationService(IntegrationStore, RedisStore, OauthStore)
	executionServices := executionService.NewExecutionService(pipelineStore, nil, IntegrationService, UtopiopsService)
	ts := triggerService.NewTriggerService(TriggerStore, UtopiopsService, executionServices, IntegrationService, pipelineStore)
	cm := crudService.NewCrudService(pipelineStore, ts, IntegrationService)

	crudController = &crud.CRUDController{Service: cm, TriggerServic: ts}
	if err != nil {
		panic(err)
	}
	// Run all tests
	exitVal := m.Run()
	// do after test actions such as revert db changes that was for test
	fmt.Println("all tests finished")
	utils.RefreshDb(dbConnection)
	os.Exit(exitVal)
}
