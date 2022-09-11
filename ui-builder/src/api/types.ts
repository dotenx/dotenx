import { Component, CssSelector, Style } from '../features/canvas-store'
import { DataSource } from '../features/data-source-store'

export type GetProjectDetailsRequest = {
	projectName: string
}

export type GetProjectDetailsResponse = {
	name: string
	description: string
	tag: string
}

export type GetPagesRequest = {
	projectTag: string
}

export type GetPagesResponse = string[] | null

export type GetPageDetailsRequest = {
	projectTag: string
	pageName: string
}

export type GetPageDetailsResponse = PageDetails

export type AddPageRequest = {
	projectTag: string
	pageName: string
	components: Component[]
	dataSources: DataSource[]
	classNames: Record<string, Style>
}

export type PublishPageRequest = {
	projectTag: string
	pageName: string
}

export type PublishPageResponse = {
	url: string
}

interface PageDetails {
	name: string
	content: {
		layout: Component[]
		dataSources: DataSource[]
		classNames: Record<string, BackendStyle>
	}
}

export type BackendSelectorStyle = Record<CssSelector, Record<string, string>>

export interface BackendStyle {
	desktop: BackendSelectorStyle
	tablet: BackendSelectorStyle
	mobile: BackendSelectorStyle
}

export type DeletePageRequest = {
	projectTag: string
	pageName: string
}

export type UploadImageRequest = {
	projectTag: string
	image: File
}

export type UploadImageResponse = {
	fileName: string
	url: string
}

export type CreateCustomComponentRequest = {
	projectTag: string
	payload: CustomComponent
}

export type DeleteCustomComponentRequest = {
	projectTag: string
	name: string
}

export type GetCustomComponentsRequest = {
	projectTag: string
}

export type GetCustomComponentsResponse =
	| (CustomComponent & { category: 'uiComponentItem' | 'uiDesignSystemItem' })[]
	| null

export type CustomComponent = {
	name: string
	content: Component
}

export type CreateDesignSystemRequest = {
	projectTag: string
	payload: { name: string; content: CustomComponent[] }
}

export type GetDesignSystemsRequest = {
	projectTag: string
}

export type GetDesignSystemsResponse =
	| ({ name: string; content: CustomComponent[] } & {
		category: 'uiComponentItem' | 'uiDesignSystemItem'
	})[]
	| null

export type GetMarketplaceItemsResponse = {
	category: 'uiComponentItem' | 'uiDesignSystemItem'
	id: number
	title: string
	imageUrl: string
}[]

export type ImportCustomComponentRequest = {
	projectTag: string
	itemId: number
	name: string
	category: string
}
