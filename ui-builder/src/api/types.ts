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
