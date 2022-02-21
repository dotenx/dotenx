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
	"github.com/utopiops/automated-ops/ao-api/controllers/onoffboarding"
	predefinedtaskcontroller "github.com/utopiops/automated-ops/ao-api/controllers/predefinedTask"
	runnercontroller "github.com/utopiops/automated-ops/ao-api/controllers/runner"
	"github.com/utopiops/automated-ops/ao-api/controllers/workspaces"
	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/pkg/middlewares"
	"github.com/utopiops/automated-ops/ao-api/pkg/utils"
	"github.com/utopiops/automated-ops/ao-api/services/crudService"
	"github.com/utopiops/automated-ops/ao-api/services/executionService"
	"github.com/utopiops/automated-ops/ao-api/services/integrationService"
	"github.com/utopiops/automated-ops/ao-api/services/onoffboardingService"
	predifinedTaskService "github.com/utopiops/automated-ops/ao-api/services/predefinedTaskService"
	"github.com/utopiops/automated-ops/ao-api/services/queueService"
	runnerservice "github.com/utopiops/automated-ops/ao-api/services/runnerService"
	"github.com/utopiops/automated-ops/ao-api/services/workspacesService"
	"github.com/utopiops/automated-ops/ao-api/stores/pipelineStore"
	runnerstore "github.com/utopiops/automated-ops/ao-api/stores/runnerStore"
)

func init() {
	gin.ForceConsoleColor()
}

type App struct {
	route *gin.Engine
	//grpServer *executionserver.ExecutionServer
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
	r.Use(func(ctx *gin.Context) {
		ctx.Set("accountId", "123456")
		ctx.Next()
	})
	// TODO: Providers to be called here
	pipelineStore := pipelineStore.New(db)
	runnerStore := runnerstore.New(db)
	crudServices := crudService.NewCrudService(pipelineStore)
	executionServices := executionService.NewExecutionService(pipelineStore, queue)
	onoffboardingServices := onoffboardingService.NewOnofboardingService(pipelineStore)
	workspacesServices := workspacesService.NewWorkspaceService(pipelineStore)
	runnerservice := runnerservice.NewRunnerService(runnerStore)
	predefinedService := predifinedTaskService.NewPredefinedTaskService()
	IntegrationService := integrationService.NewIntegrationService()
	crudController := crud.CRUDController{Service: crudServices}
	executionController := execution.ExecutionController{Service: executionServices}
	onOffBoardingController := onoffboarding.Controller{Service: onoffboardingServices}
	workspacesController := workspaces.WorkspacesController{Servicee: workspacesServices}
	runnerController := runnercontroller.New(runnerservice)
	predefinedController := predefinedtaskcontroller.New(predefinedService)
	IntegrationController := integrationController.IntegrationController{Service: IntegrationService}

	// Routes
	//pretected
	tasks := r.Group("/task")
	{
		tasks.GET("", predefinedController.GetTasks)
		tasks.GET("/:task_name/fields", predefinedController.GetFields)
	}
	pipline := r.Group("/pipeline")
	{
		pipline.POST("", crudController.AddPipeline())
		pipline.GET("", crudController.GetPipelines())
		pipline.GET("/name/:name", crudController.ListPipelineVersions())
		pipline.GET("/name/:name/executions", crudController.GetListOfPipelineExecution())
		pipline.GET("/name/:name/version/:version", crudController.GetPipeline())
		pipline.POST("/name/:name/version/:version/activate", crudController.ActivatePipeline())
	}
	execution := r.Group("/execution")
	{
		execution.POST("/ep/:endpoint/start", executionController.StartPipeline())
		execution.POST("/name/:name/start", executionController.StartPipelineByName())
		execution.GET("/name/:name/status", executionController.WatchPipelineLastExecutionStatus())
		execution.GET("/id/:id/status", executionController.WatchExecutionStatus())
		//execution.POST("/ep/:endpoint/task/:name/start", executionController.StartPipelineTask())
		//execution.POST("/ep/:endpoint/stop", executionController.StopPipeline())
		//execution.POST("/ep/:endpoint/task/:name/stop", executionController.StopPipelineTask())

		execution.GET("/queue", executionController.GetExecution())
		execution.GET("/id/:id/graph", executionController.GetExecutionGraph())
		execution.POST("/id/:id/next", executionController.GetNextTask())
		execution.GET("/id/:id/initial_data", executionController.GetInitialData())
		execution.GET("/id/:id/task/:taskId", executionController.GetTaskDetails())
		execution.POST("/id/:id/task/:taskId/status/timedout", executionController.TaskExecutionTimedout())
		execution.POST("/id/:id/task/:taskId/result", executionController.TaskExecutionResult())
		execution.GET("/id/:id/task/:taskId/result", executionController.GetTaskExecutionResult())
		execution.GET("/id/:id/task_name/:task_name/result", executionController.GetTaskExecutionResultByName())
	}
	workspaces := r.Group("/workspaces")
	{
		workspaces.GET("/executions", workspacesController.ListWorkspaceExecutions())
		workspaces.GET("/flows/name/:name/version/:version", workspacesController.GetFlow())

		workspaces.POST("/onboarding/flows", onOffBoardingController.CreateOnOffBoardingFlow(onoffboarding.OnBoarding))
		workspaces.POST("/onboarding/flows/name/:name/version/:version", onOffBoardingController.AddOnOffBoardingFlow(onoffboarding.OnBoarding))
		workspaces.GET("/onboarding/flows", onOffBoardingController.ListOnOffBoardingFlows(onoffboarding.OnBoarding))

		workspaces.POST("/offboarding/flows", onOffBoardingController.CreateOnOffBoardingFlow(onoffboarding.OffBoarding))
		workspaces.POST("/offboarding/flows/name/:name/version/:version", onOffBoardingController.AddOnOffBoardingFlow(onoffboarding.OffBoarding))
		workspaces.GET("/offboarding/flows", onOffBoardingController.ListOnOffBoardingFlows(onoffboarding.OffBoarding))
	}
	runner := r.Group("/runner")
	{
		runner.POST("/register/type/:type", runnerController.RegisterRunner)
		runner.GET("/id/:id/queue", runnerController.GetQueueId)
	}
	intgration := r.Group("/integration")
	{
		intgration.POST("", IntegrationController.AddIntegration())
		intgration.GET("", IntegrationController.GetIntegrations())
		intgration.GET("/type/:type", IntegrationController.GetIntegrationFields())
	}
	return r /*, g*/
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
