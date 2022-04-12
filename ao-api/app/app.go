package app

import (
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
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
	"github.com/gin-contrib/sessions/cookie"
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
	duration, err := strconv.Atoi(config.Configs.App.SessionDuration)
	if err != nil {
		panic(err.Error())
	}
	r := gin.Default()
	store := cookie.NewStore([]byte(config.Configs.Secrets.CookieSecret))
	store.Options(sessions.Options{
		MaxAge: int(time.Second * time.Duration(duration)), //30min
		Path:   "/",
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
	crudServices := crudService.NewCrudService(pipelineStore)
	executionServices := executionService.NewExecutionService(pipelineStore, queue, IntegrationService, UtopiopsService)
	predefinedService := predifinedTaskService.NewPredefinedTaskService()
	TriggerServic := triggerService.NewTriggerService(TriggerStore, UtopiopsService, executionServices)
	OauthService := oauthService.NewOauthService(RedisStore)
	crudController := crud.CRUDController{Service: crudServices}
	executionController := execution.ExecutionController{Service: executionServices}
	predefinedController := predefinedtaskcontroller.New(predefinedService)
	IntegrationController := integrationController.IntegrationController{Service: IntegrationService}
	TriggerController := trigger.TriggerController{Service: TriggerServic, CrudService: crudServices}
	OauthController := oauthController.OauthController{Service: OauthService}

	// Routes
	// TODO : add sessions middleware to needed endpoints
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

	go TriggerServic.StartChecking(config.Configs.App.AccountId, IntegrationStore)
	go TriggerServic.StartScheduller(config.Configs.App.AccountId)
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
