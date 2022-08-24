import axios from 'axios'
import {
	AddPageRequest,
	DeletePageRequest,
	GetPageDetailsRequest,
	GetPageDetailsResponse,
	GetPagesRequest,
	GetPagesResponse,
	GetProjectDetailsRequest,
	GetProjectDetailsResponse,
	PublishPageRequest,
} from './types'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

export enum QueryKey {
	ProjectDetails = 'project-details',
	Pages = 'pages',
	PageDetails = 'page-details',
}

export const getProjectDetails = ({ projectName }: GetProjectDetailsRequest) => {
	return api.get<GetProjectDetailsResponse>(`/project/${projectName}`)
}

export const getPages = ({ projectTag }: GetPagesRequest) => {
	return api.get<GetPagesResponse>(`/uibuilder/project/${projectTag}/page`)
}

export const getPageDetails = ({ projectTag, pageName }: GetPageDetailsRequest) => {
	return api.get<GetPageDetailsResponse>(`/uibuilder/project/${projectTag}/page/${pageName}`)
}

export const addPage = ({ projectTag, pageName, components, dataSources }: AddPageRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/page`, {
		name: pageName,
		content: { layout: components, dataSources },
	})
}

export const updatePage = addPage

export const deletePage = ({ projectTag, pageName }: DeletePageRequest) => {
	return api.delete(`/uibuilder/project/${projectTag}/page/${pageName}`)
}

export const publishPage = ({ projectTag, pageName }: PublishPageRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/page/${pageName}/publish`)
}
