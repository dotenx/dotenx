package models

type DatabaseJob struct {
	AccountId               string `json:"account_id"   db:"account_id"`
	ProjectName             string `json:"project_name" db:"project_name"`
	PgDumpUrl               string `json:"pg_dump_url" db:"pg_dump_url"`
	PgDumpStatus            string `json:"pg_dump_status" db:"pg_dump_status"`
	PgDumpUrlExpirationTime int64  `json:"pg_dump_url_expiration_time" db:"pg_dump_url_expiration_time"`
	CsvUrl                  string `json:"csv_url" db:"csv_url"`
	CsvStatus               string `json:"csv_status" db:"csv_status"`
	CsvUrlExpirationTime    int64  `json:"csv_url_expiration_time" db:"csv_url_expiration_time"`
}
