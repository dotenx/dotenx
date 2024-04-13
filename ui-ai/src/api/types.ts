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
	internal_domain: string,
	external_domain: string,
	tls_arn: string,
	tls_validation_record_name: string,
	tls_validation_record_value: string,
	cdn_arn: string,
	cdn_domain: string,
	s3_bucket: string,
	purchased_from_us: boolean,
	hosted_zone_id: string,
	registration_status: string,
	certificate_issued: boolean,
	nameservers: string[],
	contact_info: {
		city: string,
		last_name: string,
		au_id_type: string,
		first_name: string,
		au_id_number: string
	}
}


