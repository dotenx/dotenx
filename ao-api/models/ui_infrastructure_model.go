package models

type UiInfrastructure struct {
	AccountId  string `db:"account_id" json:"-"`
	ProjectTag string `db:"project_tag" json:"-"`
	CdnArn     string `db:"cdn_arn" json:"cdn_arn"`
	CdnDomain  string `db:"cdn_domain" json:"cdn_domain"`
	S3Bucket   string `db:"s3_bucket" json:"s3_bucket"`
}
