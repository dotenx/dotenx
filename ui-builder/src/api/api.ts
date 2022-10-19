import axios from 'axios'
import produce from 'immer'
import _ from 'lodash'
import { addControllers } from '../utils/controller-utils'
import { deserializeElement } from '../utils/deserialize'
import { mapSelectorStyleToCamelCase, mapSelectorStyleToKebabCase } from './mapper'
import {
	AddPageRequest,
	CreateComponentRequest,
	CreateDesignSystemRequest,
	DeleteComponentRequest,
	DeletePageRequest,
	GetColumnsResponse,
	GetComponentsRequest,
	GetComponentsResponse,
	GetDesignSystemsRequest,
	GetDesignSystemsResponse,
	GetMarketplaceItemsResponse,
	GetPageDetailsRequest,
	GetPageDetailsResponse,
	GetPagesRequest,
	GetPagesResponse,
	GetProjectDetailsRequest,
	GetProjectDetailsResponse,
	GetTablesResponse,
	GlobalStates,
	ImportComponentRequest,
	PublishPageRequest,
	PublishPageResponse,
	SetGlobalStatesRequest,
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
	Components = 'components',
	DesignSystems = 'design-systems',
	MarketplaceItems = 'marketplace-items',
	Tables = 'tables',
	Columns = 'columns',
	GlobalStates = 'global-states',
}

export const getProjectDetails = ({ projectName }: GetProjectDetailsRequest) => {
	return api.get<GetProjectDetailsResponse>(`/project/${projectName}`)
}

export const getPages = ({ projectTag }: GetPagesRequest) => {
	return api.get<GetPagesResponse>(`/uibuilder/project/${projectTag}/page`)
}
export const uploadProjectImage = (data: FormData) => {
	return api.post('/marketplace/upload', data)
}
export const getPageDetails = async ({ projectTag, pageName }: GetPageDetailsRequest) => {
	const response = await api.get<GetPageDetailsResponse>(
		`/uibuilder/project/${projectTag}/page/${pageName}`
	)
	const elements = response.data.content.layout.map(deserializeElement)
	const classNames = _.fromPairs(
		_.toPairs(response.data.content.classNames).map(([className, styles]) => [
			className,
			{
				desktop: mapSelectorStyleToCamelCase(styles.desktop),
				tablet: mapSelectorStyleToCamelCase(styles.tablet),
				mobile: mapSelectorStyleToCamelCase(styles.mobile),
			},
		])
	)

	return {
		...response,
		data: {
			...response.data,
			content: {
				...response.data.content,
				layout: addControllers(elements),
				classNames: classNames,
			},
		},
	}
}

export const addPage = ({
	projectTag,
	pageName,
	elements,
	dataSources,
	classNames,
	mode,
	pageParams,
}: AddPageRequest) => {
	const kebabClasses = _.fromPairs(
		_.toPairs(classNames).map(([className, styles]) => [
			className,
			{
				desktop: styles.desktop && mapSelectorStyleToKebabCase(styles.desktop),
				tablet: styles.tablet && mapSelectorStyleToKebabCase(styles.tablet),
				mobile: styles.mobile && mapSelectorStyleToKebabCase(styles.mobile),
			},
		])
	)
	return api.post(`/uibuilder/project/${projectTag}/page`, {
		name: pageName,
		content: {
			layout: elements.map((element) => element.serialize()),
			dataSources,
			classNames: kebabClasses,
			mode,
			pageParams,
		},
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
	formData.append('is_public', 'true')
	return api.post<UploadImageResponse>(`/objectstore/project/${projectTag}/upload`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
}

export const createComponent = ({ projectTag, payload }: CreateComponentRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/component`, {
		name: payload.name,
		content: payload.content.serialize(),
		category: 'uiComponentItem',
	})
}

export const importFromMarketplace = ({
	projectTag,
	itemId,
	name,
	category,
}: ImportComponentRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/component`, { itemId, name, category })
}

export const deleteComponent = ({ projectTag, name }: DeleteComponentRequest) => {
	return api.delete(`/uibuilder/project/${projectTag}/component/${name}`)
}

export const deleteDesignSystem = deleteComponent

export const getComponents = async ({ projectTag }: GetComponentsRequest) => {
	const response = await api.get<GetComponentsResponse>(
		`/uibuilder/project/${projectTag}/component`
	)
	return produce(response, (draft) => {
		draft.data =
			draft.data?.map((element) => ({
				...element,
				content: deserializeElement(element.content),
			})) ?? []
	})
}

export const createDesignSystem = ({ projectTag, payload }: CreateDesignSystemRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/component`, {
		...payload,
		category: 'uiDesignSystemItem',
	})
}

export const getDesignSystems = ({ projectTag }: GetDesignSystemsRequest) => {
	return api.get<GetDesignSystemsResponse>(`/uibuilder/project/${projectTag}/component`)
}

export const addToMarketPlace = ({
	componentName,
	projectName,
	category,
	imageUrl,
}: {
	componentName: string
	projectName: string
	imageUrl: string
	category: 'uiComponentItem' | 'uiDesignSystemItem'
}) => {
	return api.post(`/marketplace/item`, {
		component_name: componentName,
		category,
		projectName,
		imageUrl,
		title: componentName,
	})
}

export const getMarketplaceItems = () => {
	return api.get<GetMarketplaceItemsResponse>(`/public/marketplace`)
}

export const getTables = ({ projectName }: { projectName: string }) => {
	return api.get<GetTablesResponse>(`/database/project/${projectName}/table`)
}

export function getColumns({ projectName, tableName }: { projectName: string; tableName: string }) {
	return api.get<GetColumnsResponse>(`/database/project/${projectName}/table/${tableName}/column`)
}

export function changeGlobalStates({ projectName, payload }: SetGlobalStatesRequest) {
	return api.post(`/uibuilder/project/name/${projectName}/state/global`, payload)
}

export function getGlobalStates({ projectName }: { projectName: string }) {
	return api.get<GlobalStates>(`/uibuilder/project/name/${projectName}/state/global`)
}
