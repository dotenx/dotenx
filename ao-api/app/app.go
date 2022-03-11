package app

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/config"
	"github.com/utopiops/automated-ops/ao-api/controllers/crud"
	"github.com/utopiops/automated-ops/ao-api/controllers/execution"
	"github.com/utopiops/automated-ops/ao-api/controllers/health"
	integrationController "github.com/utopiops/automated-ops/ao-api/controllers/integration"
	predefinedtaskcontroller "github.com/utopiops/automated-ops/ao-api/controllers/predefinedTask"
	"github.com/utopiops/automated-ops/ao-api/controllers/trigger"
	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/pkg/middlewares"
	"github.com/utopiops/automated-ops/ao-api/pkg/utils"
	"github.com/utopiops/automated-ops/ao-api/services/crudService"
	"github.com/utopiops/automated-ops/ao-api/services/executionService"
	"github.com/utopiops/automated-ops/ao-api/services/integrationService"
	predifinedTaskService "github.com/utopiops/automated-ops/ao-api/services/predefinedTaskService"
	"github.com/utopiops/automated-ops/ao-api/services/queueService"
	triggerService "github.com/utopiops/automated-ops/ao-api/services/triggersService"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
	"github.com/utopiops/automated-ops/ao-api/stores/pipelineStore"
	"github.com/utopiops/automated-ops/ao-api/stores/triggerStore"
)

func init() {
	gin.ForceConsoleColor()
}

type App struct {
	route *gin.Engine
}

func NewApp() *App {
	// Initialize databae
	db, err := initializeDB()
	utils.FailOnError(err, "Database initialization failed, exiting the app with error!")
	utils.FailOnError(err, "RDB initialization failed")
	queue := queueService.NewBullQueue()
	r := routing(db, queue)
	if r == nil {
		log.Fatalln("r is nil")
	}
	return &App{
		route: r,
	}
}

func (a *App) Start(restPort string) error {
	errChan := make(chan error)
	go func() {
		err := a.route.Run(restPort)
		if err != nil {
			log.Println(err)
			errChan <- err
			return
		}
	}()
	return <-errChan
}

func routing(db *db.DB, queue queueService.QueueService) *gin.Engine {
	r := gin.Default()
	// Middlewares
	r.Use(middlewares.CORSMiddleware(config.Configs.App.AllowedOrigins))
	healthCheckController := health.HealthCheckController{}
	// Routes
	r.GET("/health", healthCheckController.GetStatus())
	// setting account id for request, this account id is not importnt and only used in db tables
	r.Use(func(ctx *gin.Context) {
		ctx.Set("accountId", config.Configs.App.AccountId)
		ctx.Next()
	})
	pipelineStore := pipelineStore.New(db)
	IntegrationStore := integrationStore.New(db)
	TriggerStore := triggerStore.New(db)
	IntegrationService := integrationService.NewIntegrationService(IntegrationStore)
	crudServices := crudService.NewCrudService(pipelineStore)
	executionServices := executionService.NewExecutionService(pipelineStore, queue, IntegrationService)
	predefinedService := predifinedTaskService.NewPredefinedTaskService()
	TriggerServic := triggerService.NewTriggerService(TriggerStore)
	crudController := crud.CRUDController{Service: crudServices}
	executionController := execution.ExecutionController{Service: executionServices}
	predefinedController := predefinedtaskcontroller.New(predefinedService)
	IntegrationController := integrationController.IntegrationController{Service: IntegrationService}
	TriggerController := trigger.TriggerController{Service: TriggerServic, CrudService: crudServices}

	// Routes
	tasks := r.Group("/task")
	{
		tasks.GET("", predefinedController.GetTasks)
		tasks.GET("/:task_name/fields", predefinedController.GetFields)
	}
	pipline := r.Group("/pipeline")
	{
		pipline.POST("", crudController.AddPipeline())
		pipline.GET("", crudController.GetPipelines())
		pipline.DELETE("/name/:name", crudController.DeletePipeline())
		pipline.GET("/name/:name/executions", crudController.GetListOfPipelineExecution())
		pipline.GET("/name/:name", crudController.GetPipeline())
	}
	execution := r.Group("/execution")
	{
		execution.POST("/ep/:endpoint/start", executionController.StartPipeline())
		execution.POST("/name/:name/start", executionController.StartPipelineByName())
		execution.GET("/name/:name/status", executionController.WatchPipelineLastExecutionStatus())
		execution.GET("/id/:id/status", executionController.WatchExecutionStatus())
		//execution.POST("/ep/:endpoint/task/:name/start", executionController.StartPipelineTask())

		execution.GET("/queue", executionController.GetExecution())
		execution.POST("/id/:id/next", executionController.GetNextTask())
		execution.GET("/id/:id/initial_data", executionController.GetInitialData())
		execution.GET("/id/:id/task/:taskId", executionController.GetTaskDetails())
		execution.POST("/id/:id/task/:taskId/status/timedout", executionController.TaskExecutionTimedout())
		execution.POST("/id/:id/task/:taskId/result", executionController.TaskExecutionResult())
		execution.GET("/id/:id/task/:taskId/result", executionController.GetTaskExecutionResult())
		execution.GET("/id/:id/task_name/:task_name/result", executionController.GetTaskExecutionResultByName())
	}
	intgration := r.Group("/integration")
	{
		intgration.POST("", IntegrationController.AddIntegration())
		intgration.GET("", IntegrationController.GetAllIntegrations())
		intgration.DELETE("/name/:name", IntegrationController.DeleteIntegration())
		intgration.GET("/type/:type", IntegrationController.GetAllIntegrationsForAccountByType())
		intgration.GET("/avaliable", IntegrationController.GetIntegrationTypes())
		intgration.GET("/type/:type/fields", IntegrationController.GetIntegrationTypeFields())
	}
	trigger := r.Group("/trigger")
	{
		trigger.POST("", TriggerController.AddTrigger())
		trigger.GET("", TriggerController.GetAllTriggers())
		trigger.GET("/type/:type", TriggerController.GetAllTriggersForAccountByType())
		trigger.GET("/avaliable", TriggerController.GetTriggersTypes())
		trigger.GET("/type/:type/definition", TriggerController.GetDefinitionForTrigger())
		trigger.DELETE("/name/:name", TriggerController.DeleteTrigger())
	}
	go TriggerServic.StartChecking(config.Configs.App.AccountId, IntegrationStore)
	return r
}

func initializeDB() (*db.DB, error) {
	host := config.Configs.Database.Host
	port := config.Configs.Database.Port
	user := config.Configs.Database.User
	password := config.Configs.Database.Password
	dbName := config.Configs.Database.DbName
	extras := config.Configs.Database.Extras
	driver := config.Configs.Database.Driver

	connStr := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s %s",
		host, port, user, password, dbName, extras)
	log.Println(connStr)
	db, err := db.Connect(driver, connStr)
	return db, err
}
