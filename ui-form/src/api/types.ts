export enum QueryKey {
	GetProject = "get-project",
	GetSubmittedForms = "get-submitted-forms",
	GetPages = "get-pages",
	GetPagesList = "get-pages-list",
}

export type GetPagesListResponse = {
	page_name: string,
	submitted_forms: number
}[]

