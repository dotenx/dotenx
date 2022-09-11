import axios from 'axios'
import _ from 'lodash'
import {
	mapSelectorStyleToKebabCase,
	mapStylesToCamelCase,
	mapStylesToKebabCase,
	mapStyleToCamelCase,
} from './mapper'
import {
	AddPageRequest,
	CreateCustomComponentRequest,
	CreateDesignSystemRequest,
	DeleteCustomComponentRequest,
	DeletePageRequest,
	GetCustomComponentsRequest,
	GetCustomComponentsResponse,
	GetDesignSystemsRequest,
	GetDesignSystemsResponse,
	GetMarketplaceItemsResponse,
	GetPageDetailsRequest,
	GetPageDetailsResponse,
	GetPagesRequest,
	GetPagesResponse,
	GetProjectDetailsRequest,
	GetProjectDetailsResponse,
	ImportCustomComponentRequest,
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
	CustomComponents = 'custom-components',
	DesignSystems = 'design-systems',
	MarketplaceItems = 'marketplace-items',
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
	const res = await api.get<GetPageDetailsResponse>(
		`/uibuilder/project/${projectTag}/page/${pageName}`
	)
	const components = mapStylesToCamelCase(res.data.content.layout)
	const classNames = _.fromPairs(
		_.toPairs(res.data.content.classNames).map(([className, styles]) => [
			className,
			{
				desktop: mapStyleToCamelCase(styles.desktop),
				tablet: mapStyleToCamelCase(styles.tablet),
				mobile: mapStyleToCamelCase(styles.mobile),
			},
		])
	)
	return {
		...res,
		data: {
			...res.data,
			content: { ...res.data.content, layout: components, classNames: classNames },
		},
	}
}

export const addPage = ({
	projectTag,
	pageName,
	components,
	dataSources,
	classNames,
}: AddPageRequest) => {
	const kebabClasses = _.fromPairs(
		_.toPairs(classNames).map(([className, styles]) => [
			className,
			{
				desktop: mapSelectorStyleToKebabCase(styles.desktop),
				tablet: mapSelectorStyleToKebabCase(styles.tablet),
				mobile: mapSelectorStyleToKebabCase(styles.mobile),
			},
		])
	)

	return api.post(`/uibuilder/project/${projectTag}/page`, {
		name: pageName,
		content: {
			layout: mapStylesToKebabCase(components),
			dataSources,
			classNames: kebabClasses,
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
	return api.post<UploadImageResponse>(`/objectstore/project/${projectTag}/upload`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
}

export const createCustomComponent = ({ projectTag, payload }: CreateCustomComponentRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/component`, {
		...payload,
		category: 'uiComponentItem',
	})
}

export const importFromMarketplace = ({
	projectTag,
	itemId,
	name,
	category,
}: ImportCustomComponentRequest) => {
	return api.post(`/uibuilder/project/${projectTag}/component`, { itemId, name, category })
}

export const deleteCustomComponent = ({ projectTag, name }: DeleteCustomComponentRequest) => {
	return api.delete(`/uibuilder/project/${projectTag}/component/${name}`)
}

export const deleteDesignSystem = deleteCustomComponent

export const getCustomComponents = ({ projectTag }: GetCustomComponentsRequest) => {
	return api.get<GetCustomComponentsResponse>(`/uibuilder/project/${projectTag}/component`)
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
}: {
	componentName: string
	projectName: string
	category: 'uiComponentItem' | 'uiDesignSystemItem'
}) => {
	return api.post(`/marketplace/item`, {
		component_name: componentName,
		category,
		projectName,
		title: componentName,
	})
}

export const getMarketplaceItems = () => {
	return api.get<GetMarketplaceItemsResponse>(`/public/marketplace`)
}
