import axios from "axios"

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
			response: Record<string, string>
		}[]
	>(`/uibuilder/project/${projectTag}/page/${pageName}/form`)

const getPages = ({ projectTag }: { projectTag: string }) => {
	return request.get<string[] | null>(`/uibuilder/project/${projectTag}/page`)
}

export const api = {
	getProject,
	getSubmittedForms,
	getPages,
}
