package postgresql

import (
	"database/sql"
	"fmt"
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
		name: "create-table-pipeline-versions",
		stmt: createTablePipelineVersions,
	},
	{
		name: "create-table-task-status",
		stmt: createTableTaskStatus,
	},
	{
		name: "create-table-task-types",
		stmt: createTableTaskTypes,
	},
	{
		name: "create-table-tasks",
		stmt: createTableTasks,
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
		name: "create-table-executions-result",
		stmt: createTableExecutionsResult,
	},
	{
		name: "create-table-trigger-types",
		stmt: createTableTriggerTypes,
	},
	{
		name: "create-table-triggers",
		stmt: createTableTriggers,
	},
	{
		name: "create-table-pipeline-activations",
		stmt: createTablePipelineActivations,
	},
	{
		name: "add_column_service_account_to_pipeline_versions",
		stmt: addColumnServiceAccountToPipelineVersions,
	},
	{
		name: "create-table-runner_queue",
		stmt: createTableRunnerQueue,
	},
	{
		name: "create-table-integrations",
		stmt: createTableIntegrations,
	},
	{
		name: "create-table-event_triggers",
		stmt: createTableEventTriggers,
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
		fmt.Print(migration.name)
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
account_id         				VARCHAR(64),
endpoint 									uuid DEFAULT uuid_generate_v4(),
UNIQUE (name, account_id)
)
`
var createTablePipelineVersions = `
CREATE TABLE IF NOT EXISTS pipeline_versions (
id												SERIAL PRIMARY KEY,
pipeline_id 							INT NOT NULL,
version		        				SMALLINT NOT NULL,
from_version       				SMALLINT DEFAULT 0 NOT NULL,
FOREIGN KEY (pipeline_id) REFERENCES pipelines(id),
UNIQUE (pipeline_id, version)
)
`

var createTableTaskStatus = `
CREATE TABLE IF NOT EXISTS task_status (
name											VARCHAR(16) PRIMARY KEY
)
` // Seeded

var createTableTaskTypes = `
CREATE TABLE IF NOT EXISTS task_types (
name											VARCHAR(64) PRIMARY KEY
)
` // Seeded

var createTableTasks = `
CREATE TABLE IF NOT EXISTS tasks (
id												SERIAL PRIMARY KEY,
name											VARCHAR(64),
task_type									VARCHAR(64),
description								VARCHAR(128),
pipeline_version_id				INT NOT NULL,
body											JSONB,
timeout INT NOT NULL default 30,
FOREIGN KEY (pipeline_version_id) REFERENCES pipeline_versions(id),
FOREIGN KEY (task_type) REFERENCES task_types(name)
)
`

var createTableTaskPreconditions = `
CREATE TABLE IF NOT EXISTS task_preconditions (
task_id										INT NOT NULL,
precondition_id						INT NOT NULL,
status										VARCHAR(16) NOT NULL,
FOREIGN KEY (task_id) REFERENCES tasks(id),
FOREIGN KEY (precondition_id) REFERENCES tasks(id),
FOREIGN KEY (status) REFERENCES task_status(name)
)
`

var createIndexTaskPreconditionsPreconditions = `
CREATE INDEX task_preconditions_preconditions ON task_preconditions (precondition_id, status)
`

var createIndexTaskPreconditionsTasks = `
CREATE INDEX task_preconditions_tasks ON task_preconditions (task_id)
`

var createTableExecutions = `
CREATE TABLE IF NOT EXISTS executions (
id												SERIAL PRIMARY KEY,
pipeline_version_id				INT NOT NULL,
started_at								TIMESTAMP WITH TIME ZONE,
initial_data							JSONB,
FOREIGN KEY (pipeline_version_id) REFERENCES pipeline_versions(id)
)
`
var dropTasks = `drop table tasks`
var createTableExecutionsStatus = `
CREATE TABLE IF NOT EXISTS executions_status (
execution_id							INT NOT NULL,
task_id										INT NOT NULL,
status										VARCHAR(16),
FOREIGN KEY (execution_id) REFERENCES executions(id),
FOREIGN KEY (task_id) REFERENCES tasks(id),
FOREIGN KEY (status) REFERENCES task_status(name)
)
`
var createTableExecutionsResult = `
CREATE TABLE IF NOT EXISTS executions_result (
execution_id							INT NOT NULL,
task_id										INT NOT NULL,
status										VARCHAR(16),
return_value                                VARCHAR(10485760),
log                                         VARCHAR(10485760),
FOREIGN KEY (execution_id) REFERENCES executions(id),
FOREIGN KEY (task_id) REFERENCES tasks(id),
FOREIGN KEY (status) REFERENCES task_status(name)
)`

var createTableTriggerTypes = `
CREATE TABLE IF NOT EXISTS trigger_types (
name											VARCHAR(64) PRIMARY KEY
)
` // Seeded

var createTableTriggers = `
CREATE TABLE IF NOT EXISTS triggers (
id												SERIAL PRIMARY KEY,
name											VARCHAR(64),
trigger_type							VARCHAR(64),
pipeline_version_id				INT NOT NULL,
data_bag									JSONB,
FOREIGN KEY (pipeline_version_id) REFERENCES pipeline_versions(id),
FOREIGN KEY (trigger_type) REFERENCES trigger_types(name)
)
`

var createTablePipelineActivations = `
CREATE TABLE IF NOT EXISTS pipeline_activations (
pipeline_id								INT PRIMARY KEY,
activated_version					INT NOT NULL,
last_activation						TIMESTAMP NOT NULL,
FOREIGN KEY (pipeline_id) REFERENCES pipelines(id),
FOREIGN KEY (activated_version) REFERENCES pipeline_versions(id)
)
`
var addColumnServiceAccountToPipelineVersions = `
ALTER TABLE pipeline_versions
ADD COLUMN service_account VARCHAR(64)
`
var createTableRunnerQueue = `CREATE TABLE IF NOT EXISTS runner_queue (
	runner_id varchar(32) PRIMARY KEY,
	account_id varchar(32),
	queue_type varchar(32)
)`

var createTableIntegrations = `
CREATE TABLE IF NOT EXISTS integrations (
account_id        varchar(32) NOT NULL,
type              varchar(32) NOT NULL,
name              varchar(32) NOT NULL,
url               varchar(128),
key               varchar(128),
secret            varchar(128),
access_token            varchar(128),
UNIQUE (account_id, name)
)
`

var createTableEventTriggers = `
CREATE TABLE IF NOT EXISTS event_triggers (
account_id               varchar(32) NOT NULL,
type                     varchar(64) NOT NULL,
name                     varchar(32) NOT NULL,
integration              varchar(128) NOT NULL,
endpoint                 varchar(128) NOT NULL,
FOREIGN KEY (integration) REFERENCES integrations(name),
UNIQUE (account_id, name)
)
`
