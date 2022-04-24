export enum QueryKey {
	GetAutomations = 'get-automation',
	GetTasks = 'get-tasks',
	GetTaskFields = 'get-task-fields',
	GetAutomation = 'get-automation',
	GetResult = 'get-result',
	GetExecutions = 'get-executions',
	GetIntegrationTypes = 'get-integration-types',
	GetIntegrationTypeFields = 'get-integration-type-fields',
	GetIntegrations = 'get-integrations',
	GetTriggers = 'get-triggers',
	GetTriggerTypes = 'get-trigger-types',
	GetTriggerDefinition = 'get-trigger-definition',
	GetAutomationTrigger = 'get-automation-triggers',
	GetIntegrationsByType = 'get-integration-by-type',
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
	account_id: string
	type: string
	endpoint: string
	pipeline_name: string
	integration: string
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
}

export interface Manifest {
	triggers: Record<string, { type: string }>
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

export type TaskBody = Record<string, string | { source: string; key: string }>

export interface Metadata {
	icon: string
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
	secrets: { key: string; name: string }[]
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
		Key: string
		Type: string
	}[]
	outputs: TaskTriggerOutput[]
}

export interface GetTaskFieldsResponse {
	fields: {
		key: string
		type: string
	}[]
	integration_types: string[]
	outputs: TaskTriggerOutput[]
}

export interface GetExecutionResultResponse {
	status: TaskExecutionStatus
	log: string
	return_value: string
}

export type GetAutomationExecutionsResponse = {
	Id: number
	StartedAt: string
	InitialData: unknown | null
}[]

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
