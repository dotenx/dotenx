package config

import (
	"fmt"

	"github.com/kelseyhightower/envconfig"
	"github.com/sirupsen/logrus"
)

type (
	Config struct {
		App            App
		Database       Database
		Secrets        Secrets
		Endpoints      Endpoints
		Queue          Queue
		Redis          Redis
		Upload         Upload
		Marketplace    Marketplace
		TaskAndTrigger TaskAndTrigger
		UiBuilder      UiBuilder
	}

	App struct {
		Port                        string `envconfig:"AOA_APP_PORT" default:"3004"`
		CheckTrigger                string `envconfig:"AOA_APP_CHECK_TRIGGER"`
		AccountId                   string `envconfig:"AOA_APP_ACCOUNT_ID"`
		Environment                 string `envconfig:"AOA_APP_ENV"`
		FileSharing                 string `envconfig:"AOA_FILE_DIR"`
		SessionDuration             string `envconfig:"AOA_SESSION_DURATION"`
		AllowedOrigins              string `envconfig:"AOA_APP_ALLOWED_ORIGINS" default:"*"`
		RunLocally                  bool   `envconfig:"AOA_APP_RUN_LOCALLY" default:"true"`
		InteractionBodyKey          string `envconfig:"AOA_INTERACTION_BODY_KEY"`
		LogLevel                    string `envconfig:"AOA_APP_LOG_LEVEL"`
		UiBuilderPublishPath        string `envconfig:"AOA_UI_BUILDER_PUBLISH_PATH"`
		CustomQueryTimeLimit        string `envconfig:"AOA_CUSTOM_QUERY_TIME_LIMIT_IN_MILLISECONDS"`
		ExecutionTaskTimeLimit      int    `envconfig:"AOA_TASK_TIME_LIMIT_IN_SECONDS"`
		ExecutionTriggerRate        string `envconfig:"AOA_EVENT_BRIDGE_SCHEDULER_SCHEDULE_EXPRESSION"`
		DomainRegistrationCheckRate string `envconfig:"AOA_EVENT_BRIDGE_DOMAIN_REGISTRATION_SCHEDULE_EXPRESSION"`
		OpenAiChatModel             string `envconfig:"AOA_OPEN_AI_CHAT_MODEL"`
		UiPageHistoryLimitation     int    `envconfig:"AOA_UI_PAGE_HISTORY_LIMITATION"`
	}

	Queue struct {
		BULL string `envconfig:"AOA_BULL_URL"`
	}

	Endpoints struct {
		AoApi        string `envconfig:"AOA_AO_API_URL"`
		AoApiLocal   string `envconfig:"AOA_AO_API_LOCAL_URL"`
		Core         string `envconfig:"AOA_CORE_API_URL"`
		UI           string `envconfig:"AOA_UI_URL"`
		UILocal      string `envconfig:"AOA_UI_LOCAL_URL"`
		Admin        string `envconfig:"AOA_ADMIN_URL"`
		SendGrid     string `envconfig:"AOA_SENDGRID_URL"`
		SystemSender string `envconfig:"AOA_SYSTEM_SENDER"`
		GoNginx      string `envconfig:"AOA_GO_NGINX_SERVICE_IP"`
	}

	Database struct {
		Host     string `envconfig:"AOA_DATABASE_HOST"`
		Port     int    `envconfig:"AOA_DATABASE_PORT"`
		User     string `envconfig:"AOA_DATABASE_USER"`
		Password string `envconfig:"AOA_DATABASE_PASSWORD"`
		DbName   string `envconfig:"AOA_DATABASE_DBNAME"`
		Extras   string `envconfig:"AOA_DATABASE_EXTRAS"`
		Driver   string `envconfig:"AOA_DATABASE_DRIVER" default:"postgres"`
	}

	Redis struct {
		Host string `envconfig:"AOA_REDIS_HOST"`
		Port int    `envconfig:"AOA_REDIS_PORT"`
	}

	Secrets struct {
		AuthServerJwtSecret          string `envconfig:"AOA_AUTH_SERVER_JWT_SECRET"`
		AppName                      string `envconfig:"AOA_APP_NAME"`
		AppSecret                    string `envconfig:"AOA_APP_SECRET"`
		CookieSecret                 string `envconfig:"AOA_Cookie_SECRET"`
		Encryption                   string `envconfig:"AOA_ENCRYPTION_SECRET"`
		SessionAuthSecret            string `envconfig:"AOA_SESSION_AUTH_SECRET"`
		SessionEncryptSecret         string `envconfig:"AOA_SESSION_ENCRYPT_SECRET"`
		RunnerToken                  string `envconfig:"AOA_RUNNER_TOKEN_SECRET"`
		AwsAccessKeyId               string `envconfig:"AOA_AWS_ACCESS_KEY_ID"`
		AwsSecretAccessKey           string `envconfig:"AOA_AWS_SECRET_ACCESS_KEY"`
		AwsRegion                    string `envconfig:"AOA_AWS_REGION"`
		CodeChallenge                string `envconfig:"AOA_CODE_CHALLENGE"`
		EbayNotifToken               string `envconfig:"AOA_EBAY_NOTIF_TOKEN"`
		SendGridToken                string `envconfig:"AOA_SEND_GRID_TOKEN"`
		MarketPlaceAdminSecret       string `envconfig:"AOA_MARKET_PLACE_ADMIN_SECRET"`
		DeployFunctionRoleArn        string `envconfig:"AOA_DEPLOY_FUNCTION_ROLE_ARN"`
		ImportCsvS3Bucket            string `envconfig:"AOA_IMPORT_CSV_S3_BUCKET"`
		EventSchedulerToken          string `envconfig:"AOA_EVENT_BRIDGE_SCHEDULER_TOKEN"`
		EventSchedulerRoleArn        string `envconfig:"AOA_EVENT_BRIDGE_SCHEDULER_ROLE_ARN"`
		EventSchedulerTargetArn      string `envconfig:"AOA_EVENT_BRIDGE_SCHEDULER_TARGET_ARN"`
		ScheduledTriggersTargetArn   string `envconfig:"AOA_SCHEDULED_TRIGGERS_TARGET_ARN"`
		DomainRegistrationTargetArn  string `envconfig:"AOA_EVENT_BRIDGE_DOMAIN_REGISTRATION_TARGET_ARN"`
		CertificateIssuanceTargetArn string `envconfig:"AOA_EVENT_BRIDGE_CERTIFICATE_ISSUANCE_TARGET_ARN"`
		EventRuleRoleArn             string `envconfig:"AOA_EVENT_BRIDGE_RULE_ROLE_ARN"`
		OpenAiApiKey                 string `envconfig:"AOA_OPEN_AI_API_KEY"`
	}

	Upload struct {
		S3Bucket         string `envconfig:"AOA_UPLOAD_S3_BUCKET"`
		S3ProjectsBucket string `envconfig:"AOA_UPLOAD_S3_PROJECTS_BUCKET"`
		S3LogoBucket     string `envconfig:"AOA_UPLOAD_S3_LOGO_BUCKET"`
		S3Region         string `envconfig:"AOA_UPLOAD_S3_REGION"`
		QuotaKB          string `envconfig:"AOA_UPLOAD_QUOTA_KB"`
		PublicUrl        string `envconfig:"AOA_UPLOAD_PUBLIC_URL"`
		PrivateUrl       string `envconfig:"AOA_UPLOAD_PRIVATE_URL"`
	}
	Marketplace struct {
		S3Bucket    string `envconfig:"AOA_MARKETPLACE_S3_BUCKET"`
		MaxFileSize int    `envconfig:"AOA_MARKETPLACE_MAX_FILE_SIZE"`
	}

	TaskAndTrigger struct {
		S3Bucket      string `envconfig:"AOA_TASKS_AND_TRIGGERS_S3_BUCKET"`
		FrequencyList string `envconfig:"AOA_TRIGGER_FREQUENCY_LIST"`
	}

	UiBuilder struct {
		S3Bucket      string `envconfig:"AOA_UI_BUILDER_S3_BUCKET"`
		ParentAddress string `envconfig:"AOA_UI_BUILDER_PARENT_ADDRESS"`
		HostedZoneId  string `envconfig:"AOA_UI_BUILDER_HOSTED_ZONE_ID"`
	}
)

var Configs Config

// TODO: DO SOMETHING ABOUT THIS. IF this is not run before any other code, it will panic.
func init() {
	err := envconfig.Process("", &Configs)
	fmt.Println(Configs)
	if err != nil {
		logrus.Fatal(err.Error())
	}
}
