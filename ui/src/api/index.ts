import axios from 'axios'
import {
	AddColumnRequest,
	CreateAutomationRequest,
	CreateIntegrationRequest,
	CreateProjectRequest,
	CreateTableRequest,
	CreateTriggerRequest,
	Execution,
	GetAutomationExecutionsResponse,
	GetAutomationResponse,
	GetAutomationsResponse,
	GetAutomationTriggersResponse,
	GetColumnsResponse,
	GetExecutionResultResponse,
	GetFormatterFunctionsResponse,
	GetIntegrationKindFieldsResponse,
	GetIntegrationKindsResponse,
	GetIntegrationsByKindsResponse,
	GetIntegrationsResponse,
	GetProjectResponse,
	GetProjectsResponse,
	GetProviderResponse,
	GetProvidersResponse,
	GetTableRecordsRequest,
	GetTablesResponse,
	GetTaskFieldsResponse,
	GetTaskKindsResponse,
	GetTriggerDefinitionResponse,
	GetTriggerKindsResponse,
	GetTriggersResponse,
	GetUserManagementDataResponse,
	Provider,
	StartAutomationRequest,
} from './types'
export * from './types'

export const API_URL = process.env.REACT_APP_API_URL

const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

export function createAutomation(payload: CreateAutomationRequest) {
	return api.post<void>('/pipeline', payload)
}

export function createAutomationYaml(payload: string) {
	return api.post<{ name: string }>('/pipeline', payload, {
		headers: { accept: 'application/x-yaml' },
	})
}

export function updateAutomation(payload: CreateAutomationRequest) {
	return api.put<void>('/pipeline', payload)
}

export function getAutomations() {
	return api.get<GetAutomationsResponse>('/pipeline')
}

export function getAutomation(name: string) {
	return api.get<GetAutomationResponse>(`/pipeline/name/${name}`)
}

export function getAutomationYaml(name: string) {
	return api.get<string>(`/pipeline/name/${name}`, { headers: { accept: 'application/x-yaml' } })
}

export function startAutomation(automationName: string, payload: StartAutomationRequest = {}) {
	return api.post<{ id: number } | Record<string, unknown>>(
		`/execution/name/${automationName}/start`,
		payload
	)
}

export function deleteAutomation(name: string) {
	return api.delete<void>(`/pipeline/name/${name}`)
}

export function createIntegration(payload: CreateIntegrationRequest) {
	return api.post<void>('/integration', payload)
}

export function getIntegrations() {
	return api.get<GetIntegrationsResponse>(`/integration`)
}

export function getIntegrationKinds() {
	return api.get<GetIntegrationKindsResponse>('/integration/avaliable')
}

export function getIntegrationsByKinds(kinds: string[]) {
	const typesQuery = kinds.map((type) => `type=${type}&`)
	return api.get<GetIntegrationsByKindsResponse>(`/integration?${typesQuery}`)
}

export function getIntegrationKindFields(kind: string) {
	return api.get<GetIntegrationKindFieldsResponse>(`/integration/type/${kind}/fields`)
}

export function deleteIntegration(name: string) {
	return api.delete<void>(`/integration/name/${name}`)
}

export function createTrigger(payload: CreateTriggerRequest) {
	return api.post<void>('/trigger', payload)
}

export function updateTrigger(payload: CreateTriggerRequest) {
	return api.put<void>('/trigger', payload)
}

export function getTriggers() {
	return api.get<GetTriggersResponse>('/trigger')
}

export function getAutomationTriggers(name: string) {
	return api.get<GetAutomationTriggersResponse>(`/trigger`, { params: { pipeline: name } })
}

export function getTriggerKinds() {
	return api.get<GetTriggerKindsResponse>('/trigger/avaliable')
}

export function getTriggerDefinition(kind: string) {
	return api.get<GetTriggerDefinitionResponse>(`/trigger/type/${kind}/definition`)
}

export function deleteTrigger(name: string, automationName: string) {
	return api.delete<void>(`/trigger/name/${name}?pipeline=${automationName}`)
}

export function getTaskKinds() {
	return api.get<GetTaskKindsResponse>('/task')
}

export function getTaskFields(kind: string) {
	return api.get<GetTaskFieldsResponse>(`/task/${kind}/fields`)
}

export function getExecutionResult(executionId: string, taskName: string) {
	return api.get<GetExecutionResultResponse>(
		`/execution/id/${executionId}/task_name/${taskName}/result`
	)
}

export function getAutomationExecutions(name: string) {
	return api.get<GetAutomationExecutionsResponse>(`/pipeline/name/${name}/executions`)
}

export function activateAutomation(name: string) {
	return api.get<void>(`/pipeline/name/${name}/activate`)
}

export function deactivateAutomation(name: string) {
	return api.get<void>(`/pipeline/name/${name}/deactivate`)
}

export function getExecution(id: string) {
	return api.get<Execution>(`/execution/id/${id}/details`)
}

export function createProvider(payload: Provider) {
	return api.post<void>('/oauth/user/provider', payload)
}

export function getProviders() {
	return api.get<GetProvidersResponse>('/oauth/user/provider/list')
}

export function getProvider(name: string) {
	return api.get<GetProviderResponse>(`/oauth/user/provider/${name}`)
}

export function deleteProvider(name: string) {
	return api.delete<void>(`/oauth/user/provider/${name}`)
}

export function getFormatterFunctions() {
	return api.get<GetFormatterFunctionsResponse>('/funcs')
}

export function createProject(payload: CreateProjectRequest) {
	return api.post<void>('/project', payload)
}

export function getProjects() {
	return api.get<GetProjectsResponse>('/project')
}

export function getProject(name: string) {
	return api.get<GetProjectResponse>(`/project/${name}`)
}

export function getTables(projectName: string) {
	return api.get<GetTablesResponse>(`/database/project/${projectName}/table`)
}

export function createTable(projectName: string, payload: CreateTableRequest) {
	return api.post<void>('/database/table', { projectName, ...payload })
}

export function addColumn(projectName: string, tableName: string, payload: AddColumnRequest) {
	return api.post<void>('/database/table/column', { projectName, tableName, ...payload })
}

export function deleteTable(projectName: string, tableName: string) {
	return api.delete<void>(`/database/project/${projectName}/table/${tableName}`)
}

export function deleteProject(projectName: string) {
	return api.delete<void>(`/project/${projectName}`)
}

export function deleteColumn(projectName: string, tableName: string, columnName: string) {
	return api.delete<void>(
		`/database/project/${projectName}/table/${tableName}/column/${columnName}`
	)
}

export function getTableRecords(
	projectTag: string,
	tableName: string,
	payload: GetTableRecordsRequest
) {
	return api.post<Record<string, string>[] | null>(
		`/database/query/select/project/${projectTag}/table/${tableName}`,
		payload
	)
}

export function getColumns(projectName: string, tableName: string) {
	return api.get<GetColumnsResponse>(`/database/project/${projectName}/table/${tableName}/column`)
}

export function getUserManagementData(projectTag: string) {
	return api.post<GetUserManagementDataResponse | null>(
		`/database/query/select/project/${projectTag}/table/user_info`,
		{ columns: ['account_id', 'created_at', 'email', 'fullname'] }
	)
}

export function getTemplateEndpointFields(templateName: string) {
	return api.get<Record<string, string>>(`/pipeline/template/name/${templateName}`)
}

export function getInteractionEndpointFields(interactionName: string) {
	return api.get<string[]>(`/pipeline/interaction/name/${interactionName}`)
}
