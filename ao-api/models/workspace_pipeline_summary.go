package models

import "database/sql"

type WorkspacePipelineSummary struct {
	Name          string
	ActiveVersion sql.NullInt64 `db:"version"`
}

type WorkspaceExecutionSummary struct {
	Id          int    `json:"id"`
	FromVersion string `db:"from_version" json:"fromVersion"`
	Version     string `json:"version"`
	Name        string `json:"name"`
	Type        string `db:"trigger_type" json:"type"`
	StartedAt   string `db:"started_at" json:"startedAt"`
}

type WorkspacePipelineSummaryDto struct {
	Name          string
	ActiveVersion int64
}
