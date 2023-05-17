export enum QueryKey {
	GetProject = "get-project",
	GetSubmittedForms = "get-submitted-forms",
	GetPages = "get-pages",
	GetDomains = "get-domains",
	GetPagesList = "get-pages-list",
}

export type GetPagesListResponse = {
	page_name: string,
	submitted_forms: number
}[]

export interface GetDomainResponse {
	external_domain: string
	cdn_arn: string
	cdn_domain: string
	s3_bucket: string
	internal_domain: string
	tls_arn: string
	tls_validation_record_name: string
	tls_validation_record_value: string
}

