import axios from "axios"
import { GetPagesListResponse } from "./types"

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
