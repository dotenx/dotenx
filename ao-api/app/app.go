package app

import (
	"fmt"
	"os"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/controllers/crud"
	"github.com/dotenx/dotenx/ao-api/controllers/database"
	"github.com/dotenx/dotenx/ao-api/controllers/ecommerce"
	"github.com/dotenx/dotenx/ao-api/controllers/execution"
	"github.com/dotenx/dotenx/ao-api/controllers/gitIntegration"
	"github.com/dotenx/dotenx/ao-api/controllers/health"
	integrationController "github.com/dotenx/dotenx/ao-api/controllers/integration"
	internalController "github.com/dotenx/dotenx/ao-api/controllers/internalController"
	"github.com/dotenx/dotenx/ao-api/controllers/marketplace"
	oauthController "github.com/dotenx/dotenx/ao-api/controllers/oauth"
	"github.com/dotenx/dotenx/ao-api/controllers/objectstore"
	openai "github.com/dotenx/dotenx/ao-api/controllers/openAI"
	"github.com/dotenx/dotenx/ao-api/controllers/predefinedMiniTask"
	predefinedtaskcontroller "github.com/dotenx/dotenx/ao-api/controllers/predefinedTask"
	"github.com/dotenx/dotenx/ao-api/controllers/profile"
	"github.com/dotenx/dotenx/ao-api/controllers/project"
	"github.com/dotenx/dotenx/ao-api/controllers/trigger"
	"github.com/dotenx/dotenx/ao-api/controllers/uiExtension"
	"github.com/dotenx/dotenx/ao-api/controllers/uiForm"
	"github.com/dotenx/dotenx/ao-api/controllers/uibuilder"
	"github.com/dotenx/dotenx/ao-api/controllers/uicomponent"
	"github.com/dotenx/dotenx/ao-api/controllers/userManagement"
	"github.com/dotenx/dotenx/ao-api/db"
	oauthPkg "github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/middlewares"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/executionService"
	"github.com/dotenx/dotenx/ao-api/services/gitIntegrationService"
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
	"github.com/dotenx/dotenx/ao-api/services/uiExtensionService"
	"github.com/dotenx/dotenx/ao-api/services/uiFormService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/dotenx/dotenx/ao-api/services/userManagementService"
	"github.com/dotenx/dotenx/ao-api/services/utopiopsService"
	"github.com/dotenx/dotenx/ao-api/stores/authorStore"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/dotenx/dotenx/ao-api/stores/gitIntegrationStore"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
	"github.com/dotenx/dotenx/ao-api/stores/marketplaceStore"
	"github.com/dotenx/dotenx/ao-api/stores/oauthStore"
	"github.com/dotenx/dotenx/ao-api/stores/objectstoreStore"
	"github.com/dotenx/dotenx/ao-api/stores/pipelineStore"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
	"github.com/dotenx/dotenx/ao-api/stores/triggerStore"
	"github.com/dotenx/dotenx/ao-api/stores/uiComponentStore"
	"github.com/dotenx/dotenx/ao-api/stores/uiExtensionStore"
	"github.com/dotenx/dotenx/ao-api/stores/uiFormStore"
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
		MaxAge: int(24 * time.Hour / time.Second),
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
	extensionStore := uiExtensionStore.New(db)
	formStore := uiFormStore.New(db)
	gitIntegrationStore := gitIntegrationStore.New(db)

	// Services
	UtopiopsService := utopiopsService.NewutopiopsService(AuthorStore)
	IntegrationService := integrationService.NewIntegrationService(IntegrationStore, RedisStore, OauthStore)
	executionServices := executionService.NewExecutionService(pipelineStore, queue, IntegrationService, UtopiopsService)
	TriggerService := triggerService.NewTriggerService(TriggerStore, UtopiopsService, executionServices, IntegrationService, pipelineStore, marketplaceStore, RedisStore)
	crudServices := crudService.NewCrudService(pipelineStore, RedisStore, TriggerService, IntegrationService)
	OauthService := oauthService.NewOauthService(OauthStore, RedisStore)
	ProjectService := projectService.NewProjectService(ProjectStore, UserManagementStore, DatabaseStore)
	UserManagementService := userManagementService.NewUserManagementService(UserManagementStore, ProjectStore)
	DatabaseService := databaseService.NewDatabaseService(DatabaseStore, UserManagementService)
	objectstoreService := objectstoreService.NewObjectstoreService(objectstoreStore)
	uibuilderService := uibuilderService.NewUIbuilderService(uibuilderStore)
	marketplaceService := marketplaceService.NewMarketplaceService(marketplaceStore, uibuilderStore)
	uiComponentServi := uiComponentService.NewUIbuilderService(componentStort)
	uiExtensionService := uiExtensionService.NewUIExtensionService(extensionStore)
	uiFormService := uiFormService.NewUIFormService(formStore)
	InternalService := internalService.NewInternalService(ProjectStore, DatabaseStore, RedisStore, ProjectService, crudServices, uibuilderService, uiFormService, objectstoreService)
	predefinedService := predfinedTaskService.NewPredefinedTaskService(marketplaceService)
	gitIntegrationService := gitIntegrationService.NewGitIntegrationService(gitIntegrationStore)

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
	profileController := profile.ProfileController{Service: UserManagementService}
	objectstoreController := objectstore.ObjectstoreController{Service: objectstoreService}
	uibuilderController := uibuilder.UIbuilderController{Service: uibuilderService, ProjectService: ProjectService}
	marketplaceController := marketplace.MarketplaceController{Service: marketplaceService}
	uiComponentController := uicomponent.UIComponentController{Service: uiComponentServi}
	uiExtensionController := uiExtension.UIExtensionController{Service: uiExtensionService}
	uiFormController := uiForm.UIFormController{Service: uiFormService}
	GitIntegrationController := gitIntegration.GitIntegrationController{Service: gitIntegrationService}
	EcommerceController := ecommerce.EcommerceController{DatabaseService: DatabaseService, UserManagementService: UserManagementService, ProjectService: ProjectService, ObjectstoreService: objectstoreService, IntegrationService: IntegrationService, PipelineService: crudServices}
	OpenAIController := openai.OpenAIController{}

	// Routes
	r.GET("/execution/id/:id/task/:taskId", executionController.GetTaskDetails())

	// this route used by event bridge scheduler for triggering pipelines (all type of trigger except 'Schedule')
	r.POST("/pipeline/check/trigger", TriggerController.HandleEventBridgeScheduler())
	// this route used by event bridge scheduler for triggering pipelines that have one or more trigger with 'Schedule' type
	r.POST("/pipeline/check/trigger/scheduled", TriggerController.HandleScheduledTriggers())
	// this route used by event bridge scheduler for checking domain registration status
	r.POST("/project/event/bridge/scheduler/domain", projectController.HandleDomainRegistration())
	// this route used by event bridge when certificate of one or more domain have been issued
	r.POST("/project/event/bridge/events/certificate", projectController.HandleCertificateIssuance())

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
	uibuilder := r.Group("/uibuilder")
	objectstore := r.Group("/objectstore")
	marketplace := r.Group("/marketplace")
	gitIntegration := r.Group("/git/integration")
	ecommerce := r.Group("/ecommerce")
	openai := r.Group("/openai")

	internal.POST("/automation/activate", InternalController.ActivateAutomation)
	internal.POST("/automation/deactivate", InternalController.DeActivateAutomation)
	internal.POST("/execution/submit", InternalController.SubmitExecution)
	internal.POST("/execution/task", InternalController.UpdateExecutionTasksUsage)
	internal.POST("/user/access/:resource", InternalController.CheckAccess)
	internal.POST("/user/plan/current", InternalController.GetCurrentPlan)
	internal.POST("/project/list", middlewares.InternalMiddleware(), InternalController.ListProjects)
	internal.POST("/db_project/list", middlewares.InternalMiddleware(), InternalController.ListDBProjects)
	internal.POST("/tp_user/list", middlewares.InternalMiddleware(), InternalController.ListTpUsers)
	internal.POST("/ui_page/list", middlewares.InternalMiddleware(), InternalController.ListUiPages)
	internal.POST("/ui_form/list", middlewares.InternalMiddleware(), InternalController.ListUiForms)
	internal.POST("/domain/list", middlewares.InternalMiddleware(), InternalController.ListDomains)
	internal.POST("/file_storage/usage", middlewares.InternalMiddleware(), InternalController.GetFileStorageUsage)
	internal.POST("/user/plan/change", middlewares.InternalMiddleware(), InternalController.ProcessUpdatingPlan())
	internal.POST("/user/domain/purchase", middlewares.InternalMiddleware(), InternalController.HandleDomainPurchase())

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
	integration.PUT("/name/:name", IntegrationController.UpdateIntegration())
	integration.GET("", IntegrationController.GetAllIntegrations())
	integration.GET("/name/:name", IntegrationController.GetConnectedAccount())
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
	providers, err := oauthPkg.GetProviders(integrationCallbackUrl)
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
	project.DELETE("/tag/:project_tag", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.DeleteProject(marketplaceService, DatabaseService, crudServices, uibuilderService))
	project.GET("", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.ListProjects())
	project.GET("/:name", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.GetProject())
	project.GET("/tag/:project_tag/domain", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.GetProjectDomain()) // had to use tag in the path to avoid conflict with :name
	project.POST("/:project_tag/domain", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.SetProjectExternalDomain())
	project.POST("/:project_tag/domain/verify", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.VerifyCertificate())
	project.POST("/setup/dependent", middlewares.TokenTypeMiddleware([]string{"user"}), projectController.ProjectDependentSetup(DatabaseService, crudServices, IntegrationService))

	// database router
	database.POST("/table", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.AddTable())
	database.DELETE("/project/:project_name/table/:table_name", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.DeleteTable())
	database.PATCH("/project/:project_name/table/:table_name/access", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.SetTableAccess())
	database.PATCH("/project/:project_name/table/:table_name/write/access", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.SetWriteToTableAccess())
	database.POST("/view", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.UpsertView())
	database.POST("/table/column", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.AddTableColumn())
	database.DELETE("/project/:project_name/view/:view_name", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.DeleteView())
	database.DELETE("/project/:project_name/table/:table_name/column/:column_name", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.DeleteTableColumn())
	database.GET("/project/:project_name/view", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.GetViewsList())
	database.GET("/project/:project_name/view/:view_name", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.GetViewDetails())
	database.GET("/project/:project_name/table", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.GetTablesList(ProjectService))
	database.GET("/project/:project_name/table/:table_name/column", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.ListTableColumns())
	database.POST("/query/insert/project/:project_tag/table/:table_name", middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.InsertRow())
	database.POST("/import/insert/project/:project_tag/table/:table_name", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.ImportCsvFile(ProjectService))
	database.POST("/query/arbitrary/project/:project_tag", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.RunDatabaseQuery())
	database.PUT("/query/update/project/:project_tag/table/:table_name/row/:id", middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.UpdateRow())
	database.GET("/query/select/project/:project_tag/table/:table_name/row/:id", middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.SelectRowById())
	database.DELETE("/query/delete/project/:project_tag/table/:table_name", middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.DeleteRow())
	database.POST("/query/select/project/:project_tag/table/:table_name", middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.SelectRows())
	database.POST("/query/select/project/:project_tag/view/:view_name", middlewares.ProjectOwnerMiddleware(ProjectService), databaseController.RunViewQuery())
	database.POST("/job/project/:project_name/result", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.GetDatabaseJob(ProjectService))
	database.POST("/job/project/:project_name/run", middlewares.TokenTypeMiddleware([]string{"user"}), databaseController.RunDatabaseJob(ProjectService))
	public.POST("/database/query/insert/project/:project_tag/table/:table_name", databaseController.InsertRowPublicly())
	public.POST("/database/query/select/project/:project_tag/table/:table_name", databaseController.SelectRowsPublicly())
	public.POST("/database/query/select/project/:project_tag/view/:view_name", databaseController.RunViewQueryPublicly())
	public.GET("/database/query/select/project/:project_tag/table/:table_name/row/:id", databaseController.SelectRowByIdPublicly())
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
	objectstore.POST("/project/:project_tag/upload", middlewares.TokenTypeMiddleware([]string{"user", "tp"}), objectstoreController.Upload(ProjectService))
	objectstore.GET("/project/:project_tag", middlewares.TokenTypeMiddleware([]string{"user", "tp"}), objectstoreController.ListFiles())
	objectstore.GET("/project/:project_tag/file/:file_name", middlewares.TokenTypeMiddleware([]string{"user", "tp"}), objectstoreController.GetFile())
	objectstore.POST("/project/:project_tag/file/:file_name/presign/url", middlewares.TokenTypeMiddleware([]string{"user"}), objectstoreController.GetPresignUrl())
	objectstore.PATCH("/project/:project_tag/file/:file_name/access", middlewares.TokenTypeMiddleware([]string{"user"}), objectstoreController.SetAccess())
	objectstore.PATCH("/project/:project_tag/file/:file_name/user_groups", middlewares.TokenTypeMiddleware([]string{"user"}), objectstoreController.SetUserGroups())
	objectstore.DELETE("/project/:project_tag/file/:file_name", middlewares.TokenTypeMiddleware([]string{"user", "tp"}), objectstoreController.DeleteFile())
	public.GET("/project/:project_tag/file/:file_name", objectstoreController.GetPublicFile())

	// uibuilder router
	uibuilder.POST("/project/:project_tag/page", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.UpsertPage())
	uibuilder.DELETE("/project/:project_tag/page/:page_name", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.DeletePage())
	uibuilder.GET("/project/:project_tag/page", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.ListPages())
	uibuilder.GET("/project/:project_tag/page/form/list", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.ListPagesWithMoreDetails(uiFormService))
	uibuilder.GET("/project/:project_tag/page/:page_name", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.GetPage())
	uibuilder.GET("/project/:project_tag/page/:page_name/history", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.GetPageHistory())
	uibuilder.POST("/project/:project_tag/page/:page_name/publish", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.PublishPage())
	uibuilder.POST("/project/:project_tag/page/:page_name/preview", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.PreviewPage())
	uibuilder.GET("/project/:project_tag/page/:page_name/url", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.GetPageUrls())
	uibuilder.POST("/project/name/:project_name/state/global", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.UpsertGlobalStates())
	uibuilder.GET("/project/name/:project_name/state/global", middlewares.TokenTypeMiddleware([]string{"user"}), uibuilderController.GetGlobalStates())

	// uicomponent router
	uibuilder.POST("/project/:project_tag/component", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), uiComponentController.UpsertComponent(marketplaceService))
	uibuilder.DELETE("/project/:project_tag/component/:component_name", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), uiComponentController.DeleteComponent())
	uibuilder.GET("/project/:project_tag/component", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), uiComponentController.ListComponents())
	uibuilder.GET("/project/:project_tag/component/:component_name", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), uiComponentController.GetComponent())

	// marketplace router
	marketplace.POST("/item", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.AddItem(DatabaseService, crudServices, uiComponentServi, ProjectService, uiExtensionService))
	marketplace.POST("/upload", marketplaceController.Upload())
	marketplace.PATCH("/item/:id/disable", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.DisableItem())
	marketplace.PATCH("/item/:id/enable", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.EnableItem())
	marketplace.POST("/credential/temporary", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.GetTemporaryCredential())
	marketplace.POST("/function", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.CreateFunction())
	marketplace.PUT("/function", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.UpdateFunction())
	marketplace.POST("/category/list", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.ListCategories())
	marketplace.GET("/function/:function_name", middlewares.TokenTypeMiddleware([]string{"user"}), marketplaceController.GetFunction())
	public.GET("/marketplace/item/:id", marketplaceController.GetItem())
	public.GET("/marketplace", marketplaceController.ListItems())
	// uiExtension router
	uibuilder.POST("/project/:project_tag/extension", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), uiExtensionController.UpsertExtension(marketplaceService))
	uibuilder.DELETE("/project/:project_tag/extension/:extension_name", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), uiExtensionController.DeleteExtension())
	uibuilder.GET("/project/:project_tag/extension", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), uiExtensionController.ListExtensions())
	uibuilder.GET("/project/:project_tag/extension/:extension_name", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), uiExtensionController.GetExtension())

	// uiForm router
	public.POST("/uibuilder/project/:project_tag/page/:page_name/form/:form_id", uiFormController.AddNewResponse(ProjectService, uibuilderService))
	uibuilder.GET("/project/:project_tag/page/:page_name/form", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), uiFormController.GetFormsList(ProjectService, uibuilderService))
	uibuilder.GET("/project/:project_tag/page/:page_name/form/:form_id", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), uiFormController.GetFormResponseListById(ProjectService, uibuilderService))

	// gitIntegration router
	gothic.Store = store
	gitIntegrationCallbackUrl := config.Configs.Endpoints.AoApiLocal + "/git/integration/callback/"
	_, err = oauthPkg.GetGitProviders(gitIntegrationCallbackUrl)
	if err != nil {
		panic(err.Error())
	}
	gitIntegration.GET("/auth/:provider", sessions.Sessions("dotenx_session", store), GitIntegrationController.Authenticate())
	gitIntegration.GET("/callback/:provider", GitIntegrationController.Callback())
	gitIntegration.GET("/provider/:provider/account", middlewares.TokenTypeMiddleware([]string{"user"}), GitIntegrationController.ListIntegrations())
	gitIntegration.POST("/provider/:provider/repository", middlewares.TokenTypeMiddleware([]string{"user"}), GitIntegrationController.ListRepositories())
	gitIntegration.POST("/provider/:provider/branch", middlewares.TokenTypeMiddleware([]string{"user"}), GitIntegrationController.ListBranches())
	gitIntegration.POST("/provider/:provider/export", middlewares.TokenTypeMiddleware([]string{"user"}), GitIntegrationController.ExportProject(marketplaceService, ProjectService, DatabaseService, crudServices))
	gitIntegration.POST("/provider/:provider/import", middlewares.TokenTypeMiddleware([]string{"user"}), GitIntegrationController.ImportProject(marketplaceService, ProjectService, DatabaseService, crudServices, uibuilderService))

	// ecommerce router (just for projects with 'ecommerce' type)
	ecommerce.POST("/project/:project_tag/product", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), EcommerceController.CreateProduct())
	ecommerce.PUT("/project/:project_tag/product/:product_id", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), EcommerceController.UpdateProduct())
	ecommerce.POST("/project/:project_tag/database/query/predefined", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), EcommerceController.RunPredefinedQueries())
	ecommerce.POST("/project/:project_tag/pipeline/email", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), EcommerceController.CreateEmailPipeline())
	ecommerce.PUT("/project/:project_tag/pipeline/email", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), EcommerceController.UpdateEmailPipeline())
	ecommerce.GET("/project/:project_tag/pipeline/email", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), EcommerceController.GetEmailPipelines())
	ecommerce.GET("/project/:project_tag/pipeline/email/:pipeline_name", middlewares.TokenTypeMiddleware([]string{"user"}), middlewares.ProjectOwnerMiddleware(ProjectService), EcommerceController.GetEmailPipeline())
	ecommerce.GET("/project/:project_tag/product/:product_id/version/:product_version", middlewares.TokenTypeMiddleware([]string{"tp"}), EcommerceController.GetTpUserProduct())
	ecommerce.GET("/project/:project_tag/product", middlewares.TokenTypeMiddleware([]string{"tp"}), EcommerceController.ListTpUserProducts())
	ecommerce.POST("/project/:project_tag/product/:product_id/review", middlewares.TokenTypeMiddleware([]string{"tp"}), EcommerceController.SetTpUserReview())
	ecommerce.GET("/project/:project_tag/product/:product_id/review", middlewares.TokenTypeMiddleware([]string{"tp"}), EcommerceController.GetTpUserReview())
	ecommerce.POST("/project/:project_tag/discount/code", middlewares.TokenTypeMiddleware([]string{"user"}), EcommerceController.CreateDiscountCode())
	ecommerce.GET("/project/:project_tag/discount/code", middlewares.TokenTypeMiddleware([]string{"user"}), EcommerceController.ListDiscountCodes())
	ecommerce.DELETE("/project/:project_tag/discount/code/:discount_code", middlewares.TokenTypeMiddleware([]string{"user"}), EcommerceController.DeleteDiscountCode())
	ecommerce.PUT("/project/:project_tag/discount/code/:discount_code", middlewares.TokenTypeMiddleware([]string{"user"}), EcommerceController.UpdateDiscountCode())
	public.GET("/ecommerce/project/:project_tag/product/:product_id/review", EcommerceController.GetProductReviews())
	public.GET("/ecommerce/project/:project_tag/product/tags", EcommerceController.ListProductTags())
	public.GET("/ecommerce/project/:project_tag/payment/link/stripe", EcommerceController.GetStripePaymentLinkEndpoint())
	public.POST("/ecommerce/project/:project_tag/payment/link", EcommerceController.CreateStripePaymentLink())
	public.POST("/ecommerce/project/:project_tag/order", EcommerceController.CreateOrder())

	// tp users profile router
	profile.GET("/project/:project_tag", middlewares.ProjectOwnerMiddleware(ProjectService), profileController.GetProfile())

	// open AI router
	openai.POST("/chat/completions", middlewares.TokenTypeMiddleware([]string{"user"}), OpenAIController.CreateChatCompletion())
	openai.POST("/ui_component/generations", middlewares.TokenTypeMiddleware([]string{"user"}), OpenAIController.GenerateUiComponent())
	openai.POST("/images/generations", middlewares.TokenTypeMiddleware([]string{"user"}), OpenAIController.CreateImage())

	// go TriggerService.StartChecking(IntegrationStore)
	// go TriggerService.StartScheduller()
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
