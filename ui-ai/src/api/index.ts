import axios from "axios"
import { GetDomainResponse, GetPagesListResponse } from "./types"

const API_URL = import.meta.env.VITE_API_URL

const request = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

const getProject = ({ name }: { name: string }) =>
	request.get<{
		name: string
		description: string
		tag: string
	}>(`/project/${name}`)

export function getDomains(projectTag: string) {
	return request.get<GetDomainResponse>(`/project/tag/${projectTag}/domain`)
}
export function addDomain({ projectTag, domainName }: { projectTag: string; domainName: any }) {
	return request.post<void>(`/project/${projectTag}/domain`, { external_domain: domainName.external_domain, purchased_from_us: false })
}
export function purchaseDomain(values: any) {
	return request.post<void>(`/project/${values.projectTag}/domain`, {
		external_domain: values.external_domain,
		purchased_from_us: true,
		contact_info: {
			first_name: values?.first_name,
			last_name: values?.last_name,
			city: values?.city,
			au_id_number: values?.au_id_number || '',
			au_id_type: values?.au_id_type || '',
		},
	})
}

export function verifyDomain({ projectTag }: { projectTag: string }) {
	return request.post(`/project/${projectTag}/domain/verify`)
}

const getSubmittedForms = ({ projectTag, pageName }: { projectTag: string; pageName: string }) =>
	request.get<
		{
			form_id: string
			name: string
		}[]
	>(`/uibuilder/project/${projectTag}/page/${pageName}/form`)

const getPages = ({ projectTag }: { projectTag: string }) => {
	return request.get<string[] | null>(`/uibuilder/project/${projectTag}/page`)
}
const getFormResponses = ({ projectTag, formId, page }: { projectTag: string, formId: string, page: string }) => {
	return request.get(`/uibuilder/project/${projectTag}/page/${page}/form/${formId}`)
}
const getPagesList = ({ projectTag }: { projectTag: string }) => {
	return request.get<GetPagesListResponse>(`/uibuilder/project/${projectTag}/page/form/list`)
}

export const api = {
	getProject,
	getFormResponses,
	getSubmittedForms,
	getPages,
	getPagesList,
}
