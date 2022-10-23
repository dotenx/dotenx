package app

import (
	"fmt"
	"os"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/controllers/crud"
	"github.com/dotenx/dotenx/ao-api/controllers/database"
	"github.com/dotenx/dotenx/ao-api/controllers/execution"
	"github.com/dotenx/dotenx/ao-api/controllers/health"
	integrationController "github.com/dotenx/dotenx/ao-api/controllers/integration"
	internalController "github.com/dotenx/dotenx/ao-api/controllers/internalController"
	"github.com/dotenx/dotenx/ao-api/controllers/marketplace"
	oauthController "github.com/dotenx/dotenx/ao-api/controllers/oauth"
	"github.com/dotenx/dotenx/ao-api/controllers/objectstore"
	"github.com/dotenx/dotenx/ao-api/controllers/predefinedMiniTask"
	predefinedtaskcontroller "github.com/dotenx/dotenx/ao-api/controllers/predefinedTask"
	"github.com/dotenx/dotenx/ao-api/controllers/profile"
	"github.com/dotenx/dotenx/ao-api/controllers/project"
	"github.com/dotenx/dotenx/ao-api/controllers/trigger"
	"github.com/dotenx/dotenx/ao-api/controllers/uibuilder"
	"github.com/dotenx/dotenx/ao-api/controllers/uicomponent"
	"github.com/dotenx/dotenx/ao-api/controllers/userManagement"
	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/middlewares"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/executionService"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/services/internalService"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/dotenx/dotenx/ao-api/services/notifyService"
	"github.com/dotenx/dotenx/ao-api/services/oauthService"
	"github.com/dotenx/dotenx/ao-api/services/objectstoreService"
	predfinedTaskService "github.com/dotenx/dotenx/ao-api/services/predefinedTaskService"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/services/queueService"
	triggerService "github.com/dotenx/dotenx/ao-api/services/triggersService"
	"github.com/dotenx/dotenx/ao-api/services/uiComponentService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/dotenx/dotenx/ao-api/services/userManagementService"
	"github.com/dotenx/dotenx/ao-api/services/utopiopsService"
	"github.com/dotenx/dotenx/ao-api/stores/authorStore"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
	"github.com/dotenx/dotenx/ao-api/stores/marketplaceStore"
	"github.com/dotenx/dotenx/ao-api/stores/oauthStore"
	"github.com/dotenx/dotenx/ao-api/stores/objectstoreStore"
	"github.com/dotenx/dotenx/ao-api/stores/pipelineStore"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
	"github.com/dotenx/dotenx/ao-api/stores/triggerStore"
	"github.com/dotenx/dotenx/ao-api/stores/uiComponentStore"
	"github.com/dotenx/dotenx/ao-api/stores/uibuilderStore"
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
	// Stores
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
	uibuilderStore := uibuilderStore.New(db)
	marketplaceStore := marketplaceStore.New(db)
	componentStort := uiComponentStore.New(db)

	// Services
	UtopiopsService := utopiopsService.NewutopiopsService(AuthorStore)
	IntegrationService := integrationService.NewIntegrationService(IntegrationStore, RedisStore, OauthStore)
	executionServices := executionService.NewExecutionService(pipelineStore, queue, IntegrationService, UtopiopsService)
	predefinedService := predfinedTaskService.NewPredefinedTaskService()
	TriggerService := triggerService.NewTriggerService(TriggerStore, UtopiopsService, executionServices, IntegrationService, pipelineStore, RedisStore)
	crudServices := crudService.NewCrudService(pipelineStore, RedisStore, TriggerService, IntegrationService)
	OauthService := oauthService.NewOauthService(OauthStore, RedisStore)
	InternalService := internalService.NewInternalService(ProjectStore, DatabaseStore, RedisStore, crudServices)
	ProjectService := projectService.NewProjectService(ProjectStore, UserManagementStore)
	UserManagementService := userManagementService.NewUserManagementService(UserManagementStore, ProjectStore)
	DatabaseService := databaseService.NewDatabaseService(DatabaseStore, UserManagementService)
	objectstoreService := objectstoreService.NewObjectstoreService(objectstoreStore)
	uibuilderService := uibuilderService.NewUIbuilderService(uibuilderStore)
	marketplaceService := marketplaceService.NewMarketplaceService(marketplaceStore, uibuilderStore)
	uiComponentServi := uiComponentService.NewUIbuilderService(componentStort)

	// Controllers
	crudController := crud.CRUDController{Service: crudServices, TriggerServic: TriggerService}
	executionController := execution.ExecutionController{Service: executionServices}
	predefinedController := predefinedtaskcontroller.New(predefinedService)
	predefinedMiniTaskController := predefinedMiniTask.PredefinedMiniTaskController{}
	IntegrationController := integrationController.IntegrationController{Service: IntegrationService, OauthService: OauthService}
	TriggerController := trigger.TriggerController{Service: TriggerService, CrudService: crudServices}
	OauthController := oauthController.OauthController{Service: OauthService, IntegrationService: IntegrationService}
	InternalController := internalController.InternalController{Service: InternalService}
	projectController := project.ProjectController{Service: ProjectService}
	databaseController := database.DatabaseController{Service: DatabaseService}
	userManagementController := userManagement.UserManagementController{Service: UserManagementService, ProjectService: ProjectService, OauthService: OauthService, NotifyService: notifyService.NewNotifierService()}
	profileController := profile.ProfileController{}
	objectstoreController := objectstore.ObjectstoreController{Service: objectstoreService}
	uibuilderController := uibuilder.UIbuilderController{Service: uibuilderService, ProjectService: ProjectService}
	marketplaceController := marketplace.MarketplaceController{Service: marketplaceService}
	uiComponentController := uicomponent.UIComponentController{Service: uiComponentServi}

	// Routes
	// endpoints with runner token
	r.POST("/execution/id/:id/next", executionController.GetNextTask())
	r.POST("/execution/id/:id/task/:taskId/result", executionController.TaskExecutionResult())

	// r.GET("/execution/id/:id/initial_data", executionController.GetInitialData())
	r.GET("/execution/id/:id/task/:taskId", executionController.GetTaskDetails())

	// user management router (without any authentication)
	r.POST("/user/management/project/:tag/register", userManagementController.Register())
	r.POST("/user/management/project/:tag/login", userManagementController.Login())
	r.POST("/user/management/project/:tag/forget/password", userManagementController.SendForgetPasswordMail(httpHelper))
	r.POST("/user/management/project/:tag/reset/password", userManagementController.ResetPassword())
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
	public.POST("/execution/ep/:endpoint/start", executionController.StartPipeline())

	// this is a mock admin endpoints for test locally and other report endpoints that be used in plan-manager
	internal := r.Group("/internal")

	if !config.Configs.App.RunLocally {
		r.Use(middlewares.OauthMiddleware(httpHelper))
	} else {
		r.Use(middlewares.LocalTokenTypeMiddleware())
	}

	// TODO : add sessions middleware to needed endpoints
	tasks := r.Group("/task")
	miniTasks := r.Group("/mini/task")
	pipeline := r.Group("/pipeline")
	execution := r.Group("/execution")
	integration := r.Group("/integration")
	trigger := r.Group("/trigger")
	funcs := r.Group("/funcs")
	project := r.Group("/project")
	database := r.Group("/database")
	profile := r.Group("/profile")
	userManagement := r.Group("/user/management")
	userGroupManagement := r.Group("/user/group/management")
	objectstore := r.Group("/objectstore")
	uibuilder := r.Group("/uibuilder")
	marketplace := r.Group("/marketplace")

	internal.POST("/automation/activate", InternalController.ActivateAutomation)
	internal.POST("/automation/deactivate", InternalController.DeActivateAutomation)
	internal.POST("/execution/submit", InternalController.SubmitExecution)
	internal.POST("/user/access/:resource", InternalController.CheckAccess)
	internal.POST("/user/plan/current", InternalController.GetCurrentPlan)
	internal.POST("/project/list", middlewares.InternalMiddleware(), InternalController.ListProjects)
	internal.POST("/db_project/list", middlewares.InternalMiddleware(), InternalController.ListDBProjects)
	internal.POST("/tp_user/list", middlewares.InternalMiddleware(), InternalController.ListTpUsers)
	internal.POST("/user/plan/change", middlewares.InternalMiddleware(), InternalController.ProcessUpdatingPlan())

	// tasks router
	tasks.GET("", predefinedController.GetTasks)
	tasks.GET("/:task_name/fields", predefinedController.GetFields)

	// formatter funcs router
	funcs.GET("", predefinedController.GetFuncs)

	// mini-tasks router
	miniTasks.GET("", predefinedMiniTaskController.GetMiniTasks)

	// In order to reduce the risks we're taking the following measures:

	// pipeline router
	// TODO: fix the type of the pipeline
	pipeline.POST("/project/:project_name", crudController.AddPipeline())
	pipeline.GET("/project/:project_name", crudController.ListProjectPipelines())
	pipeline.POST("/project/:project_name/template/name/:name", crudController.CreateFromTemplate())
	pipeline.GET("/project/:project_name/template/name/:name", crudController.GetTemplateDetailes())
	pipeline.GET("/project/:project_name/template/name/:name/children", crudController.GetTemplateChildren())
	pipeline.GET("/project/:project_name/interaction/name/:name", crudController.GetInteractionDetailes())
	pipeline.PUT("/project/:project_name", crudController.UpdatePipeline())
	pipeline.GET("", crudController.GetPipelines())
	pipeline.DELETE("/project/:project_name/name/:name", crudController.DeletePipeline())
	pipeline.GET("/project/:project_name/name/:name/executions", crudController.GetListOfPipelineExecution())
	pipeline.GET("/project/:project_name/name/:name", crudController.GetPipeline())
	pipeline.GET("/project/:project_name/name/:name/activate", crudController.ActivatePipeline())
	pipeline.GET("/project/:project_name/name/:name/deactivate", crudController.DeActivatePipeline())
	// Set the access (public or private) for the interaction
	pipeline.PATCH("/project/:project_name/name/:name/access", crudController.SetInteractionAccess())
	// Set the authorized user groups for the pipeline (only applicable for interactions and templates). By default any authenticated user is authorized to access the pipeline.
	pipeline.PATCH("/project/:project_name/name/:name/usergroup", crudController.SetUserGroups())

	// execution router
	execution.GET("/id/:id/details", executionController.GetExecutionDetails())
	execution.POST("/project/:project_name/name/:name/start", executionController.StartPipelineByName())
	execution.POST("/type/:type/step/:step_name", executionController.RunInstantly(crudServices, TriggerService, IntegrationService))
	execution.GET("/project/:project_name/name/:name/status", executionController.WatchPipelineLastExecutionStatus())
	execution.GET("/id/:id/status", executionController.WatchExecutionStatus())
	// execution.POST("/ep/:endpoint/task/:name/start", executionController.StartPipelineTask())

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
	// todo: delete in a future release
	// trigger.POST("", TriggerController.AddTriggers())
	// trigger.PUT("", TriggerController.UpdateTriggers())
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
	project.POST("", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.AddProject(marketplaceService, DatabaseService, crudServices, uibuilderService))
	project.DELETE("/tag/:project_tag", projectController.DeleteProject(marketplaceService, DatabaseService, crudServices, uibuilderService))
	project.GET("", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.ListProjects())
	project.GET("/:name", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.GetProject())
	project.GET("/tag/:project_tag/domain", projectController.GetProjectDomain()) // had to use tag in the path to avoid conflict with :name
	project.POST("/:project_tag/domain", projectController.SetProjectExternalDomain())
	project.POST("/:project_tag/domain/verify", projectController.VerifyExternalDomain())

	// database router
	database.POST("/table", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.AddTable())
	database.DELETE("/project/:project_name/table/:table_name", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.DeleteTable())
	database.PATCH("/project/:project_name/table/:table_name/access", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.SetTableAccess())
	database.POST("/table/column", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.AddTableColumn())
	database.DELETE("/project/:project_name/table/:table_name/column/:column_name", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.DeleteTableColumn())
	database.GET("/project/:project_name/table", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.GetTablesList(ProjectService))
	database.GET("/project/:project_name/table/:table_name/column", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.ListTableColumns())
	database.POST("/query/insert/project/:project_tag/table/:table_name", middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.InsertRow())
	database.PUT("/query/update/project/:project_tag/table/:table_name/row/:id", middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.UpdateRow())
	database.DELETE("/query/delete/project/:project_tag/table/:table_name", middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.DeleteRow())
	database.POST("/query/select/project/:project_tag/table/:table_name", middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.SelectRows())
	public.POST("/database/query/select/project/:project_tag/table/:table_name", databaseController.SelectRowsPublicly())
	database.POST("/userGroup", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.AddTable())

	// user management router (with authentication)
	userManagement.DELETE("/project/:tag/", userManagementController.DeleteUser())

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
	objectstore.PATCH("/project/:project_tag/file/:file_name/access", middlewares.TokenTypeMiddleware([]string{"user"}), objectstoreController.SetAccess())
	objectstore.PATCH("/project/:project_tag/file/:file_name/user_groups", middlewares.TokenTypeMiddleware([]string{"user"}), objectstoreController.SetUserGroups())
	objectstore.DELETE("/project/:project_tag/file/:file_name", middlewares.TokenTypeMiddleware([]string{"user", "tp"}), objectstoreController.DeleteFile())
	public.GET("/project/:project_tag/file/:file_name", objectstoreController.GetPublicFile())

	// uibuilder router
	uibuilder.POST("/project/:project_tag/page", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.UpsertPage())
	uibuilder.DELETE("/project/:project_tag/page/:page_name", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.DeletePage())
	uibuilder.GET("/project/:project_tag/page", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.ListPages())
	uibuilder.GET("/project/:project_tag/page/:page_name", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.GetPage())
	uibuilder.POST("/project/:project_tag/page/:page_name/publish", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.PublishPage())
	uibuilder.POST("/project/name/:project_name/state/global", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.UpsertGlobalStates())
	uibuilder.GET("/project/name/:project_name/state/global", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.GetGlobalStates())

	// uicomponent router
	uibuilder.POST("/project/:project_tag/component", middlewares.TokenTypeMiddleware([]string{"user"}), uiComponentController.UpsertComponent(marketplaceService))
	uibuilder.DELETE("/project/:project_tag/component/:component_name", middlewares.TokenTypeMiddleware([]string{"user"}), uiComponentController.DeleteComponent())
	uibuilder.GET("/project/:project_tag/component", middlewares.TokenTypeMiddleware([]string{"user"}), uiComponentController.ListComponents())
	uibuilder.GET("/project/:project_tag/component/:component_name", middlewares.TokenTypeMiddleware([]string{"user"}), uiComponentController.GetComponent())

	// marketplace router
	marketplace.POST("/item", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.AddItem(DatabaseService, crudServices, uiComponentServi, ProjectService))
	marketplace.POST("/upload", marketplaceController.Upload())
	marketplace.PATCH("/item/:id/disable", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.DisableItem())
	marketplace.PATCH("/item/:id/enable", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.EnableItem())
	marketplace.POST("/credential/temporary", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.GetTemporaryCredential())
	marketplace.POST("/function", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.CreateFunction())
	marketplace.PUT("/function", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.UpdateFunction())
	marketplace.GET("/function/:function_name", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.GetFunction())
	public.GET("/marketplace/item/:id", marketplaceController.GetItem())
	public.GET("/marketplace", marketplaceController.ListItems())

	// profile router
	profile.GET("", profileController.GetProfile())

	// dt, err := marketplaceService.GetProjectOfItem(1)
	// if err != nil {
	// 	panic(err)
	// }
	// fmt.Println(dt)

	go TriggerService.StartChecking(IntegrationStore)
	go TriggerService.StartScheduller()
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
