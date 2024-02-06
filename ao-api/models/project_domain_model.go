package models

type ProjectDomain struct {
	InternalDomain           string `db:"internal_domain" json:"internal_domain"`
	ExternalDomain           string `db:"external_domain" json:"external_domain"`
	TlsArn                   string `db:"tls_arn" json:"tls_arn"`
	TlsValidationRecordName  string `db:"tls_validation_record_name" json:"tls_validation_record_name"`
	TlsValidationRecordValue string `db:"tls_validation_record_value" json:"tls_validation_record_value"`
	CdnArn                   string `db:"cdn_arn" json:"cdn_arn"`
	CdnDomain                string `db:"cdn_domain" json:"cdn_domain"`
	S3Bucket                 string `db:"s3_bucket" json:"s3_bucket"`
	PurchasedFromUs          bool   `db:"purchased_from_us" json:"purchased_from_us"`
	HostedZoneId             string `db:"hosted_zone_id" json:"hosted_zone_id"`

	AccountId  string `db:"account_id" json:"-"`
	ProjectTag string `db:"project_tag" json:"-"`
}
