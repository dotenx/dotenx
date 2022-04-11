import axios from 'axios'
export const API_URL = process.env.REACT_APP_API_URL

const api = axios.create({
	baseURL: API_URL,
})

export function getAutomations() {
	return api.get<Automation[]>('/pipeline')
}

export function addAutomation(payload: AddAutomationPayload) {
	return api.post<void>('/pipeline', payload)
}

export function startAutomation(payload: StartAutomationPayload) {
	return api.post<void>(`/execution/ep/${payload.endpoint}/start`, {})
}

export function getTasks() {
	return api.get<TasksData>('/task')
}

export function getTaskFields(taskType: string) {
	return api.get<TaskFields>(`/task/${taskType}/fields`)
}

export function getAutomation(name: string) {
	return api.get<AutomationData>(`/pipeline/name/${name}`)
}

export function getResult(executionId: string, taskName: string) {
	return api.get<TaskResult>(`/execution/id/${executionId}/task_name/${taskName}/result`)
}

export function getExecutions(automationName: string) {
	return api.get<Execution[]>(`/pipeline/name/${automationName}/executions`)
}

export function getIntegrationTypes() {
	return api.get<string[]>('/integration/avaliable')
}

export function getIntegrationTypeFields(integrationType: string) {
	return api.get<IntegrationTypeFields>(`/integration/type/${integrationType}/fields`)
}

export function getIntegrations() {
	return api.get<IntegrationData[]>(`/integration`)
}

export function addIntegration(payload: AddIntegrationPayload) {
	return api.post<void>('/integration', payload)
}

export function getTriggers() {
	return api.get<TriggerData[]>('/trigger')
}

export function getTriggerTypes() {
	return api.get<AvailableTriggers>('/trigger/avaliable')
}

export function getTriggerDefinition(type: string) {
	return api.get<TriggerDefinition>(`/trigger/type/${type}/definition`)
}

export function addTrigger(payload: AddTriggerPayload) {
	return api.post<void>('/trigger', payload)
}

export function getAutomationTriggers(automationName: string) {
	return api.get<TriggerData[]>(`/trigger`, { params: { pipeline: automationName } })
}

export function deleteAutomation(name: string) {
	return api.delete<void>(`/pipeline/name/${name}`)
}

export function deleteIntegration(name: string) {
	return api.delete<void>(`/integration/name/${name}`)
}

export function deleteTrigger(name: string, automationName: string) {
	return api.delete<void>(`/trigger/name/${name}?pipeline=${automationName}`)
}

export function getIntegrationsByType(types: string[]) {
	const typesQuery = types.map((type) => `type=${type}&`)
	return api.get<IntegrationData[]>(`/integration?${typesQuery}`)
}

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

export enum Status {
	Success = 'success',
	Failed = 'failed',
	Timedout = 'timedout',
	Started = 'started',
	Cancelled = 'cancelled',
	Completed = 'completed',
	Waiting = 'waiting',
}

export enum TaskType {
	Text = 'text',
}

export interface IntegrationTypeFields {
	secrets: string[]
	oauth_provider: string
}

export interface AvailableTriggers {
	triggers: Record<string, TriggerTypeData[]>
}

export interface Output {
	Key: string
	Type: string
}

export interface TriggerTypeData {
	type: string
	icon_url: string
	description: string
}

export interface TriggerData {
	name: string
	account_id: string
	type: string
	endpoint: string
	pipeline_name: string
	integration: string
	credentials: Record<string, string>
	meta_data: Metadata
}

export interface AddTriggerPayload {
	name: string
	type: string
	pipeline_name: string
	integration: string
	credentials: Record<string, string>
	iconUrl?: string
}

export interface TriggerDefinition {
	type: string
	integrations: string[]
	image: string
	credentials: FieldType[]
	outputs: Output[]
}

export interface FieldType {
	Key: string
	Type: string
}

export interface IntegrationData {
	name: string
	account_id: string
	type: string
	url: string
	key: string
	secret: string
	access_token: string
}

export interface AddIntegrationPayload {
	name: string
	type: string
	secrets: Record<string, string>
}

export interface Execution {
	Id: number
	StartedAt: string
	InitialData: unknown | null
}

export interface AutomationEventMessage {
	execution_id: string
	tasks: {
		name: string
		status: Status
	}[]
}

export interface TaskResult {
	status: Status
	log: string
	return_value: string
}

export interface AutomationData {
	serviceAccount: string
	endpoint: string
	manifest: Manifest
}

export interface TaskFields {
	fields: {
		key: string
		type: string
	}[]
	integration_types: string[]
	outputs: Output[]
}

export interface TasksData {
	tasks: Record<string, TaskTypeData[]>
}

export interface TaskTypeData {
	type: string
	description: string
	icon_url: string
}

export interface StartAutomationPayload {
	endpoint: string
}

export interface Automation {
	name: string
	endpoint: string
}

export interface AddAutomationPayload {
	name: string
	manifest: Manifest
}

export interface Manifest {
	triggers: Record<string, Trigger>
	tasks: Tasks
}

export type Tasks = Record<string, Task>

export interface Trigger {
	type: string
}

export interface Task {
	type: string
	executeAfter: Record<string, string[]>
	body: Record<string, string | { source: string; key: string }>
	integration: string
	meta_data?: Metadata
}

export interface Metadata {
	icon: string
}
