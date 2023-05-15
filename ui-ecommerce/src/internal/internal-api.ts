import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

export function getDomains(projectTag: string) {
	return api.get<GetDomainResponse>(`/project/tag/${projectTag}/domain`)
}

export function addDomain({ projectTag, domainName }: { projectTag: string; domainName: any }) {
	return api.post<void>(`/project/${projectTag}/domain`, domainName)
}
export function verifyDomain({ projectTag }: { projectTag: string }) {
	return api.post(`/project/${projectTag}/domain/verify`)
}

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
