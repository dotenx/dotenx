package models

type ProjectDomain struct {
	InternalDomain string   `db:"internal_domain" json:"internal_domain"`
	ExternalDomain string   `db:"external_domain" json:"external_domain"`
	TlsArn         string   `db:"tls_arn" json:"tls_arn"`
	AccountId      string   `db:"account_id" json:"-"`
	ProjectTag     string   `db:"project_tag" json:"-"`
	HostedZoneId   string   `db:"hosted_zone_id" json:"hosted_zone_id"`
	NsRecords      []string `db:"ns_records" json:"ns_records"`
}
