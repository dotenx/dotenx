package app

import (
	"fmt"
	"log"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/controllers/admin"
	"github.com/dotenx/dotenx/ao-api/controllers/crud"
	"github.com/dotenx/dotenx/ao-api/controllers/database"
	"github.com/dotenx/dotenx/ao-api/controllers/execution"
	"github.com/dotenx/dotenx/ao-api/controllers/health"
	integrationController "github.com/dotenx/dotenx/ao-api/controllers/integration"
	oauthController "github.com/dotenx/dotenx/ao-api/controllers/oauth"
	predefinedtaskcontroller "github.com/dotenx/dotenx/ao-api/controllers/predefinedTask"
	"github.com/dotenx/dotenx/ao-api/controllers/project"
	"github.com/dotenx/dotenx/ao-api/controllers/trigger"
	"github.com/dotenx/dotenx/ao-api/controllers/userManagement"
	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/middlewares"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/executionService"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/services/oauthService"
	predifinedTaskService "github.com/dotenx/dotenx/ao-api/services/predefinedTaskService"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/services/queueService"
	triggerService "github.com/dotenx/dotenx/ao-api/services/triggersService"
	"github.com/dotenx/dotenx/ao-api/services/userManagementService"
	"github.com/dotenx/dotenx/ao-api/services/utopiopsService"
	"github.com/dotenx/dotenx/ao-api/stores/authorStore"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
	"github.com/dotenx/dotenx/ao-api/stores/oauthStore"
	"github.com/dotenx/dotenx/ao-api/stores/pipelineStore"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
	"github.com/dotenx/dotenx/ao-api/stores/triggerStore"
	"github.com/dotenx/dotenx/ao-api/stores/userManagementStore"
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
	RegisterCustomValidators()
	store, _ := sessRedis.NewStore(20, "tcp", config.Configs.Redis.Host+":"+fmt.Sprint(config.Configs.Redis.Port), "", []byte(config.Configs.Secrets.SessionAuthSecret), []byte(config.Configs.Secrets.SessionEncryptSecret))
	storeDomain := ""
	if config.Configs.App.RunLocally {
		storeDomain = "localhost"
	} else {
		storeDomain = ".dotenx.com"
	}
	store.Options(sessions.Options{
		Domain: storeDomain,
		Path:   "/",
		MaxAge: int(6 * time.Hour / time.Second),
	})

	healthCheckController := health.HealthCheckController{}
	r.GET("/health", healthCheckController.GetStatus())

	r.Use(sessions.Sessions("dotenx", store))
	// Middlewares
	r.Use(middlewares.CORSMiddleware(config.Configs.App.AllowedOrigins))

	// Routes
	pipelineStore := pipelineStore.New(db)
	IntegrationStore := integrationStore.New(db)
	TriggerStore := triggerStore.New(db)
	AuthorStore := authorStore.New(db)
	RedisStore := redisStore.New(redisClient)
	OauthStore := oauthStore.New(db)
	ProjectStore := projectStore.New(db)
	DatabaseStore := databaseStore.New(db)
	UserManagementStore := userManagementStore.New()

	UtopiopsService := utopiopsService.NewutopiopsService(AuthorStore)
	IntegrationService := integrationService.NewIntegrationService(IntegrationStore, RedisStore, OauthStore)

	executionServices := executionService.NewExecutionService(pipelineStore, queue, IntegrationService, UtopiopsService)
	predefinedService := predifinedTaskService.NewPredefinedTaskService()
	TriggerServic := triggerService.NewTriggerService(TriggerStore, UtopiopsService, executionServices, IntegrationService, pipelineStore)
	crudServices := crudService.NewCrudService(pipelineStore, TriggerServic)
	DatabaseService := databaseService.NewDatabaseService(DatabaseStore)
	OauthService := oauthService.NewOauthService(OauthStore, RedisStore)
	ProjectService := projectService.NewProjectService(ProjectStore, UserManagementStore)
	UserManagementService := userManagementService.NewUserManagementService(UserManagementStore, ProjectStore)

	crudController := crud.CRUDController{Service: crudServices, TriggerServic: TriggerServic}
	executionController := execution.ExecutionController{Service: executionServices}
	predefinedController := predefinedtaskcontroller.New(predefinedService)
	IntegrationController := integrationController.IntegrationController{Service: IntegrationService, OauthService: OauthService}
	TriggerController := trigger.TriggerController{Service: TriggerServic, CrudService: crudServices}
	OauthController := oauthController.OauthController{Service: OauthService, IntegrationService: IntegrationService}
	adminController := admin.AdminController{}
	projectController := project.ProjectController{Service: ProjectService}
	databaseController := database.DatabaseController{Service: DatabaseService}
	userManagementController := userManagement.UserManagementController{Service: UserManagementService, ProjectService: ProjectService, OauthService: OauthService}

	// endpoints with runner token
	r.POST("/execution/id/:id/next", executionController.GetNextTask())
	r.POST("/execution/id/:id/task/:taskId/result", executionController.TaskExecutionResult())

	// unknown endpoint
	r.POST("/execution/ep/:endpoint/start", executionController.StartPipeline())

	// r.GET("/execution/id/:id/initial_data", executionController.GetInitialData())
	r.GET("/execution/id/:id/task/:taskId", executionController.GetTaskDetails())

	// user management router (without any authentication)
	r.POST("/user/management/project/:tag/register", userManagementController.Register())
	r.POST("/user/management/project/:tag/login", userManagementController.Login())
	r.GET("/user/management/project/:project/provider/:provider/authorize", userManagementController.OAuthConsent())
	r.GET("/user/management/project/:project/provider/:provider/callback", userManagementController.OAuthLogin())

	if !config.Configs.App.RunLocally {
		r.Use(middlewares.OauthMiddleware())
	}

	// Routes
	// TODO : add sessions middleware to needed endpoints
	tasks := r.Group("/task")
	pipeline := r.Group("/pipeline")
	execution := r.Group("/execution")
	integration := r.Group("/integration")
	trigger := r.Group("/trigger")
	admin := r.Group("/internal")
	project := r.Group("/project")
	database := r.Group("/database")

	admin.POST("/automation/activate", adminController.ActivateAutomation)
	admin.POST("/automation/deactivate", adminController.DeActivateAutomation)
	admin.POST("/execution/submit", adminController.SubmitExecution)
	admin.POST("/user/access/:resource", adminController.CheckAccess)

	// tasks router
	tasks.GET("", predefinedController.GetTasks)
	tasks.GET("/:task_name/fields", predefinedController.GetFields)

	// pipeline router
	// TODO: fix the type of the pipeline
	pipeline.POST("", crudController.AddPipeline())
	pipeline.PUT("", crudController.UpdatePipeline())
	pipeline.GET("", crudController.GetPipelines())
	pipeline.DELETE("/name/:name", crudController.DeletePipeline())
	pipeline.GET("/name/:name/executions", crudController.GetListOfPipelineExecution())
	pipeline.GET("/name/:name", crudController.GetPipeline())
	pipeline.GET("/name/:name/activate", crudController.ActivatePipeline())
	pipeline.GET("/name/:name/deactivate", crudController.DeActivatePipeline())

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
	integration.POST("", IntegrationController.AddIntegration())
	integration.GET("", IntegrationController.GetAllIntegrations())
	integration.DELETE("/name/:name", IntegrationController.DeleteIntegration())
	integration.GET("/avaliable", IntegrationController.GetIntegrationTypes())
	integration.GET("/type/:type/fields", IntegrationController.GetIntegrationTypeFields())

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
		oauth.POST("/user/provider", OauthController.AddUserProvider())
		oauth.GET("/user/provider/:name", OauthController.GetUserProvider())
		oauth.DELETE("/user/provider/:name", OauthController.DeleteUserProvider())
		oauth.PUT("/user/provider", OauthController.UpdateUserProvider())
		oauth.GET("/user/provider/list", OauthController.GetAllUserProviders())

		oauth.GET("/callbacks/:provider", sessions.Sessions("dotenx_session", store), OauthController.OAuthCallback)
		oauth.GET("/auth/:provider", sessions.Sessions("dotenx_session", store), OauthController.OAuth)
		oauth.GET("/user/provider/auth/provider/:provider_name/account_id/:account_id",
			sessions.Sessions("dotenx_session", store), OauthController.ThirdPartyOAuth)
		oauth.GET("/integration/callbacks/:provider", OauthController.OAuthIntegrationCallback)
		oauth.GET("/user/provider/integration/callbacks/provider/:provider_name/account_id/:account_id",
			OauthController.OAuthThirdPartyIntegrationCallback)
	}

	// TokenTypeMiddleware limits access to endpoints and can get a slice of string as parameter and this strings should be 'user' or 'tp' or both of them
	// 'user' used for DoTenX users and 'tp' used for third-party users
	// project router
	project.POST("", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.AddProject())
	project.GET("", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.ListProjects())
	project.GET("/:name", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.GetProject())

	// database router
	database.POST("/table", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.AddTable())
	database.DELETE("/project/:project_name/table/:table_name", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.DeleteTable())
	database.POST("/table/column", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.AddTableColumn())
	database.DELETE("/project/:project_name/table/:table_name/column/:column_name", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.DeleteTableColumn())
	database.GET("/project/:project_name/table", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.GetTablesList())
	database.GET("/project/:project_name/table/:table_name/column", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.ListTableColumns())
	database.POST("/query/insert/project/:project_tag/table/:table_name", databaseController.InsertRow())
	database.POST("/query/delete/project/:project_tag/table/:table_name/row/:id", databaseController.DeleteRow())
	database.POST("/query/select/project/:project_tag/table/:table_name", databaseController.SelectRows())

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
