package app

import (
	"fmt"
	"os"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/controllers/admin"
	"github.com/dotenx/dotenx/ao-api/controllers/crud"
	"github.com/dotenx/dotenx/ao-api/controllers/database"
	"github.com/dotenx/dotenx/ao-api/controllers/execution"
	"github.com/dotenx/dotenx/ao-api/controllers/health"
	integrationController "github.com/dotenx/dotenx/ao-api/controllers/integration"
	oauthController "github.com/dotenx/dotenx/ao-api/controllers/oauth"
	"github.com/dotenx/dotenx/ao-api/controllers/objectstore"
	"github.com/dotenx/dotenx/ao-api/controllers/predefinedMiniTask"
	predefinedtaskcontroller "github.com/dotenx/dotenx/ao-api/controllers/predefinedTask"
	"github.com/dotenx/dotenx/ao-api/controllers/profile"
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
	"github.com/dotenx/dotenx/ao-api/services/objectstoreService"
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
	"github.com/dotenx/dotenx/ao-api/stores/objectstoreStore"
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
	"github.com/sirupsen/logrus"
)

func init() {
	gin.ForceConsoleColor()
}

type App struct {
	route *gin.Engine
}

func NewApp() *App {
	initializeLogrus()
	// Initialize databae
	db, err := initializeDB()
	utils.FailOnError(err, "Database initialization failed, exiting the app with error!")
	redisClient, err := initializeRedis()
	utils.FailOnError(err, "RDB initialization failed")
	queue := queueService.NewBullQueue()
	r := routing(db, queue, redisClient)
	if r == nil {
		logrus.Fatal("r is nil")
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
			logrus.Error(err)
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
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
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
	r.Use(sessions.Sessions("dotenx", store))
	// Middlewares
	r.Use(middlewares.CORSMiddleware(config.Configs.App.AllowedOrigins))
	healthCheckController := health.HealthCheckController{}
	r.GET("/health", healthCheckController.GetStatus())
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
	objectstoreStore := objectstoreStore.New(db)

	UtopiopsService := utopiopsService.NewutopiopsService(AuthorStore)
	IntegrationService := integrationService.NewIntegrationService(IntegrationStore, RedisStore, OauthStore)

	executionServices := executionService.NewExecutionService(pipelineStore, queue, IntegrationService, UtopiopsService)
	predefinedService := predifinedTaskService.NewPredefinedTaskService()
	TriggerServic := triggerService.NewTriggerService(TriggerStore, UtopiopsService, executionServices, IntegrationService, pipelineStore)
	crudServices := crudService.NewCrudService(pipelineStore, TriggerServic, IntegrationService)
	OauthService := oauthService.NewOauthService(OauthStore, RedisStore)
	ProjectService := projectService.NewProjectService(ProjectStore, UserManagementStore)
	UserManagementService := userManagementService.NewUserManagementService(UserManagementStore, ProjectStore)
	DatabaseService := databaseService.NewDatabaseService(DatabaseStore, UserManagementService)
	objectstoreService := objectstoreService.NewObjectstoreService(objectstoreStore)

	crudController := crud.CRUDController{Service: crudServices, TriggerServic: TriggerServic}
	executionController := execution.ExecutionController{Service: executionServices}
	predefinedController := predefinedtaskcontroller.New(predefinedService)
	predefinedMiniTaskController := predefinedMiniTask.PredefinedMiniTaskController{}
	IntegrationController := integrationController.IntegrationController{Service: IntegrationService, OauthService: OauthService}
	TriggerController := trigger.TriggerController{Service: TriggerServic, CrudService: crudServices}
	OauthController := oauthController.OauthController{Service: OauthService, IntegrationService: IntegrationService}
	adminController := admin.AdminController{}
	projectController := project.ProjectController{Service: ProjectService}
	databaseController := database.DatabaseController{Service: DatabaseService}
	userManagementController := userManagement.UserManagementController{Service: UserManagementService, ProjectService: ProjectService, OauthService: OauthService}
	profileController := profile.ProfileController{}
	objectstoreController := objectstore.ObjectstoreController{Service: objectstoreService}

	// endpoints with runner token
	r.POST("/execution/id/:id/next", executionController.GetNextTask())
	r.POST("/execution/id/:id/task/:taskId/result", executionController.TaskExecutionResult())

	// r.GET("/execution/id/:id/initial_data", executionController.GetInitialData())
	r.GET("/execution/id/:id/task/:taskId", executionController.GetTaskDetails())

	// user management router (without any authentication)
	r.POST("/user/management/project/:tag/register", userManagementController.Register())
	r.POST("/user/management/project/:tag/login", userManagementController.Login())
	r.GET("/user/management/project/:project/provider/:provider/authorize", userManagementController.OAuthConsent())
	r.GET("/user/management/project/:project/provider/:provider/callback", userManagementController.OAuthLogin())

	// TokenTypeMiddleware limits access to endpoints and can get a slice of string as parameter and this strings should be 'user' or 'tp' or both of them
	// 'user' used for DoTenX users and 'tp' used for third-party users
	// oauth user providers routes
	r.GET("/oauth/user/provider/auth/provider/:provider_name/account_id/:account_id",
		middlewares.OauthMiddleware(httpHelper),
		middlewares.TokenTypeMiddleware([]string{"tp"}),
		sessions.Sessions("dotenx_session", store), OauthController.ThirdPartyOAuth)
	r.GET("/oauth/user/provider/integration/callbacks/provider/:provider_name/account_id/:account_id",
		sessions.Sessions("dotenx_session", store), OauthController.OAuthThirdPartyIntegrationCallback)
	r.GET("/oauth/webhook/:provider", OauthController.OAuthVerifyWebhook)
	r.POST("/oauth/webhook/:provider", OauthController.OAuthWebhook)

	public := r.Group("/public")

	if !config.Configs.App.RunLocally {
		r.Use(middlewares.OauthMiddleware(httpHelper))
	} else {
		r.Use(middlewares.LocalTokenTypeMiddleware())
	}

	// Routes
	// TODO : add sessions middleware to needed endpoints
	tasks := r.Group("/task")
	miniTasks := r.Group("/mini/task")
	pipeline := r.Group("/pipeline")
	execution := r.Group("/execution")
	integration := r.Group("/integration")
	trigger := r.Group("/trigger")
	admin := r.Group("/internal")
	project := r.Group("/project")
	database := r.Group("/database")
	profile := r.Group("/profile")
	userGroupManagement := r.Group("/user/group/management")
	objectstore := r.Group("/objectstore")

	admin.POST("/automation/activate", adminController.ActivateAutomation)
	admin.POST("/automation/deactivate", adminController.DeActivateAutomation)
	admin.POST("/execution/submit", adminController.SubmitExecution)
	admin.POST("/user/access/:resource", adminController.CheckAccess)

	// tasks router
	tasks.GET("", predefinedController.GetTasks)
	tasks.GET("/:task_name/fields", predefinedController.GetFields)

	// mini-tasks router
	miniTasks.GET("", predefinedMiniTaskController.GetMiniTasks)

	// In order to reduce the risks we're taking the following measures:

	// pipeline router
	// TODO: fix the type of the pipeline
	public.POST("/execution/ep/:endpoint/start", executionController.StartPipeline())
	pipeline.POST("", crudController.AddPipeline())
	pipeline.POST("/template/name/:name", crudController.CreateFromTemplate())
	pipeline.GET("/template/name/:name", crudController.GetTemplateDetailes())
	pipeline.GET("/interaction/name/:name", crudController.GetInteractionDetailes())
	pipeline.PUT("", crudController.UpdatePipeline())
	pipeline.GET("", crudController.GetPipelines())
	pipeline.DELETE("/name/:name", crudController.DeletePipeline())
	pipeline.GET("/name/:name/executions", crudController.GetListOfPipelineExecution())
	pipeline.GET("/name/:name", crudController.GetPipeline())
	pipeline.GET("/name/:name/activate", crudController.ActivatePipeline())
	pipeline.GET("/name/:name/deactivate", crudController.DeActivatePipeline())
	// Set the access (public or private) for the interaction
	pipeline.PATCH("/name/:name/access", crudController.SetInteractionAccess())
	// Set the authorized user groups for the pipeline (only applicable for interactions and templates). By default any authenticated user is authorized to access the pipeline.
	pipeline.PATCH("/name/:name/usergroup", crudController.SetUserGroups())

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

		oauth.GET("/auth/:provider", sessions.Sessions("dotenx_session", store), OauthController.OAuth)
		oauth.GET("/integration/callbacks/:provider", OauthController.OAuthIntegrationCallback)
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
	database.PUT("/query/update/project/:project_tag/table/:table_name/row/:id", databaseController.UpdateRow())
	database.DELETE("/query/delete/project/:project_tag/table/:table_name/row/:id", databaseController.DeleteRow())
	database.POST("/query/select/project/:project_tag/table/:table_name", databaseController.SelectRows())
	// database userGroups
	database.POST("/userGroup", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.AddTable())

	// user group management router (with authentication)
	userGroupManagement.POST("/project/:tag/userGroup", middlewares.TokenTypeMiddleware([]string{"user"}), userManagementController.CreateUserGroup())
	userGroupManagement.PUT("/project/:tag/userGroup", middlewares.TokenTypeMiddleware([]string{"user"}), userManagementController.UpdateUserGroup())
	userGroupManagement.GET("/project/:tag/userGroup", middlewares.TokenTypeMiddleware([]string{"user"}), userManagementController.GetUserGroups())
	userGroupManagement.DELETE("/project/:tag/userGroup/name/:name", middlewares.TokenTypeMiddleware([]string{"user"}), userManagementController.DeleteUserGroup())
	userGroupManagement.POST("/project/:tag/userGroup/name/:name", userManagementController.SetUserGroup())
	userGroupManagement.POST("/project/:tag/userGroup/default", middlewares.TokenTypeMiddleware([]string{"user"}), userManagementController.SetDefaultUserGroup())

	// objectstore router
	objectstore.POST("/project/:project_tag/upload", middlewares.TokenTypeMiddleware([]string{"user", "tp"}), objectstoreController.Upload())
	objectstore.GET("/project/:project_tag", middlewares.TokenTypeMiddleware([]string{"user", "tp"}), objectstoreController.ListFiles())
	objectstore.GET("/project/:project_tag/file/:file_name", middlewares.TokenTypeMiddleware([]string{"user", "tp"}), objectstoreController.GetFile())
	public.GET("/project/:project_tag/file/:file_name", objectstoreController.GetPublicFile())

	profile.GET("", profileController.GetProfile())

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
	logrus.Info(connStr)
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

func initializeLogrus() {
	// Log as JSON instead of the default ASCII formatter.
	logrus.SetFormatter(&logrus.JSONFormatter{})

	// Output to stdout instead of the default stderr
	// Can be any io.Writer, see below for File example
	logrus.SetOutput(os.Stdout)

	logrus.SetReportCaller(true)

	// We set log level based on an environment variable.
	switch config.Configs.App.LogLevel {
	case "trace":
		logrus.SetLevel(logrus.TraceLevel)
		logrus.Info("Logrus log level is trace")
	case "debug":
		logrus.SetLevel(logrus.DebugLevel)
		logrus.Info("Logrus log level is debug")
	case "info":
		logrus.SetLevel(logrus.InfoLevel)
		logrus.Info("Logrus log level is info")
	case "warn":
		logrus.SetLevel(logrus.WarnLevel)
		logrus.Info("Logrus log level is warn")
	case "error":
		logrus.SetLevel(logrus.ErrorLevel)
		logrus.Info("Logrus log level is error")
	case "fatal":
		logrus.SetLevel(logrus.FatalLevel)
		logrus.Info("Logrus log level is fatal")
	default:
		logrus.SetLevel(logrus.InfoLevel)
		logrus.Info("Logrus log level is info")
	}
}
