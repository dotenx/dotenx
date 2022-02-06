package app

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/config"
	"github.com/utopiops/automated-ops/ao-api/controllers/crud"
	"github.com/utopiops/automated-ops/ao-api/controllers/execution"
	"github.com/utopiops/automated-ops/ao-api/controllers/health"
	"github.com/utopiops/automated-ops/ao-api/controllers/onoffboarding"
	predefinedtaskcontroller "github.com/utopiops/automated-ops/ao-api/controllers/predefinedTask"
	runnercontroller "github.com/utopiops/automated-ops/ao-api/controllers/runner"
	"github.com/utopiops/automated-ops/ao-api/controllers/workspaces"
	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/pkg/middlewares"
	"github.com/utopiops/automated-ops/ao-api/pkg/utils"
	"github.com/utopiops/automated-ops/ao-api/services/crudService"
	"github.com/utopiops/automated-ops/ao-api/services/executionService"
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
	//redis, err := redis.NewRDB()
	utils.FailOnError(err, "RDB initialization failed")
	//queue, err := queueService.NewRmq()
	queue := queueService.NewBullQueue()
	//utils.FailOnError(err, "Queue service initialization failed, exiting the app with error!")
	// Initialize and open the connection
	// queueService := services.NewQueueService()
	// err = queueService.Initialize()
	// utils.FailOnError(err, "Failed to initialize Queue")
	// queueSvc, err := prepareQueueService()
	// utils.FailOnError(err, "Failed to prepare the QueueService")
	// connError, err := queueSvc.Open()
	// utils.FailOnError(err, "Failed to connect to queue")
	// go func() {
	// 	select {
	// 	case <-connError:
	// 		// TODO: do something
	// 	}
	// }()
	// Initialize router
	r /*, g*/ := routing(db, queue)
	if r == nil {
		log.Fatalln("r is nil")
	}
	return &App{
		route: r,
		//grpServer: g,
	}
}

func (a *App) Start(restPort, grpcPort string) error {
	errChan := make(chan error)
	go func() {
		err := a.route.Run(restPort)
		if err != nil {
			log.Println(err)
			errChan <- err
			return
		}
	}()
	/*go func() {
		lis, err := net.Listen("tcp", grpcPort)
		if err != nil {
			log.Printf("failed to listen: %v", err)
			errChan <- err
			return
		}
		s := grpc.NewServer()
		//pb.RegisterExecutionServiceServer(s, a.//grpServer)
		reflection.Register(s)
		log.Printf("server listening at %v", lis.Addr())
		if err := s.Serve(lis); err != nil {
			log.Printf("failed to serve: %v", err)
			errChan <- err
			return
		}
	}()
	log.Println("grpc server is running")*/
	return <-errChan
}

func routing(db *db.DB, queue queueService.QueueService) *gin.Engine /*, *executionserver.ExecutionServer*/ {
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
	crudController := crud.CRUDController{Service: crudServices}
	executionController := execution.ExecutionController{Service: executionServices}
	onOffBoardingController := onoffboarding.Controller{Service: onoffboardingServices}
	workspacesController := workspaces.WorkspacesController{Servicee: workspacesServices}
	runnerController := runnercontroller.New(runnerservice)
	predefinedController := predefinedtaskcontroller.New(predefinedService)
	// Routes

	//g := executionserver.New(executionServices)
	//pretected
	tasks := r.Group("/task")
	{
		tasks.GET("/predifined", predefinedController.GetTasks)
		tasks.GET("/predifined/:task_name/fields", predefinedController.GetFields)
		//tasks.POST("/predifined", crudController.AddPipeline()) // todo: endpoint to add predefined task
	}
	pipline := r.Group("/pipeline")
	{
		pipline.POST("", crudController.AddPipeline())
		pipline.GET("", crudController.GetPipelines())
		pipline.GET("/name/:name", crudController.ListPipelineVersions())
		pipline.GET("/name/:name/version/:version", crudController.GetPipeline())
		pipline.POST("/name/:name/version/:version/activate", crudController.ActivatePipeline())
	}
	execution := r.Group("/execution")
	{
		execution.POST("/ep/:endpoint/start", executionController.StartPipeline())
		execution.POST("/name/:name/start", executionController.StartPipelineByName())
		execution.POST("/ep/:endpoint/task/:name/start", executionController.StartPipelineTask())
		execution.POST("/ep/:endpoint/stop", executionController.StopPipeline())
		execution.POST("/ep/:endpoint/task/:name/stop", executionController.StopPipelineTask())

		execution.GET("/queue", executionController.GetExecution())
		execution.GET("/id/:id/graph", executionController.GetExecutionGraph())
		execution.POST("/id/:id/next", executionController.GetNextTask())
		execution.GET("/id/:id/initial_data", executionController.GetInitialData())
		execution.GET("/id/:id/task/:taskId", executionController.GetTaskDetails())
		execution.POST("/id/:id/task/:taskId/status/timedout", executionController.TaskExecutionTimedout())
		execution.POST("/id/:id/task/:taskId/result", executionController.TaskExecutionResult())
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
