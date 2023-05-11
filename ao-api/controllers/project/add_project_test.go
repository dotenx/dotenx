package project

// todo: uncomment codes when fix problem of testing services

// import (
// 	"bytes"
// 	"encoding/json"
// 	"fmt"
// 	"log"
// 	"net/http"
// 	"net/http/httptest"
// 	"regexp"
// 	"testing"

// 	"github.com/dotenx/dotenx/ao-api/config"
// 	"github.com/dotenx/dotenx/ao-api/models"
// 	"github.com/dotenx/dotenx/ao-api/pkg/utils"
// 	"github.com/dotenx/dotenx/ao-api/services/crudService"
// 	"github.com/dotenx/dotenx/ao-api/services/databaseService"
// 	"github.com/dotenx/dotenx/ao-api/services/executionService"
// 	"github.com/dotenx/dotenx/ao-api/services/integrationService"
// 	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
// 	"github.com/dotenx/dotenx/ao-api/services/projectService"
// 	"github.com/dotenx/dotenx/ao-api/services/queueService"
// 	triggersService "github.com/dotenx/dotenx/ao-api/services/triggersService"
// 	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
// 	"github.com/dotenx/dotenx/ao-api/services/userManagementService"
// 	"github.com/dotenx/dotenx/ao-api/services/utopiopsService"
// 	"github.com/dotenx/dotenx/ao-api/stores/authorStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/marketplaceStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/oauthStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/pipelineStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/triggerStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/uibuilderStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/userManagementStore"
// 	"github.com/go-redis/redis"
// 	"github.com/stretchr/testify/assert"
// )

// func TestAddProjectAction(t *testing.T) {

// 	// err := utils.Bootstrap()
// 	// log.Println(err)
// 	// assert.NoError(t, err)
// 	utils.RegisterCustomValidators()
// 	db, mock, err := utils.InitializeMockDB()
// 	log.Println(err)
// 	assert.NoError(t, err)

// 	// Stores
// 	var redisClient *redis.Client
// 	ProjectStore := projectStore.New(db)
// 	UserManagementStore := userManagementStore.New()
// 	databaseStore := databaseStore.New(db)
// 	pipelineStore := pipelineStore.New(db)
// 	IntegrationStore := integrationStore.New(db)
// 	TriggerStore := triggerStore.New(db)
// 	AuthorStore := authorStore.New(db)
// 	RedisStore := redisStore.New(redisClient)
// 	OauthStore := oauthStore.New(db)
// 	uibuilderStore := uibuilderStore.New(db)
// 	marketplaceStore := marketplaceStore.New(db)

// 	// Services
// 	queue := queueService.NewBullQueue()
// 	ProjectService := projectService.NewProjectService(ProjectStore, UserManagementStore, databaseStore)
// 	UserManagementService := userManagementService.NewUserManagementService(UserManagementStore, ProjectStore)
// 	UtopiopsService := utopiopsService.NewutopiopsService(AuthorStore)
// 	IntegrationService := integrationService.NewIntegrationService(IntegrationStore, RedisStore, OauthStore)
// 	executionServices := executionService.NewExecutionService(pipelineStore, queue, IntegrationService, UtopiopsService)
// 	TriggerService := triggersService.NewTriggerService(TriggerStore, UtopiopsService, executionServices, IntegrationService, pipelineStore, marketplaceStore, RedisStore)
// 	crudServices := crudService.NewCrudService(pipelineStore, RedisStore, TriggerService, IntegrationService)
// 	uibuilderService := uibuilderService.NewUIbuilderService(uibuilderStore)
// 	marketplaceService := marketplaceService.NewMarketplaceService(marketplaceStore, uibuilderStore)
// 	databaseService := databaseService.NewDatabaseService(databaseStore, UserManagementService)

// 	projectController := ProjectController{Service: ProjectService}

// 	fmt.Println("================================================")
// 	fmt.Println(config.Configs.App.CustomQueryTimeLimit)
// 	fmt.Println("================================================")

// 	r := utils.SetUpRouter()
// 	r.POST("/project", projectController.AddProject(marketplaceService, databaseService, crudServices, uibuilderService))
// 	testProject := models.Project{
// 		Name:        "unit_test_5",
// 		Description: "just for unit testing",
// 		AccountId:   "test-account-id",
// 		Type:        "landing_page",
// 	}
// 	jsonValue, _ := json.Marshal(testProject)
// 	req, _ := http.NewRequest("POST", "/project", bytes.NewBuffer(jsonValue))

// 	w := httptest.NewRecorder()
// 	r.ServeHTTP(w, req)
// 	assert.Equal(t, http.StatusOK, w.Code)

// 	mock.ExpectBegin()
// 	mock.ExpectQuery(regexp.QuoteMeta(
// 		`SELECT count(*) FROM "ui_pages_history"
// 		WHERE "account_id" = $1 AND "project_tag" = $2 AND "name" = $3;`))
// 	mock.ExpectCommit()

// 	// err = db.Connection.Close()
// 	// assert.NoError(t, err)
// }
