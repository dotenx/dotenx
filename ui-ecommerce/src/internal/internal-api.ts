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
	hosted_zone_id: string
	internal_domain: string
	ns_records: string[]
	tls_arn: string
}
