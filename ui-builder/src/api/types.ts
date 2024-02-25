import { Animation } from '../features/animations/schema'
import { DataSource } from '../features/data-source/data-source-store'
import { Element } from '../features/elements/element'
import { CssSelector, Style } from '../features/elements/style'
import { SerializedAnimation } from '../utils/serialize'

export type GetProjectDetailsRequest = {
	projectName: string
}

export type GetProjectDetailsResponse = {
	name: string
	description: string
	tag: string
	type: ProjectType
}

export type ProjectType = 'web_application' | 'website' | 'ecommerce' | 'landing_page'

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
	elements: Element[]
	dataSources: DataSource[]
	classNames: Record<string, Style>
	mode: LayoutMode
	pageParams: string[]
	globals: string[]
	fonts: Record<string, string>
	customCodes: {
		head: string
		footer: string
		scripts: string
		styles: string
	}
	statesDefaultValues: Record<string, string>
	animations: Animation[]
	colorPaletteId: string | null
}

export type PublishPageRequest = {
	projectTag: string
	pageName: string
}

export type PublishPageResponse = {
	url: string
}

type LayoutMode = 'simple' | 'advanced'

interface PageDetails {
	name: string
	content: {
		layout: Element[]
		dataSources: DataSource[]
		classNames: Record<string, BackendStyle>
		mode: LayoutMode
		pageParams: string[]
		fonts: Record<string, string>
		customCodes: {
			head: string
			footer: string
			scripts: string
			styles: string
		}
		statesDefaultValues: Record<string, string>
		animations?: SerializedAnimation[]
		colorPaletteId: string | null
	}
}

export type BackendSelectorStyle = Record<CssSelector, Record<string, string>>
export type BackendCustomSelectorStyle = Record<string, Record<string, string>>

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

export type UploadLogoRequest = {
	image: File
}


export type UploadLogoResponse = {
	key: string
	url: string
}

export type CreateComponentRequest = {
	projectTag: string
	payload: Component
}

export type DeleteComponentRequest = {
	projectTag: string
	name: string
}

export type GetComponentsRequest = {
	projectTag: string
}

export type GetComponentsResponse =
	| (Component & { category: 'uiComponentItem' | 'uiDesignSystemItem' })[]
	| null

export type Component = {
	name: string
	content: Element
}

export type CreateDesignSystemRequest = {
	projectTag: string
	payload: { name: string; content: Component[] }
}

export type GetDesignSystemsRequest = {
	projectTag: string
}

export type DesignSystem = {
	name: string
	content: Component[]
} & {
	category: string
}

export type GetDesignSystemsResponse = DesignSystem[] | null

export type GetMarketplaceItemsResponse = {
	category: string
	id: number
	title: string
	imageUrl: string
	type: 'project' | 'uiComponent' | 'uiDesignSystem' | 'uiExtension'
}[]

export type ImportComponentRequest = {
	projectTag: string
	itemId: number
	name: string
	category: string
}

export type GetTablesResponse = {
	tables: { name: string; is_public: boolean }[]
}

export type GetColumnsResponse = {
	columns: { name: string; type: string }[]
}
export type GetUrlsResponse = {
	preview_url: {
		exist: boolean
		last_at: string
		url: string
	}
	publish_url: {
		exist: boolean
		last_at: string
		url: string
	}
}

export type GlobalStates = {
	states: string[]
}

export type SetGlobalStatesRequest = {
	projectName: string
	payload: GlobalStates
}
