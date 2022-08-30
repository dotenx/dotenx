import axios from 'axios'
import { mapStylesToCamelCase, mapStylesToKebabCase } from './mapper'
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
	PublishPageResponse,
	UploadImageRequest,
	UploadImageResponse,
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

export const getPageDetails = async ({ projectTag, pageName }: GetPageDetailsRequest) => {
	const res = await api.get<GetPageDetailsResponse>(
		`/uibuilder/project/${projectTag}/page/${pageName}`
	)
	const components = mapStylesToCamelCase(res.data.content.layout)
	return { ...res, data: { ...res.data, content: { ...res.data.content, layout: components } } }
}

export const addPage = ({ projectTag, pageName, components, dataSources }: AddPageRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/page`, {
		name: pageName,
		content: { layout: mapStylesToKebabCase(components), dataSources },
	})
}

export const updatePage = addPage

export const deletePage = ({ projectTag, pageName }: DeletePageRequest) => {
	return api.delete(`/uibuilder/project/${projectTag}/page/${pageName}`)
}

export const publishPage = ({ projectTag, pageName }: PublishPageRequest) => {
	return api.post<PublishPageResponse>(
		`/uibuilder/project/${projectTag}/page/${pageName}/publish`
	)
}

export const uploadImage = ({ projectTag, image }: UploadImageRequest) => {
	const formData = new FormData()
	formData.append('file', image)
	return api.post<UploadImageResponse>(`/objectstore/project/${projectTag}/upload`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	})
}
