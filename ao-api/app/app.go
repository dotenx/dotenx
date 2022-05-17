package app

import (
	"fmt"
	"log"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/controllers/admin"
	"github.com/dotenx/dotenx/ao-api/controllers/crud"
	"github.com/dotenx/dotenx/ao-api/controllers/execution"
	"github.com/dotenx/dotenx/ao-api/controllers/health"
	integrationController "github.com/dotenx/dotenx/ao-api/controllers/integration"
	oauthController "github.com/dotenx/dotenx/ao-api/controllers/oauth"
	predefinedtaskcontroller "github.com/dotenx/dotenx/ao-api/controllers/predefinedTask"
	"github.com/dotenx/dotenx/ao-api/controllers/trigger"
	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/middlewares"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/executionService"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/services/oauthService"
	predifinedTaskService "github.com/dotenx/dotenx/ao-api/services/predefinedTaskService"
	"github.com/dotenx/dotenx/ao-api/services/queueService"
	triggerService "github.com/dotenx/dotenx/ao-api/services/triggersService"
	"github.com/dotenx/dotenx/ao-api/services/utopiopsService"
	"github.com/dotenx/dotenx/ao-api/stores/authorStore"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
	"github.com/dotenx/dotenx/ao-api/stores/pipelineStore"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
	"github.com/dotenx/dotenx/ao-api/stores/triggerStore"
	"github.com/dotenx/goth"
	"github.com/dotenx/goth/gothic"
	"github.com/gin-contrib/sessions"
	sessRedis "github.com/gin-contrib/sessions/redis"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
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
	redisClient, err := initializeRedis()
	utils.FailOnError(err, "RDB initialization failed")
	queue := queueService.NewBullQueue()
	r := routing(db, queue, redisClient)
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

func routing(db *db.DB, queue queueService.QueueService, redisClient *redis.Client) *gin.Engine {
	// duration, err := strconv.Atoi(config.Configs.App.SessionDuration)
	// if err != nil {
	// 	panic(err.Error())
	// }
	r := gin.Default()
	store, _ := sessRedis.NewStore(20, "tcp", config.Configs.Redis.Host+":"+fmt.Sprint(config.Configs.Redis.Port), "", []byte(config.Configs.Secrets.SessionAuthSecret), []byte(config.Configs.Secrets.SessionEncryptSecret))
	store.Options(sessions.Options{
		// for local test
		Domain: "localhost",

		Path:   "/",
		MaxAge: int(6 * time.Hour / time.Second),
	})
	r.Use(sessions.Sessions("dotenx", store))
	// Middlewares
	r.Use(middlewares.CORSMiddleware(config.Configs.App.AllowedOrigins))
	healthCheckController := health.HealthCheckController{}
	// Routes
	r.GET("/health", healthCheckController.GetStatus())
	pipelineStore := pipelineStore.New(db)
	IntegrationStore := integrationStore.New(db)
	TriggerStore := triggerStore.New(db)
	AuthorStore := authorStore.New(db)
	RedisStore := redisStore.New(redisClient)
	UtopiopsService := utopiopsService.NewutopiopsService(AuthorStore)
	IntegrationService := integrationService.NewIntegrationService(IntegrationStore, RedisStore)

	executionServices := executionService.NewExecutionService(pipelineStore, queue, IntegrationService, UtopiopsService)
	predefinedService := predifinedTaskService.NewPredefinedTaskService()
	TriggerServic := triggerService.NewTriggerService(TriggerStore, UtopiopsService, executionServices, IntegrationService)
	crudServices := crudService.NewCrudService(pipelineStore, TriggerServic)
	OauthService := oauthService.NewOauthService(RedisStore)
	crudController := crud.CRUDController{Service: crudServices, TriggerServic: TriggerServic}
	executionController := execution.ExecutionController{Service: executionServices}
	predefinedController := predefinedtaskcontroller.New(predefinedService)
	IntegrationController := integrationController.IntegrationController{Service: IntegrationService}
	TriggerController := trigger.TriggerController{Service: TriggerServic, CrudService: crudServices}
	OauthController := oauthController.OauthController{Service: OauthService}
	adminController := admin.AdminController{}

	// endpoints which dont need authntication

	r.POST("/execution/id/:id/next", executionController.GetNextTask())
	r.GET("/execution/id/:id/initial_data", executionController.GetInitialData())
	r.GET("/execution/id/:id/task/:taskId", executionController.GetTaskDetails())
	r.POST("/execution/id/:id/task/:taskId/result", executionController.TaskExecutionResult())
	r.POST("/execution/ep/:endpoint/start", executionController.StartPipeline())

	//

	if !config.Configs.App.RunLocally {
		r.Use(middlewares.OauthMiddleware())
	}

	// Routes
	// TODO : add sessions middleware to needed endpoints
	tasks := r.Group("/task")
	pipline := r.Group("/pipeline")
	execution := r.Group("/execution")
	intgration := r.Group("/integration")
	trigger := r.Group("/trigger")
	admin := r.Group("/internal")

	admin.POST("/automation/activate", adminController.ActivateAutomation)
	admin.POST("/automation/deactivate", adminController.DeActivateAutomation)
	admin.POST("/execution/submit", adminController.SubmitExecution)
	admin.POST("/user/access/:resource", adminController.CheckAccess)

	// tasks router
	tasks.GET("", predefinedController.GetTasks)
	tasks.GET("/:task_name/fields", predefinedController.GetFields)

	// pipeline router
	pipline.POST("", crudController.AddPipeline())
	pipline.PUT("", crudController.UpdatePipeline())
	pipline.GET("", crudController.GetPipelines())
	pipline.DELETE("/name/:name", crudController.DeletePipeline())
	pipline.GET("/name/:name/executions", crudController.GetListOfPipelineExecution())
	pipline.GET("/name/:name", crudController.GetPipeline())
	pipline.GET("/name/:name/activate", crudController.ActivatePipeline())
	pipline.GET("/name/:name/deactivate", crudController.DeActivatePipeline())

	// execution router
	execution.GET("/id/:id/details", executionController.GetExecutionDetails())
	execution.POST("/name/:name/start", executionController.StartPipelineByName())
	execution.GET("/name/:name/status", executionController.WatchPipelineLastExecutionStatus())
	execution.GET("/id/:id/status", executionController.WatchExecutionStatus())
	//execution.POST("/ep/:endpoint/task/:name/start", executionController.StartPipelineTask())

	execution.GET("/queue", executionController.GetExecution())
	execution.POST("/id/:id/task/:taskId/status/timedout", executionController.TaskExecutionTimedout())
	execution.GET("/id/:id/task/:taskId/result", executionController.GetTaskExecutionResult())
	execution.GET("/id/:id/task_name/:task_name/result", executionController.GetTaskExecutionResultByName())

	// integration router
	intgration.POST("", IntegrationController.AddIntegration())
	intgration.GET("", IntegrationController.GetAllIntegrations())
	intgration.DELETE("/name/:name", IntegrationController.DeleteIntegration())
	intgration.GET("/avaliable", IntegrationController.GetIntegrationTypes())
	intgration.GET("/type/:type/fields", IntegrationController.GetIntegrationTypeFields())

	// trigger router
	trigger.POST("", TriggerController.AddTriggers())
	trigger.PUT("", TriggerController.UpdateTriggers())
	trigger.GET("", TriggerController.GetAllTriggers())
	trigger.GET("/type/:type", TriggerController.GetAllTriggersForAccountByType())
	trigger.GET("/avaliable", TriggerController.GetTriggersTypes())
	trigger.GET("/type/:type/definition", TriggerController.GetDefinitionForTrigger())
	trigger.DELETE("/name/:name", TriggerController.DeleteTrigger())

	// authentication settings
	gothic.Store = store
	// integrationCallbackUrl := config.Configs.Endpoints.AoApi + "/oauth/integration/callbacks/"
	integrationCallbackUrl := config.Configs.Endpoints.AoApiLocal + "/oauth/integration/callbacks/"
	providers, err := oauth.GetProviders(integrationCallbackUrl)
	if err != nil {
		panic(err.Error())
	}
	for _, provider := range providers {
		goth.UseProviders(*provider)
	}
	oauth := r.Group("/oauth")
	{
		oauth.GET("/callbacks/:provider", sessions.Sessions("dotenx_session", store), OauthController.OAuthCallback)
		oauth.GET("/auth/:provider", sessions.Sessions("dotenx_session", store), OauthController.OAuth)
		oauth.GET("/integration/callbacks/:provider", OauthController.OAuthIntegrationCallback)
	}

	// discord, intgErr := IntegrationService.GetIntegrationByName("123456", "test-discord02")
	// fmt.Println("****************************************")
	// fmt.Printf("discord integration: %#v\n", discord)
	// fmt.Printf("intgErr: %#v\n", intgErr)
	// fmt.Println("****************************************")
	// dropbox, intgErr := IntegrationService.GetIntegrationByName("123456", "test-dropbox01")
	// fmt.Println("****************************************")
	// fmt.Printf("dropbox integration: %#v\n", dropbox)
	// fmt.Printf("intgErr: %#v\n", intgErr)
	// fmt.Println("****************************************")

	go TriggerServic.StartChecking(IntegrationStore)
	go TriggerServic.StartScheduller()
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

func initializeRedis() (redisClient *redis.Client, err error) {
	opt := &redis.Options{
		Addr: fmt.Sprintf("%s:%d", config.Configs.Redis.Host, config.Configs.Redis.Port),
		// Password: config.Configs.Redis.Password,
	}
	redisClient, err = db.RedisConnect(opt)
	return
}
