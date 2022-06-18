export enum QueryKey {
	GetAutomations = 'get-automation',
	GetTasks = 'get-tasks',
	GetTaskFields = 'get-task-fields',
	GetAutomation = 'get-automation',
	GetAutomationYaml = 'get-automation-yaml',
	GetResult = 'get-result',
	GetExecutions = 'get-executions',
	GetExecution = 'get-execution',
	GetIntegrationTypes = 'get-integration-types',
	GetIntegrationTypeFields = 'get-integration-type-fields',
	GetIntegrations = 'get-integrations',
	GetTriggers = 'get-triggers',
	GetTriggerTypes = 'get-trigger-types',
	GetTriggerDefinition = 'get-trigger-definition',
	GetAutomationTrigger = 'get-automation-triggers',
	GetIntegrationsByType = 'get-integration-by-type',
	GetFormatterFunctions = 'get-formatter-functions',
}

export enum TaskExecutionStatus {
	Success = 'success',
	Failed = 'failed',
	Timedout = 'timedout',
	Started = 'started',
	Cancelled = 'cancelled',
	Completed = 'completed',
	Waiting = 'waiting',
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
	type: string
	endpoint?: string
	pipeline_name: string
	integration?: string
	credentials: Record<string, string>
	meta_data: Metadata
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

export type TaskBodyValue = string | FromSource | string[] | FormatterBody | null

export type TaskBody = Record<string, TaskBodyValue>

export interface Metadata {
	icon: string
	node_color: string
}

export type GetAutomationsResponse = Automation[]

export type CreateAutomationRequest = {
	name: string
	manifest: Manifest
}

export type GetAutomationResponse = AutomationData

export type GetAutomationTriggersResponse = Trigger[]

export type GetTaskKindsResponse = {
	tasks: Record<string, TaskKindData[]>
}

export type GetIntegrationsResponse = Integration[]

export type GetIntegrationsByKindsResponse = Integration[]

export type GetIntegrationKindsResponse = string[]

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
}

export enum FieldType {
	Text = 'text',
	Code = 'code',
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
	type: string
	pipeline_name: string
	integration?: string
	credentials: Record<string, string>
	iconUrl?: string
}

export type CreateTriggerRequest = TriggerData[]

export type CreateIntegrationRequest = {
	name: string
	type: string
	secrets: Record<string, string>
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
	func_name: string
	args: Arg[]
}

export type Arg = FromSource | string

interface FromSource {
	key: string
	source: string
}
