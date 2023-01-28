export enum QueryKey {
	GetProductsSummary = "get-products-summary",
	GetLastDaySales = "get-last-day-sales",
	GetMembersSummary = "get-members-summary",
	GetUserManagementData = "get-user-management-data",
	GetProject = "get-project",
	GetProfile = "get-profile",
	GetProjects = "get-projects",
	GetUserGroups = "get-user-groups",
	GetFiles = "get-files",
	GetDomains = "get-domains",
	GetFormatterFunctions = "get-formatter-functions",
}

export type GetFormatterFunctionsResponse = Record<string, FormatterFunction>

export interface FormatterFunction {
	inputs: string[]
	output: string
	description: string
}

export type GetProductsSummaryResponse = {
	totalRows: number
	rows: {
		imageUrl: string
		name: string
		sales: string
		revenue: string
		price: string
		status: string
	}[]
}

export type GetLastDaySalesResponse = {
	totalRows: number
	rows: {
		time: string
		email: string
		total: string
	}[]
}

export type GetMembersSummaryResponse = {
	totalRows: number
	rows: {
		email: string
		name: string
		total_orders: string
		monthly_revenue: string
	}[]
}

export type GetFilesDataResponse = any

export type GetProjectResponse = Project & { tag: string }

export interface Project {
	name: string
	description: string
}

export type GetProfileResponse = {
	account_id: string
}

export type GetUserGroupsResponse = Record<string, UserGroup>

export type UserGroup = {
	name: string
	description: string
	is_default: boolean
	privilages: Record<string, ("select" | "update" | "delete" | "insert")[]>
}

export type UploadImageRequest = {
	projectTag: string
	image: File
}

export type UploadImageResponse = {
	fileName: string
	url: string
}
