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

//
// 001_create_table_pipelines.sql
//

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
ADD COLUMN IF NOT EXISTS aws_lambda varchar(64);
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

//var dropTasks = `drop table tasks`
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
account_id        varchar(64) NOT NULL,
type              varchar(32) NOT NULL,
name              varchar(32) NOT NULL,
secrets                          JSONB,
UNIQUE (account_id, name)
)
`
var dropTriggers = `DROP TABLE IF EXISTS event_triggers`

var createTableEventTriggers = `
CREATE TABLE IF NOT EXISTS event_triggers (
account_id               varchar(64) NOT NULL,
type                     varchar(64) NOT NULL,
name                     varchar(32) NOT NULL,
integration              varchar(128) NOT NULL,
endpoint                 varchar(128) NOT NULL,
pipeline                 varchar(128) NOT NULL,
credentials									JSONB,
UNIQUE (account_id, name, pipeline)
)
`

var createAuthorState = `
CREATE TABLE IF NOT EXISTS author_state (
author                   varchar(64) NOT NULL,
type                     varchar(64) NOT NULL,
name                     varchar(64) NOT NULL,
used_times               INT NOT NULL,
service                  varchar(128),
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

var createUserProviderTable = `
CREATE TABLE IF NOT EXISTS user_provider (
account_id        varchar(64) NOT NULL,
name              varchar(64) NOT NULL,
type              varchar(64) NOT NULL,
key               varchar(256) NOT NULL,
secret            varchar(256) NOT NULL,
direct_url        text,
scopes            text[],
front_end_url     text,
tag               varchar(32) NOT NULL,
UNIQUE (account_id, name)
)
`

var addProviderFieldToIntegrations = `
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS provider varchar(64);
`

var createTableProjects = `
CREATE TABLE IF NOT EXISTS projects (
id                           SERIAL PRIMARY KEY,
name                         VARCHAR(128),
account_id                   VARCHAR(64),
description                  VARCHAR(128),
tag                          varchar(32) NOT NULL,
UNIQUE (account_id, name)
)
`

// TODO: ^ Add a migration for making the tag column unique

var addTpAccountIdFieldToIntegrations = `
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS tp_account_id varchar(64);
`

var createTableObjectstore = `
CREATE TABLE IF NOT EXISTS object_store (
key       									varchar(256) NOT NULL,
account_id  								varchar(64) NOT NULL,
tpaccount_id								varchar(64),
project_tag									varchar(32) NOT NULL,
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
name       									varchar(64) NOT NULL,
account_id  								varchar(64) NOT NULL,
project_tag									varchar(32) NOT NULL,
content        							JSONB NOT NULL,
status											varchar(16) CHECK(status IN ('published', 'modified')) DEFAULT 'modified',
UNIQUE (account_id, name, project_tag)
)
`

var createTableProjectDomain = `
CREATE TABLE IF NOT EXISTS project_domain (
internal_domain       			varchar(64) NOT NULL,
external_domain       			varchar(64) NOT NULL,
hosted_zone_id							varchar(64),
ns_records									VARCHAR [] DEFAULT array[]::varchar[] NOT NULL,
tls_arn											varchar DEFAULT '',
account_id  								varchar(64) NOT NULL,
project_tag									varchar(32) NOT NULL,
UNIQUE (account_id, project_tag)
)
`

var createTableProjectUIInfrastructure = `
CREATE TABLE IF NOT EXISTS project_ui_infrastructure (
account_id  								varchar(64) NOT NULL,
project_tag									varchar(32) NOT NULL,
cdn_arn											varchar(64) DEFAULT '',
cdn_domain									varchar(64) DEFAULT '',
s3_bucket										varchar(64) DEFAULT '',
UNIQUE (account_id, project_tag)
)
`

var createTableMarketplaceItems = `
CREATE TABLE IF NOT EXISTS marketplace_items (
id                          	SERIAL PRIMARY KEY,
creator_account_id  					varchar(64) NOT NULL,
item_type											varchar(32) NOT NULL,
category											varchar(64) DEFAULT '',
title													varchar DEFAULT '',
short_description							varchar DEFAULT '',
description										varchar DEFAULT '',
price 												int DEFAULT 0,
features        							JSON,
image_url 										varchar,
enabled												BOOLEAN DEFAULT TRUE,
created_at 										timestamp,
updated_at 										timestamp
)
`
