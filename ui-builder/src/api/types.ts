import { Component } from '../features/canvas-store'
import { DataSource } from '../features/data-source-store'

export type GetProjectDetailsRequest = {
	name: string
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
	name: string
}

export type GetPageDetailsResponse = PageDetails

export type CreatePageRequest = PageDetails & { projectTag: string }

export type PublishPageRequest = {
	projectTag: string
	pageName: string
}

interface PageDetails {
	name: string
	content: {
		layout: Component[]
		dataSources: DataSource[]
	}
}
