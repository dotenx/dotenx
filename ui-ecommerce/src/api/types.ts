import { QueryBuilderValues } from "../features/database"

export enum QueryKey {
	GetProductsSummary = "get-products-summary",
	GetLast24HoursSales = "get-last-24-hours-sales",
	GetMembersSummary = "get-members-summary",
	GetUserManagementData = "get-user-management-data",
	GetGitAccounts = "get-git-accounts",
	GetBranchList = "get-branch-list",
	GetAutomations = "get-automation",
	GetTemplateAutomations = "get-template-automations",
	GetTasks = "get-tasks",
	GetTaskFields = "get-task-fields",
	GetAutomation = "get-automation",
	GetAutomationYaml = "get-automation-yaml",
	GetResult = "get-result",
	GetExecutions = "get-executions",
	GetExecution = "get-execution",
	GetIntegrationTypes = "get-integration-types",
	GetIntegrationTypeFields = "get-integration-type-fields",
	GetIntegrations = "get-integrations",
	GetTriggers = "get-triggers",
	GetTriggerTypes = "get-trigger-types",
	GetTriggerDefinition = "get-trigger-definition",
	GetAutomationTrigger = "get-automation-triggers",
	GetIntegrationsByType = "get-integration-by-type",
	GetProviders = "get-providers",
	GetProvider = "get-provider",
	GetFormatterFunctions = "get-formatter-functions",
	GetProjects = "get-projects",
	GetProject = "get-project",
	GetFiles = "get-files",
	GetTables = "get-tables",
	GetTable = "get-table",
	GetTableRecords = "get-table-records",
	GetColumns = "get-columns",
	GetTemplateEndpointFields = "get-template-endpoint-fields",
	GetInteractionEndpointFields = "get-interaction-endpoint-fields",
	GetProfile = "get-profile",
	GetUserGroups = "get-user-groups",
	GetUserGroup = "get-user-group",
	GetDomains = "get-domains",
	GetViews = "get-views",
	GetViewDetails = "get-view-details",
	GetViewData = "get-view-data",
}

export type gitProviders = "github" | "gitlab" | "bitbucket"

export enum TaskExecutionStatus {
	Success = "success",
	Failed = "failed",
	Timedout = "timedout",
	Started = "started",
	Cancelled = "cancelled",
	Completed = "completed",
	Waiting = "waiting",
}

export interface TaskTriggerOutput {
	key: string
	type: string
}

export interface TriggerKindData {
	type: string
	icon_url: string
	description: string
	node_color: string
}

export interface Trigger {
	name: string
	account_id?: string
	type?: string
	endpoint?: string
	pipeline_name?: string
	integration?: string
	credentials?: Record<string, string>
	meta_data?: Metadata
}

export interface Integration {
	name: string
	account_id: string
	type: string
	url: string
	key: string
	secret: string
	access_token: string
}

export interface ExportDatabaseResponse {
	db_job: {
		account_id: string
		project_name: string
		pg_dump_url: string
		pg_dump_status: string
		pg_dump_url_expiration_time: number
		csv_url: string
		csv_status: string
		csv_url_expiration_time: number
	}
}
export interface AutomationEventMessage {
	execution_id: string
	tasks: {
		name: string
		status: TaskExecutionStatus
	}[]
}

export interface AutomationData {
	serviceAccount: string
	endpoint: string
	manifest: Manifest
	is_active: boolean
}

export interface TaskKindData {
	type: string
	description: string
	icon_url: string
	node_color: string
}

export interface Automation {
	name: string
	endpoint: string
	is_active: boolean
	is_public?: boolean
	created_for?: string
	user_groups?: string[]
	is_template?: boolean
	is_interaction?: boolean
}

export type Triggers = Record<string, Trigger>

export interface Manifest {
	triggers: Triggers
	tasks: Tasks
}

export type Tasks = Record<string, Task>

export interface Task {
	type: string
	executeAfter: Record<string, string[]>
	body: TaskBody
	integration: string
	meta_data?: Metadata
}

export type TaskFieldValue =
	| TfDirectValue
	| TfRefrenced
	| TfNested
	| TfJson
	| TfFormatted
	| TfCustomOutputs
	| TfJsonArray

export type TfDirectValue = {
	type: "directValue"
	value: string | string[] | { steps: BuilderStep[] }
}
export type TfRefrenced = { type: "refrenced"; source: string; key: string }
export type TfNested = { type: "nested"; nestedKey: string }
export type TfJson = { type: "json"; value: Record<string, TaskFieldValue> }
export type TfJsonArray = { type: "json_array"; value: AnyJson }
export type TfFormatted = { type: "formatted"; formatter: Formatter }
export type TfCustomOutputs = { type: "customOutputs"; outputs: string[] }

export type TaskBody = Record<string, TaskFieldValue>

export interface Metadata {
	icon: string
	node_color: string
}

export type GetAutomationsResponse = Automation[]

export type CreateAutomationRequest = {
	name: string
	manifest: Manifest
	is_template?: boolean
	is_interaction?: boolean
}

export type GetAutomationResponse = AutomationData

export type GetAutomationTriggersResponse = Trigger[]

export type GetTaskKindsResponse = {
	tasks: Record<string, TaskKindData[]>
}

export type GetIntegrationsResponse = Integration[]

export type GetIntegrationsByKindsResponse = Integration[]

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

export type GetIntegrationKindFieldsResponse = {
	secrets: { key: string; name: string; internal: boolean }[]
	oauth_provider: string
}

export type GetTriggersResponse = Trigger[]

export type GetTriggerKindsResponse = {
	triggers: Record<string, TriggerKindData[]>
}

export type GetTriggerDefinitionResponse = {
	type: string
	integrations: string[]
	image: string
	credentials: {
		key: string
		type: string
		description: string
		display_name: string
	}[]
	outputs: TaskTriggerOutput[]
}

export interface GetTaskFieldsResponse {
	fields: {
		key: string
		type: FieldType
		display_name: string
		description: string
	}[]
	integration_types: string[]
	outputs: TaskTriggerOutput[]
	has_dynamic_variables: boolean
}

export enum FieldType {
	Text = "text",
	Code = "code",
	Object = "object",
	CustomOutputs = "custom-outputs",
}

export interface GetExecutionResultResponse {
	status: TaskExecutionStatus
	log: string
	return_value: string
}

export interface Execution {
	Id: string
	StartedAt: string
	InitialData: unknown | null
}

export type GetAutomationExecutionsResponse = Execution[]

export interface TriggerData {
	name: string
	type?: string
	pipeline_name?: string
	integration?: string
	credentials?: Record<string, string>
	iconUrl?: string
}

export type CreateTriggerRequest = TriggerData[]

export type CreateIntegrationRequest = {
	name: string
	type: string
	secrets: Record<string, string>
}

export type GetProvidersResponse = ProviderDetail[]

export interface Provider {
	name: string
	type: string
	key: string
	secret: string
	scopes?: string[]
	front_end_url: string
	direct_url?: string
}

export interface ProviderDetail {
	name: string
	type: string
	key: string
	secret: string
	scopes?: string[]
	front_end_url: string
	account_id: string
	direct_url: string
	tag: string
}

export type GetFormatterFunctionsResponse = Record<string, FormatterFunction>

export interface FormatterFunction {
	inputs: string[]
	output: string
	description: string
}

export interface FormatterBody {
	formatter: Formatter
}

export interface Formatter {
	format_str: string
	func_calls: Record<string, FuncCall>
}

export interface FuncCall {
	function: string
	args: Arg[]
}

export type Arg = TfDirectValue | TfRefrenced

export type GetProviderResponse = { provider: ProviderDetail }

export type CreateProjectRequest = Project

export type GetProjectsResponse = Project[] | null

export type GetUserManagementDataResponse = {
	totalRows: number
	rows: {
		account_id: string
		created_at: string
		email: string
		fullname: string
		user_group: string
	}[]
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
export type GetLast24HoursSalesResponse = {
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

export type GetTablesResponse = {
	tables: {
		name: string
		is_public: boolean
	}[]
}

export type View = {
	name: string
	is_public: boolean
}

export type GetViewsResponse = {
	views: View[]
}

export interface GetViewDetailsResponse {
	name: string
	query_as_json: {
		columns: string[]
		filters: {
			conjunction: string
			filterSet: {
				key: string
				operator: string
				value: string
			}[]
		}
		isPublic: boolean
		projectName: string
		tableName: string
		viewName: string
	}
	is_public: boolean
}

export type GetViewDataResponse = {
	functions: unknown
	page: number
	rows: JsonMap[]
	size: number
	totalRows: number
}

export interface CreateViewRequest {
	projectName: string
	tableName: string
	viewName: string
	columns: string[]
	isPublic: boolean
	filters: Filters
}

export interface Filters {
	filterSet: FilterSet[]
	conjunction: string
}

export interface FilterSet {
	key: string
	operator: string
	value: string
}

export interface Table {
	tableName: string
}

export type CreateTableRequest = Table

export type AddColumnRequest = Column

export interface Column {
	columnName: string
	columnType: string
}

export type GetColumnsResponse = {
	columns: { name: string; type: string }[]
}

export type AutomationKind = "automation" | "template" | "interaction" | "template_automations"

export type StartAutomationRequest =
	| Record<string, never>
	| { interactionRunTime: Record<string, string> }

export interface RecordsFilters {
	columns: string[]
	filters?: QueryBuilderValues
}

export type GetTableRecordsRequest = RecordsFilters

export type EndpointFields = Record<
	string,
	{
		key: string
		type: string
	}[]
>

export type TableRecord = Record<
	string,
	string | string[] | boolean | boolean[] | number | number[]
>

export type GetRecordsResponse = {
	rows: TableRecord[]
	totalRows: number
} | null

export type RunCustomQueryResponse = {
	rows: Array<object>
	rows_affected: number
	successful: boolean
	total_rows: number
}
export type AddRecordRequest = TableRecord

export type UpdateRecordRequest = TableRecord

export type GetProfileResponse = {
	account_id: string
}

interface Assignment {
	name: string
	value: string
}

interface Conditional {
	branches: { condition: string; body: BuilderStep[] }[]
	elseBranch: BuilderStep[]
}

interface Repeat {
	count: string
	iterator: string
	body: BuilderStep[]
}

interface Foreach {
	collection: string
	iterator: string
	body: BuilderStep[]
}

interface FunctionCall {
	name: string
	arguments: string[]
	output?: string
}

interface OutputParams {
	value: string
}

interface VarDeclaration {
	name: string
}

interface ExecuteTask {
	url: string
	method: string
	headers: {
		"DTX-auth": string
	}
	body: TestTaskRequest
	output?: string
}

export type BuilderStep =
	| { type: "assignment"; params: Assignment }
	| { type: "if"; params: Conditional }
	| { type: "repeat"; params: Repeat }
	| { type: "foreach"; params: Foreach }
	| { type: "function_call"; params: FunctionCall }
	| { type: "output"; params: OutputParams }
	| { type: "var_declaration"; params: VarDeclaration }
	| { type: "execute_task"; params: ExecuteTask }

export type TaskBuilder = {
	prop: string
	steps: BuilderStep[]
}

export type CreateUserGroupRequest = {
	name: string
	description: string
	select: Record<string, string>
	update: Record<string, string>
	delete: Record<string, string>
	insert: Record<string, string>
}

export type GetUserGroupsResponse = Record<string, UserGroup>

export type UserGroup = {
	name: string
	description: string
	is_default: boolean
	privilages: Record<string, ("select" | "update" | "delete" | "insert")[]>
}

export type UpdateUserGroupRequest = CreateUserGroupRequest

export type SetDefaultUserGroupRequest = { name: string }

export type GetUserGroupResponse = Record<string, UserGroup>

export type GetGitAccountsResponse = { git_account_id: string; git_username: string }[]
export type AnyJson = boolean | number | string | null | JsonArray | JsonMap

export interface GetRepoListResponse {
	repositories: Array<{ full_name: string; clone_url: string }>
}

export interface GetBranchesListResponse {
	branches: Array<{ name: string }>
}

export interface JsonMap {
	[key: string]: AnyJson
}

type JsonArray = Array<AnyJson>

export type TestTaskRequest = TestTaskData

type TestTaskData = {
	manifest: {
		tasks: {
			task: {
				type?: string
				integration: string
				body: Record<string, AnyJson>
			}
		}
	}
}

export type TestTaskResponse = {
	successfull: boolean
	status: string
	return_value: { outputs: AnyJson }
}

export type TestTriggerRequest = TestTriggerData

type TestTriggerData = {
	manifest: {
		triggers: {
			trigger: {
				type: string
				integration: string
				credentials: Record<string, string>
			}
		}
	}
}

export type TestTriggerResponse = {
	triggered: boolean
	return_value: { trigger: AnyJson }
}
