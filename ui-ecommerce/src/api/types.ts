import { z } from "zod"

export enum QueryKey {
	GetProductsSummary = "get-products-summary",
	getDetailsByID = "get-details-by-id",
	GetProductsOnlyRecords = "get-products-only-records",
	GetMembershipOnlyRecords = "get-membership-only-records",
	GetColumns = "get-columns",
	GetTableRecords = "get-table-records",
	GetTables = "get-tables",
	GetIntegrationTypes = "get-integration-types",
	GetIntegrationTypeFields = "get-integration-type-fields",
	GetEmailPipelineList = "get-email-pipeline-list ",
	GetIntegrations = "get-integrations",
	GetIntegrationDetails = "get-integration-details",
	GetPipelineDetails = "get-pipeline-details",
	GetLastDaySales = "get-last-day-sales",
	GetMembersSummary = "get-members-summary",
	GetIntegrationsByType = "get-integration-by-type",
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
const schema = z.object({
	conjunction: z.string(),
	filterSet: z.array(
		z
			.object({
				key: z.string(),
				operator: z.string(),
				value: z.string(),
			})
			.or(
				z.object({
					filterSet: z.array(
						z.object({
							key: z.string(),
							operator: z.string(),
							value: z.string(),
						})
					),
				})
			)
	),
})

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
export type QueryBuilderValues = z.infer<typeof schema>

export interface RecordsFilters {
	columns: string[]
	filters?: { filterSet: [{ key: string; operator: string; value: string }] }
}

export type GetTableRecordsRequest = RecordsFilters

export type GetLastDaySalesResponse = {
	totalRows: number
	rows: {
		time: string
		email: string
		total: string
	}[]
}

export type TableRecord = Record<
	string,
	string | string[] | boolean | boolean[] | number | number[]
>

export type GetRecordsResponse = {
	rows: TableRecord[]
	totalRows: number
} | null

export type GetColumnsResponse = {
	columns: { name: string; type: string }[]
}
export type RunCustomQueryResponse = {
	rows: Array<any>
	rows_affected: number
	successful: boolean
	total_rows: number
}
export type GetMembersSummaryResponse = {
	totalRows: number
	rows: {
		email: string
		name: string
		total_orders: string
		updated_at: string
	}[]
}

export type GetFilesDataResponse = any

export type GetProjectResponse = Project & { tag: string }

export interface Table {
	tableName: string
}

export type AddColumnRequest = Column

export interface Column {
	columnName: string
	columnType: string
	tableName?: string
}

export type CreateTableRequest = Table

export type GetTablesResponse = {
	tables: {
		name: string
		is_public: boolean
	}[]
}

export interface Project {
	name: string
	description: string
}
export type GetIntegrationsResponse = Integration[]
export interface Integration {
	name: string
	account_id: string
	type: string
	url: string
	key: string
	secret: string
	access_token: string
}
export type GetIntegrationKindFieldsResponse = {
	secrets: { key: string; name: string; internal: boolean }[]
	oauth_provider: string
}
export type CreateIntegrationRequest = {
	name: string
	type: string
	secrets: Record<string, string>
}
export type SetupIntegrationRequest = {
	project_name: string,
	name?: string,
	integration_secrets: {
		SECRET_KEY: string
	},
	integration_type: string
}

export type GetIntegrationKindsResponse = IntegrationKind[]
export interface IntegrationKind {
	type: string
	secrets: Secret[]
	oauth_provider: string
}
export interface Secret {
	name: string
	key: string
	internal: boolean
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

export const currency = [
	"USD",
	"AED",
	"AFN",
	"ALL",
	"AMD",
	"ANG",
	"AOA",
	"ARS",
	"AUD",
	"AWG",
	"AZN",
	"BAM",
	"BBD",
	"BDT",
	"BGN",
	"BMD",
	"BND",
	"BOB",
	"BRL",
	"BSD",
	"BWP",
	"BYN",
	"BZD",
	"CAD",
	"CDF",
	"CHF",
	"CNY",
	"COP",
	"CRC",
	"CVE",
	"CZK",
	"DKK",
	"DOP",
	"DZD",
	"EGP",
	"ETB",
	"EUR",
	"FJD",
	"FKP",
	"GBP",
	"GEL",
	"GIP",
	"GMD",
	"GTQ",
	"GYD",
	"HKD",
	"HNL",
	"HRK",
	"HTG",
	"HUF",
	"IDR",
	"ILS",
	"INR",
	"ISK",
	"JMD",
	"KES",
	"KGS",
	"KHR",
	"KYD",
	"KZT",
	"LAK",
	"LBP",
	"LKR",
	"LRD",
	"LSL",
	"MAD",
	"MDL",
	"MKD",
	"MMK",
	"MNT",
	"MOP",
	"MRO",
	"MUR",
	"MVR",
	"MWK",
	"MXN",
	"MYR",
	"MZN",
	"NAD",
	"NGN",
	"NIO",
	"NOK",
	"NPR",
	"NZD",
	"PAB",
	"PEN",
	"PGK",
	"PHP",
	"PKR",
	"PLN",
	"QAR",
	"RON",
	"RSD",
	"RUB",
	"SAR",
	"SBD",
	"SCR",
	"SEK",
	"SGD",
	"SHP",
	"SLE",
	"SLL",
	"SOS",
	"SRD",
	"STD",
	"SZL",
	"THB",
	"TJS",
	"TOP",
	"TRY",
	"TTD",
	"TWD",
	"TZS",
	"UAH",
	"UYU",
	"UZS",
	"WST",
	"XCD",
	"YER",
	"ZAR",
	"ZMW",
]
