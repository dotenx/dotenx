import axios from 'axios'
import _ from 'lodash'
import { ActionKind, Component } from '../features/canvas-store'
import { safeParseToJson } from '../utils'
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
	const dataSources = content.dataSources.map((source) =>
		_.omit(
			{
				...source,
				body: safeParseToJson(source.body),
				headers: safeParseToJson(source.headers),
			},
			['properties']
		)
	)
	const components = normalize(content.layout)

	return api.post(`/uibuilder/project/${projectTag}/page`, {
		name,
		content: { dataSources, layout: components },
	})
}

export const publishPage = ({ projectTag, pageName }: PublishPageRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/page/${pageName}/publish`)
}

function normalize(components: Component[]): any[] {
	return components.map((component) => ({
		...component,
		components: normalize(component.components),
		events: component.events.map((event) =>
			event.actions.map((action) =>
				action.kind === ActionKind.Fetch
					? { ...action, body: safeParseToJson(action.body) }
					: action
			)
		),
	}))
}
