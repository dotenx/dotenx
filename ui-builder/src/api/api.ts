import axios from 'axios'
import {
	CreatePageRequest,
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

export const getProjectDetails = ({ name }: GetProjectDetailsRequest) => {
	return api.get<GetProjectDetailsResponse>(`/project/${name}`)
}

export const getPages = ({ projectTag }: GetPagesRequest) => {
	return api.get<GetPagesResponse>(`/uibuilder/project/${projectTag}/page`)
}

export const getPageDetails = ({ projectTag, name }: GetPageDetailsRequest) => {
	return api.get<GetPageDetailsResponse>(`/uibuilder/project/${projectTag}/page/${name}`)
}

export const createPage = ({ projectTag, name, content }: CreatePageRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/page`, { name, content })
}

export const publishPage = ({ projectTag, pageName }: PublishPageRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/page/${pageName}/publish`)
}
