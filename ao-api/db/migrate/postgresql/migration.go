package postgresql

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

var migrations = []struct {
	name string
	stmt string
}{
	{
		name: "enable-UUID-extension",
		stmt: enableUUIDExtension,
	},
	{
		name: "create-table-pipelines",
		stmt: createTablePipelines,
	},
	{
		name: "create-table-task-status",
		stmt: createTableTaskStatus,
	},
	{
		name: "create-table-tasks2",
		stmt: createTableTasks,
	},
	{
		name: "add-aws-lambda-field-to-tasks",
		stmt: addAwsLambdaFieldToTasks,
	},
	{
		name: "create-table-task-preconditions",
		stmt: createTableTaskPreconditions,
	},
	{
		name: "create_index_task_preconditions_preconditions",
		stmt: createIndexTaskPreconditionsPreconditions,
	},
	{
		name: "create_index_task_preconditions_tasks",
		stmt: createIndexTaskPreconditionsTasks,
	},
	{
		name: "create-table-executions",
		stmt: createTableExecutions,
	},
	{
		name: "create-table-executions-status",
		stmt: createTableExecutionsStatus,
	},
	{
		name: "create-table-executions-result2",
		stmt: createTableExecutionsResult,
	},
	{
		name: "drop-table-integrations2",
		stmt: dropIntegrations,
	},
	{
		name: "create-table-integrations5",
		stmt: createTableIntegrations,
	},
	{
		name: "drop-table-event_triggers4",
		stmt: dropTriggers,
	},
	{
		name: "create-table-event_triggers4",
		stmt: createTableEventTriggers,
	},
	{
		name: "create-table-author_state",
		stmt: createAuthorState,
	},
	{
		name: "add-has-refresh-token-field",
		stmt: addHasRefreshTokenField,
	},
	{
		name: "add-is-active-field",
		stmt: addIsActive,
	},
	{
		name: "update-is-active-field",
		stmt: updateIsActive,
	},
	{
		name: "update-nill-is-active-field",
		stmt: updateNillIsActive,
	},
	{
		name: "add-is-template-field",
		stmt: addIsTemplate,
	},
	{
		name: "update-is-template-field",
		stmt: updateIsTemplate,
	},
	{
		name: "update-nill-is-template-field",
		stmt: updateNillIsTemplate,
	},
	{
		name: "add-is-Interaction-field",
		stmt: addIsInteraction,
	},
	{
		name: "update-is-Interaction-field",
		stmt: updateIsInteraction,
	},
	{
		name: "update-nill-is-Interaction-field",
		stmt: updateNillIsInteraction,
	},
	{
		name: "add-execution-time",
		stmt: addExectuionTime,
	},
	{
		name: "create-user-provider-table",
		stmt: createUserProviderTable,
	},
	{
		name: "add-provider-field-to-integrations",
		stmt: addProviderFieldToIntegrations,
	},
	{
		name: "create-table-projects",
		stmt: createTableProjects,
	},
	{
		name: "add-tp-account-id-field-to-integrations",
		stmt: addTpAccountIdFieldToIntegrations,
	},
	{
		name: "remove-tpAccountId-field2",
		stmt: removeTpAccountId,
	},
	{
		name: "add-tpAccountId-field2",
		stmt: addTpAccountId,
	},
	{
		name: "update-tpAccountId-field",
		stmt: updateTpAccountId,
	},
	{
		name: "update-nill-tpAccountId-field",
		stmt: updateNillTpAccountId,
	},
	{
		name: "create-table-objectstore",
		stmt: createTableObjectstore,
	},
	{
		name: "add-column-access-to-object-store-table",
		stmt: addColumnAccessToObjectStoreTable,
	},
	{
		name: "add-column-url-to-object-store-table",
		stmt: addColumnUrlToObjectStoreTable,
	},
	{
		name: "add-column-is-public-to-pipelines-table",
		stmt: addColumnIsPublicToPipelinesTable,
	},
	{
		name: "add-column-user-groups-to-pipelines-table",
		stmt: addColumnUserGroupsToPipelinesTable,
	},
	{
		name: "create-table-ui-pages",
		stmt: createTableUIPages,
	},
	{
		name: "create-table-project-domain",
		stmt: createTableProjectDomain,
	},
	{
		name: "create-table-project-ui-infrastructure",
		stmt: createTableProjectUIInfrastructure,
	},
	{
		name: "create-table-marketplace-items",
		stmt: createTableMarketplaceItems,
	},
	{
		name: "add-project-name-to-pipelines",
		stmt: addProjectName,
	},
	{
		name: "update-project-name",
		stmt: updateProjectName,
	},
	{
		name: "update-nill-project-name",
		stmt: updateNillProjectName,
	},
	{
		name: "drop-constaint-uniqueness-pipelines",
		stmt: dropUniqueConstraintForPipelines,
	},
	{
		name: "create-new-constaint-uniqueness-pipelines",
		stmt: createNewUniqueConstraintForPipelines,
	},
	{
		name: "add-project-name-to-triggers",
		stmt: addProjectNameForTriggers,
	},
	{
		name: "update-project-name-for-triggers",
		stmt: updateProjectNameForTrigger,
	},
	{
		name: "update-nill-project-name-for-triggers",
		stmt: updateNillProjectNameForTriggers,
	},
	{
		name: "drop-constaint-uniqueness-Triggers",
		stmt: dropUniqueConstraintForTriggers,
	},
	{
		name: "create-new-constaint-uniqueness-Triggers",
		stmt: createNewUniqueConstraintForTriggers,
	},
	{
		name: "add-has-database-field-to-projects-table",
		stmt: addHasDatabaseFieldToProjectsTable,
	},
	{
		name: "add-column-user-groups-to-table-objectstore",
		stmt: addColumnUserGroupsToTableObjectstore,
	},
	{
		name: "add-column-is-public-to-table-objectstore",
		stmt: addColumnIsPublicToTableObjectstore,
	},
	{
		name: "create-table-ui_custom_components",
		stmt: createTableUICustomComponents,
	},
	{
		name: "add-Parent-To-Pipelines",
		stmt: addParentToPipelines,
	},
	{
		name: "set-default-Parent-To-Pipelines",
		stmt: setDefaultParent,
	},
	{
		name: "add-Created-for-To-Pipelines",
		stmt: addCreatedForToPipelines,
	},
	{
		name: "set-default-Created-for-To-Pipelines",
		stmt: setDefaultCreatedFor,
	},
	{
		name: "create-table-function",
		stmt: createTableFunction,
	},
	{
		name: "create-trigger-checker-table",
		stmt: createTriggerCheckerTable,
	},
	{
		name: "create-ui-builder-global-states-table",
		stmt: createUIBuilderGlobalStatesTable,
	},
	{
		name: "create-database-user-table",
		stmt: createDatabaseUserTableStmt,
	},
	{
		name: "add-preview-url-field-to-marketplace-items-table",
		stmt: addPreviewUrlFieldToMarketplaceItemsTable,
	},
	{
		name: "create_database_jobs_table",
		stmt: createDatabaseJobsTable,
	},
	{
		name: "add-pg-dump-status-field-to-database-jobs-table",
		stmt: addPgDumpStatusFieldToDatabaseJobsTable,
	},
	{
		name: "add-csv-url-field-to-database-jobs-table",
		stmt: addCsvUrlFieldToDatabaseJobsTable,
	},
	{
		name: "add-csv-url-expiration-time-field-to-database-jobs-table",
		stmt: addCsvUrlExpirationTimeFieldToDatabaseJobsTable,
	},
	{
		name: "add-csv-status-field-to-database-jobs-table",
		stmt: addCsvStatusFieldToDatabaseJobsTable,
	},
	{
		name: "create-git-integration-table",
		stmt: createGitIntegrationTable,
	},
	{
		name: "create-ui-extension-table",
		stmt: createUIExtensionTable,
	},
	{
		name: "add-last-published-at-field-to-ui-pages-table",
		stmt: addLastPublishedAtFieldToUIPagesTable,
	},
	{
		name: "add-last-preview-published-at-field-to-ui-pages-table",
		stmt: addLastPreviewPublishedAtFieldToUIPagesTable,
	},
	{
		name: "add-type-field-to-projects-table",
		stmt: addTypeFieldToProjectsTable,
	},
	{
		name: "add-theme-field-to-projects-table",
		stmt: addThemeFieldToProjectsTable,
	},
	{
		name: "create-ui-form-table",
		stmt: createUIFormTable,
	},
	{
		name: "add-display-name-field-to-object-store-table",
		stmt: addDisplayNameFieldToObjectStoreTable,
	},
	{
		name: "add-infrastructure-fields-to-project-domain-table",
		stmt: addInfrastructureFieldsToProjectDomainTable,
	},
	{
		name: "add-tls-validation-fields-to-project-domain-table",
		stmt: addTLSValidationFieldsToProjectDomainTable,
	},
	{
		name: "add-project-name-field-to-integrations-table",
		stmt: addProjectNameFieldToIntegrationsTable,
	},
	{
		name: "add-project-type-field-to-marketplace-items-table",
		stmt: addProjectTypeFieldToMarketplaceItemsTable,
	},
	{
		name: "add-theme-field-to-marketplace-items-table",
		stmt: addThemeFieldToMarketplaceItemsTable,
	},
	{
		name: "add-name-field-to-ui-forms-table",
		stmt: addNameFieldToUIFormsTable,
	},
	{
		name: "add-submitted-at-field-to-ui-forms-table",
		stmt: addSubmittedAtFieldToUIFormsTable,
	},
	{
		name: "create-ui-pages-history-table",
		stmt: createUIPagesHistoryTable,
	},
	{
		name: "add-ai-website-configuration-field-to-projects-table",
		stmt: addAIWebsiteConfigurationFieldToProjectsTable,
	},
}

// Migrate performs the database migration. If the migration fails
// and error is returned.
func Migrate(db *sql.DB) error {
	if err := createMigrationHistoryTable(db); err != nil {
		return err
	}
	completed, err := selectCompletedMigrations(db)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	for _, migration := range migrations {
		log.Print(migration.name)
		if _, ok := completed[migration.name]; ok {
			log.Println(" skipped")
			continue
		}

		log.Println(" executing")
		if _, err := db.Exec(migration.stmt); err != nil {
			return err
		}
		if err := addMigration(db, migration.name); err != nil {
			return err
		}

	}
	return nil
}

func createMigrationHistoryTable(db *sql.DB) error {
	_, err := db.Exec(migrationTableCreate)
	return err
}

func addMigration(db *sql.DB, name string) error {
	_, err := db.Exec(migrationInsert, name)
	return err
}

func selectCompletedMigrations(db *sql.DB) (map[string]struct{}, error) {
	migrations := map[string]struct{}{}
	rows, err := db.Query(migrationSelect)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		migrations[name] = struct{}{}
	}
	return migrations, nil
}

//
// migration table ddl and sql
//

var migrationTableCreate = `
CREATE TABLE IF NOT EXISTS migration_history (
name VARCHAR(255),
UNIQUE(name)
)
`

var migrationInsert = `
INSERT INTO migration_history (name) VALUES ($1)
`

var migrationSelect = `
SELECT name FROM migration_history
`

var enableUUIDExtension = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
`

var createTablePipelines = `
CREATE TABLE IF NOT EXISTS pipelines (
id 												SERIAL PRIMARY KEY,
name											VARCHAR(128),
account_id         			  VARCHAR(64),
endpoint 							    uuid DEFAULT uuid_generate_v4(),
is_active                 BOOLEAN,
is_template               BOOLEAN,
is_interaction            BOOLEAN,
UNIQUE (name, account_id)
)
`

var createTableTaskStatus = `
CREATE TABLE IF NOT EXISTS task_status (
name											VARCHAR(16) PRIMARY KEY
)
` // Seeded

var createTableTasks = `
CREATE TABLE IF NOT EXISTS tasks (
id												SERIAL PRIMARY KEY,
name											VARCHAR(64),
task_type									VARCHAR(64),
integration					      VARCHAR(128),
account_id         			  VARCHAR(64),
description					      VARCHAR(128),
pipeline_id			          INT NOT NULL,
body											JSONB,
timeout                   INT NOT NULL default 30,
FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE
)
`

var addAwsLambdaFieldToTasks = `
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS aws_lambda VARCHAR(64);
`

var createTableTaskPreconditions = `
CREATE TABLE IF NOT EXISTS task_preconditions (
task_id										INT NOT NULL,
precondition_id					  INT NOT NULL,
status										VARCHAR(16) NOT NULL,
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE ,
FOREIGN KEY (precondition_id) REFERENCES tasks(id) ON DELETE CASCADE ,
FOREIGN KEY (status) REFERENCES task_status(name)
)
`

var createIndexTaskPreconditionsPreconditions = `
CREATE INDEX IF NOT EXISTS task_preconditions_preconditions ON task_preconditions (precondition_id, status)
`

var createIndexTaskPreconditionsTasks = `
CREATE INDEX IF NOT EXISTS task_preconditions_tasks ON task_preconditions (task_id)
`

var createTableExecutions = `
CREATE TABLE IF NOT EXISTS executions (
id												SERIAL PRIMARY KEY,
pipeline_id				        INT NOT NULL,
started_at								TIMESTAMP WITH TIME ZONE,
initial_data							JSONB,
FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE 
)
`
var removeTpAccountId = `ALTER TABLE executions
DROP COLUMN IF EXISTS tp_account_id;`

var addTpAccountId = `ALTER TABLE executions
ADD COLUMN IF NOT EXISTS tp_account_id varchar(64);`

var updateTpAccountId = `
ALTER TABLE executions
ALTER COLUMN tp_account_id
SET DEFAULT 'no third party user';`

var updateNillTpAccountId = `
UPDATE executions
SET tp_account_id= 'no third party user';`

var addExectuionTime = `ALTER TABLE executions
ADD COLUMN IF NOT EXISTS execution_time INT DEFAULT 0;`

// var dropTasks = `drop table tasks`
var createTableExecutionsStatus = `
CREATE TABLE IF NOT EXISTS executions_status (
execution_id							INT NOT NULL,
task_id										INT NOT NULL,
status										VARCHAR(16),
FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE ,
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
FOREIGN KEY (status) REFERENCES task_status(name)
)
`
var createTableExecutionsResult = `
CREATE TABLE IF NOT EXISTS executions_result (
execution_id							INT NOT NULL,
task_id										INT NOT NULL,
status										VARCHAR(16),
return_value              JSONB,
log                       VARCHAR(10485760),
FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE ,
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
FOREIGN KEY (status) REFERENCES task_status(name)
)`

var dropIntegrations = ` DROP TABLE IF EXISTS integrations
`

var createTableIntegrations = `
CREATE TABLE IF NOT EXISTS integrations (
account_id        VARCHAR(64) NOT NULL,
type              VARCHAR(32) NOT NULL,
name              VARCHAR(32) NOT NULL,
secrets                          JSONB,
UNIQUE (account_id, name)
)
`
var dropTriggers = `DROP TABLE IF EXISTS event_triggers`

// todo: remove pipeline and project_name from event_triggers
var createTableEventTriggers = `
CREATE TABLE IF NOT EXISTS event_triggers (
account_id               VARCHAR(64) NOT NULL,
type                     VARCHAR(64) NOT NULL,
name                     VARCHAR(32) NOT NULL,
integration              VARCHAR(128) NOT NULL,
endpoint                 VARCHAR(128) NOT NULL,
pipeline                 VARCHAR(128) NOT NULL,
credentials									JSONB,
project_name 		   VARCHAR(128),
UNIQUE (account_id, name, pipeline)
)
`

var createAuthorState = `
CREATE TABLE IF NOT EXISTS author_state (
author                   VARCHAR(64) NOT NULL,
type                     VARCHAR(64) NOT NULL,
name                     VARCHAR(64) NOT NULL,
used_times               INT NOT NULL,
service                  VARCHAR(128),
UNIQUE (author, type, name)
)
`

var addHasRefreshTokenField = `
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS hasRefreshToken BOOLEAN
`
var addIsActive = `ALTER TABLE pipelines
ADD COLUMN IF NOT EXISTS is_active BOOLEAN;`

var addIsTemplate = `ALTER TABLE pipelines
ADD COLUMN IF NOT EXISTS is_template BOOLEAN;`

var updateIsActive = `
ALTER TABLE pipelines
ALTER COLUMN is_active
SET DEFAULT FALSE;`

var updateIsTemplate = `
ALTER TABLE pipelines
ALTER COLUMN is_template
SET DEFAULT FALSE;`

var updateNillIsActive = `
UPDATE pipelines
SET is_active=FALSE;`

var updateNillIsTemplate = `
UPDATE pipelines
SET is_template=FALSE;`

var addIsInteraction = `ALTER TABLE pipelines
ADD COLUMN IF NOT EXISTS is_interaction BOOLEAN;`

var updateIsInteraction = `
ALTER TABLE pipelines
ALTER COLUMN is_interaction
SET DEFAULT FALSE;`

var updateNillIsInteraction = `
UPDATE pipelines
SET is_interaction=FALSE;`

var addProjectName = `ALTER TABLE pipelines
ADD COLUMN IF NOT EXISTS project_name VARCHAR(128);`

var updateProjectName = `
ALTER TABLE pipelines
ALTER COLUMN project_name
SET DEFAULT 'automation_studio';`

// todo: remove this
var updateNillProjectName = `
UPDATE pipelines
SET project_name='AUTOMATION_STUDIO';`

var addProjectNameForTriggers = `ALTER TABLE event_triggers
ADD COLUMN IF NOT EXISTS project_name VARCHAR(128);`

// todo: update this to use AUTOMATION_STUDIO
var updateProjectNameForTrigger = `
ALTER TABLE event_triggers
ALTER COLUMN project_name
SET DEFAULT 'AUTOMATION_STUDIO';`

var updateNillProjectNameForTriggers = `
UPDATE event_triggers
SET project_name='AUTOMATION_STUDIO';`

var createUserProviderTable = `
CREATE TABLE IF NOT EXISTS user_provider (
account_id        VARCHAR(64) NOT NULL,
name              VARCHAR(64) NOT NULL,
type              VARCHAR(64) NOT NULL,
key               VARCHAR(256) NOT NULL,
secret            VARCHAR(256) NOT NULL,
direct_url        TEXT,
scopes            TEXT[],
front_end_url     TEXT,
tag               VARCHAR(32) NOT NULL,
UNIQUE (account_id, name)
)
`

var addProviderFieldToIntegrations = `
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS provider VARCHAR(64);
`

var createTableProjects = `
CREATE TABLE IF NOT EXISTS projects (
id                           SERIAL PRIMARY KEY,
name                         VARCHAR(128),
account_id                   VARCHAR(64),
description                  VARCHAR(128),
tag                          VARCHAR(32) NOT NULL,
UNIQUE (account_id, name)
)
`

// TODO: ^ Add a migration for making the tag column unique

var addTpAccountIdFieldToIntegrations = `
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS tp_account_id VARCHAR(64);
`

var createTableObjectstore = `
CREATE TABLE IF NOT EXISTS object_store (
key       									VARCHAR(256) NOT NULL,
account_id  								VARCHAR(64) NOT NULL,
tpaccount_id								VARCHAR(64),
project_tag									VARCHAR(32) NOT NULL,
size        								INT NOT NULL,
UNIQUE (account_id, tpaccount_id, project_tag, key)
)
`

var addColumnAccessToObjectStoreTable = `
ALTER TABLE object_store
ADD COLUMN IF NOT EXISTS access varchar(64);
`

var addColumnUrlToObjectStoreTable = `
ALTER TABLE object_store
ADD COLUMN IF NOT EXISTS url varchar;
`

var addColumnIsPublicToPipelinesTable = `
ALTER TABLE pipelines
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;
`

var addColumnUserGroupsToPipelinesTable = `
ALTER TABLE pipelines
ADD COLUMN IF NOT EXISTS user_groups VARCHAR [] NOT NULL DEFAULT '{}';
`

var createTableUIPages = `
CREATE TABLE IF NOT EXISTS ui_pages (
name       									VARCHAR(64) NOT NULL,
account_id  								VARCHAR(64) NOT NULL,
project_tag									VARCHAR(32) NOT NULL,
content        							JSONB NOT NULL,
status											VARCHAR(16) CHECK(status IN ('published', 'modified')) DEFAULT 'modified',
UNIQUE (account_id, name, project_tag)
)
`

var createTableProjectDomain = `
CREATE TABLE IF NOT EXISTS project_domain (
internal_domain       			VARCHAR(64) NOT NULL,
external_domain       			VARCHAR(64) NOT NULL,
hosted_zone_id							VARCHAR(64),
ns_records									VARCHAR [] DEFAULT array[]::VARCHAR[] NOT NULL,
tls_arn											VARCHAR DEFAULT '',
account_id  								VARCHAR(64) NOT NULL,
project_tag									VARCHAR(32) NOT NULL,
UNIQUE (account_id, project_tag)
)
`

var createTableProjectUIInfrastructure = `
CREATE TABLE IF NOT EXISTS project_ui_infrastructure (
account_id  								VARCHAR(64) NOT NULL,
project_tag									VARCHAR(32) NOT NULL,
cdn_arn											VARCHAR(64) DEFAULT '',
cdn_domain									VARCHAR(64) DEFAULT '',
s3_bucket										VARCHAR(64) DEFAULT '',
UNIQUE (account_id, project_tag)
)
`

var createTableMarketplaceItems = `
CREATE TABLE IF NOT EXISTS marketplace_items (
id                          	SERIAL PRIMARY KEY,
creator_account_id  					VARCHAR(64) NOT NULL,
item_type											VARCHAR(32) NOT NULL,
category											VARCHAR(64) DEFAULT '',
title													VARCHAR DEFAULT '',
short_description							VARCHAR DEFAULT '',
description										VARCHAR DEFAULT '',
price 												INT DEFAULT 0,
features        							JSON,
image_url 										VARCHAR,
enabled												BOOLEAN DEFAULT FALSE,
created_at 										TIMESTAMP,
updated_at 										TIMESTAMP,
project_name									VARCHAR(64) NOT NULL,
s3_key												VARCHAR NOT NULL
)
`

var dropUniqueConstraintForPipelines = `ALTER TABLE pipelines DROP CONSTRAINT IF EXISTS pipelines_name_account_id_key;`
var createNewUniqueConstraintForPipelines = `ALTER TABLE pipelines ADD CONSTRAINT unique_project_automation UNIQUE(name, account_id, project_name);`

var dropUniqueConstraintForTriggers = `ALTER TABLE event_triggers DROP CONSTRAINT event_triggers_account_id_name_pipeline_key;`
var createNewUniqueConstraintForTriggers = `ALTER TABLE event_triggers ADD CONSTRAINT unique_project_triggers UNIQUE(account_id, name, pipeline, project_name);`

var dropUniqueConstraintForEventTriggers = `ALTER TABLE event_triggers DROP CONSTRAINT unique_project_triggers;`

var createNewUniqueConstraintForTriggersAgain = `ALTER TABLE event_triggers ADD CONSTRAINT unique_project_triggers UNIQUE(name, endpoint);`
var addHasDatabaseFieldToProjectsTable = `
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS has_database BOOLEAN NOT NULL DEFAULT FALSE;
`

var addColumnUserGroupsToTableObjectstore = `
ALTER TABLE object_store
ADD COLUMN IF NOT EXISTS user_groups VARCHAR [] NOT NULL DEFAULT '{}';
`

var addColumnIsPublicToTableObjectstore = `
ALTER TABLE object_store
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;
`

var createTableUICustomComponents = `
CREATE TABLE IF NOT EXISTS ui_custom_components (
name       									VARCHAR(64) NOT NULL,
account_id  								VARCHAR(64) NOT NULL,
project_tag									VARCHAR(32) NOT NULL,
content        								JSONB NOT NULL,
status										VARCHAR(16) CHECK(status IN ('published', 'modified')) DEFAULT 'modified',
category									VARCHAR(64) DEFAULT 'custom_component',
UNIQUE (account_id, name, project_tag)
)
`

var addParentToPipelines = `
ALTER TABLE pipelines
ADD COLUMN IF NOT EXISTS parent_id INT;
`

var setDefaultParent = `update pipelines set parent_id = 0 where parent_id is null;`

var addCreatedForToPipelines = `
ALTER TABLE pipelines
ADD COLUMN IF NOT EXISTS created_for VARCHAR(64);
`
var setDefaultCreatedFor = `update pipelines set created_for = '' where created_for is null;`

var createTableFunction = `
CREATE TABLE IF NOT EXISTS function (
name                       VARCHAR(128) PRIMARY KEY,
account_id                 VARCHAR(64) NOT NULL,
enabled                    BOOLEAN DEFAULT FALSE,
definition_file            VARCHAR(64),
type                       VARCHAR(64) NOT NULL
)
`

var createTriggerCheckerTable = `
CREATE TABLE IF NOT EXISTS trigger_checker (
account_id                 VARCHAR(64) NOT NULL,
project_name 		       VARCHAR(128) NOT NULL,
pipeline_name              VARCHAR(128) NOT NULL,
trigger_name               VARCHAR(64) NOT NULL,
list                       JSONB
)
`

var createUIBuilderGlobalStatesTable = `
CREATE TABLE IF NOT EXISTS ui_builder_global_states (
account_id                 VARCHAR(64) NOT NULL,
project_name 		       VARCHAR(128) NOT NULL,
states                     VARCHAR [] NOT NULL DEFAULT '{}',
UNIQUE (account_id, project_name)
)
`

var createDatabaseUserTableStmt = `
CREATE TABLE IF NOT EXISTS database_user (
account_id                 VARCHAR(64) NOT NULL,
project_name 		       VARCHAR(128) NOT NULL,
username                   VARCHAR(128) NOT NULL,
password                   VARCHAR(128) NOT NULL,
UNIQUE (account_id, project_name)
)
`

var addPreviewUrlFieldToMarketplaceItemsTable = `
ALTER TABLE marketplace_items
ADD COLUMN IF NOT EXISTS preview_url VARCHAR DEFAULT '';
`

var createDatabaseJobsTable = `
CREATE TABLE IF NOT EXISTS database_jobs (
account_id                   VARCHAR(64) NOT NULL,
project_name 		         VARCHAR(128) NOT NULL,
pg_dump_url                  VARCHAR DEFAULT '',
pg_dump_url_expiration_time  BIGINT DEFAULT 0,
UNIQUE (account_id, project_name)
)
`

var addPgDumpStatusFieldToDatabaseJobsTable = `
ALTER TABLE database_jobs
ADD COLUMN IF NOT EXISTS pg_dump_status VARCHAR DEFAULT '';
`

var addCsvUrlFieldToDatabaseJobsTable = `
ALTER TABLE database_jobs
ADD COLUMN IF NOT EXISTS csv_url VARCHAR DEFAULT '';
`

var addCsvUrlExpirationTimeFieldToDatabaseJobsTable = `
ALTER TABLE database_jobs
ADD COLUMN IF NOT EXISTS csv_url_expiration_time BIGINT DEFAULT 0;
`

var addCsvStatusFieldToDatabaseJobsTable = `
ALTER TABLE database_jobs
ADD COLUMN IF NOT EXISTS csv_status VARCHAR DEFAULT '';
`

var createGitIntegrationTable = `
CREATE TABLE IF NOT EXISTS git_integration (
account_id        VARCHAR(64) NOT NULL,
git_account_id    VARCHAR(64) NOT NULL,
git_username      VARCHAR NOT NULL,
provider          VARCHAR(32) NOT NULL,
secrets           JSONB,
has_refresh_token BOOLEAN DEFAULT FALSE,
UNIQUE (account_id, git_account_id, provider)
)
`

var createUIExtensionTable = `
CREATE TABLE IF NOT EXISTS ui_extension (
name                     VARCHAR(64) NOT NULL,
account_id               VARCHAR(64) NOT NULL,
project_tag              VARCHAR(32) NOT NULL,
content                  JSONB NOT NULL,
status                   VARCHAR(16) CHECK(status IN ('published', 'modified')) DEFAULT 'modified',
category                 VARCHAR(64) DEFAULT 'custom_component',
UNIQUE (account_id, name, project_tag)
)
`

var addLastPublishedAtFieldToUIPagesTable = `
ALTER TABLE ui_pages
ADD COLUMN IF NOT EXISTS last_published_at TIMESTAMP DEFAULT '1970-01-01T00:00:00Z';
`

var addLastPreviewPublishedAtFieldToUIPagesTable = `
ALTER TABLE ui_pages
ADD COLUMN IF NOT EXISTS last_preview_published_at TIMESTAMP DEFAULT '1970-01-01T00:00:00Z';
`

var addTypeFieldToProjectsTable = `
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS type VARCHAR(64) NOT NULL DEFAULT 'freestyle';
`

var addThemeFieldToProjectsTable = `
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS theme VARCHAR(64) DEFAULT '';
`

var createUIFormTable = `
CREATE TABLE IF NOT EXISTS ui_forms (
project_tag              VARCHAR(32) NOT NULL,
page_name                VARCHAR(64) NOT NULL,
form_id                  VARCHAR(64) NOT NULL,
response                 JSONB NOT NULL
)
`

var addDisplayNameFieldToObjectStoreTable = `
ALTER TABLE object_store
ADD COLUMN IF NOT EXISTS display_name varchar(256) DEFAULT '';
`

var addInfrastructureFieldsToProjectDomainTable = `
ALTER TABLE project_domain
ADD COLUMN IF NOT EXISTS cdn_arn VARCHAR(64) DEFAULT '',
ADD COLUMN IF NOT EXISTS cdn_domain VARCHAR(64) DEFAULT '',
ADD COLUMN IF NOT EXISTS s3_bucket VARCHAR(64) DEFAULT '',
DROP COLUMN IF EXISTS hosted_zone_id,
DROP COLUMN IF EXISTS ns_records;
`

var addTLSValidationFieldsToProjectDomainTable = `
ALTER TABLE project_domain
ADD COLUMN IF NOT EXISTS tls_validation_record_name VARCHAR(256) DEFAULT '',
ADD COLUMN IF NOT EXISTS tls_validation_record_value VARCHAR(256) DEFAULT '';
`

var addProjectNameFieldToIntegrationsTable = `
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS project_name VARCHAR(128) DEFAULT '';
`

var addProjectTypeFieldToMarketplaceItemsTable = `
ALTER TABLE marketplace_items
ADD COLUMN IF NOT EXISTS project_type VARCHAR DEFAULT '';
`

var addThemeFieldToMarketplaceItemsTable = `
ALTER TABLE marketplace_items
ADD COLUMN IF NOT EXISTS theme VARCHAR DEFAULT '';
`

var addNameFieldToUIFormsTable = `
ALTER TABLE ui_forms
ADD COLUMN IF NOT EXISTS name VARCHAR(128) DEFAULT '';
`

var addSubmittedAtFieldToUIFormsTable = `
ALTER TABLE ui_forms
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT '1970-01-01T00:00:00Z';
`

var createUIPagesHistoryTable = `
CREATE TABLE IF NOT EXISTS ui_pages_history (
name                          VARCHAR(64) NOT NULL,
account_id                    VARCHAR(64) NOT NULL,
project_tag                   VARCHAR(32) NOT NULL,
content                       JSONB NOT NULL,
saved_at                      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`

var addAIWebsiteConfigurationFieldToProjectsTable = `
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS ai_website_configuration JSONB NOT NULL DEFAULT '{}'::jsonb;
`
