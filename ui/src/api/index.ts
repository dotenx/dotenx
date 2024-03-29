import axios from "axios"
import {
	AddColumnRequest,
	AddRecordRequest,
	CreateAutomationRequest,
	CreateIntegrationRequest,
	CreateProjectRequest,
	CreateTableRequest,
	CreateTriggerRequest,
	CreateUserGroupRequest,
	CreateViewRequest,
	EndpointFields,
	Execution,
	ExportDatabaseResponse,
	GetAutomationExecutionsResponse,
	GetAutomationResponse,
	GetAutomationsResponse,
	GetAutomationTriggersResponse,
	GetBranchesListResponse,
	GetColumnsResponse,
	GetExecutionResultResponse,
	GetFilesDataResponse,
	GetFormatterFunctionsResponse,
	GetGitAccountsResponse,
	GetIntegrationKindFieldsResponse,
	GetIntegrationKindsResponse,
	GetIntegrationsByKindsResponse,
	GetIntegrationsResponse,
	GetProfileResponse,
	GetProjectResponse,
	GetProjectsResponse,
	GetProviderResponse,
	GetProvidersResponse,
	GetRecordsResponse,
	GetRepoListResponse,
	GetTableRecordsRequest,
	GetTablesResponse,
	GetTaskFieldsResponse,
	GetTaskKindsResponse,
	GetTriggerDefinitionResponse,
	GetTriggerKindsResponse,
	GetTriggersResponse,
	GetUserGroupResponse,
	GetUserGroupsResponse,
	GetUserManagementDataResponse,
	GetViewDataResponse,
	GetViewDetailsResponse,
	GetViewsResponse,
	gitProviders,
	Provider,
	RunCustomQueryResponse,
	SetDefaultUserGroupRequest,
	StartAutomationRequest,
	TestTaskRequest,
	TestTaskResponse,
	TestTriggerRequest,
	TestTriggerResponse,
	UpdateRecordRequest,
	UpdateUserGroupRequest,
} from "./types"
export * from "./types"

export const API_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

export function createAutomation({
	projectName,
	payload,
}: {
	projectName: string
	payload: CreateAutomationRequest
}) {
	return api.post<void>(`/pipeline/project/${projectName}`, payload)
}

export function createAutomationYaml({
	payload,
	projectName,
}: {
	projectName: string
	payload: string
}) {
	return api.post<{ name: string }>(`/pipeline/project/${projectName}`, payload, {
		headers: { accept: "application/x-yaml" },
	})
}

export function updateAutomation({
	payload,
	projectName,
}: {
	projectName: string
	payload: CreateAutomationRequest
}) {
	return api.put<void>(`/pipeline/project/${projectName}`, payload)
}

export function getAutomations(projectName: string) {
	return api.get<GetAutomationsResponse>(`/pipeline/project/${projectName}`)
}
export function getTemplateAutomations(name: string, projectName: string) {
	return api.get<GetAutomationsResponse>(
		`/pipeline/project/${projectName}/template/name/${name}/children`
	)
}
export function getAutomation({ name, projectName }: { projectName: string; name: string }) {
	return api.get<GetAutomationResponse>(`/pipeline/project/${projectName}/name/${name}`)
}

export function getAutomationYaml({ name, projectName }: { name: string; projectName: string }) {
	return api.get<string>(`/pipeline/project/${projectName}/name/${name}`, {
		headers: { accept: "application/x-yaml" },
	})
}

export function startAutomation({
	automationName,
	payload = {},
	projectName,
}: {
	projectName: string
	automationName: string
	payload?: StartAutomationRequest
}) {
	return api.post<{ id: number } | Record<string, unknown>>(
		`/execution/project/${projectName}/name/${automationName}/start`,
		payload
	)
}
export function setInteractionUserGroup({
	name,
	payload,
	projectName,
}: {
	projectName: string
	name: string
	payload: any
}) {
	return api.patch(`/pipeline/project/${projectName}/name/${name}/usergroup`, payload)
}
export function setFileUserGroup({
	name,
	payload,
	projectTag,
}: {
	projectTag: string
	name: string
	payload: any
}) {
	return api.patch(`/objectstore/project/${projectTag}/file/${name}/user_groups`, payload)
}
export function setAccess({
	name,
	isPublic,
	projectName,
}: {
	projectName: string
	name: string
	isPublic: boolean
}) {
	return api.patch(`/pipeline/project/${projectName}/name/${name}/access`, {
		isPublic: !isPublic,
	})
}

export function setTableAccess({
	name,
	projectName,
	isPublic,
}: {
	projectName: string
	name: string
	isPublic: boolean
}) {
	return api.patch(`/database/project/${projectName}/table/${name}/access`, {
		isPublic: !isPublic,
	})
}

export function setFilesAccess({
	rowData,
}: {
	rowData: {
		projectTag: string
		name: string
		isPublic: boolean
	}
}) {
	return api.patch(`/objectstore/project/${rowData.projectTag}/file/${rowData.name}/access`, {
		isPublic: !rowData.isPublic,
	})
}

export function deleteAutomation({ name, projectName }: { name: string; projectName: string }) {
	return api.delete<void>(`/pipeline/project/${projectName}/name/${name}`)
}

export function createIntegration(payload: CreateIntegrationRequest) {
	return api.post<void>("/integration", payload)
}

export function getIntegrations() {
	return api.get<GetIntegrationsResponse>(`/integration`)
}

export function getIntegrationKinds() {
	return api.get<GetIntegrationKindsResponse>("/integration/avaliable")
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
	return api.post<void>("/trigger", payload)
}

export function updateTrigger(payload: CreateTriggerRequest) {
	return api.put<void>("/trigger", payload)
}

export function getTriggers() {
	return api.get<GetTriggersResponse>("/trigger")
}

export function getAutomationTriggers(name: string) {
	return api.get<GetAutomationTriggersResponse>(`/trigger`, { params: { pipeline: name } })
}

export function getTriggerKinds() {
	return api.get<GetTriggerKindsResponse>("/trigger/avaliable")
}

export function getTriggerDefinition(kind: string) {
	return api.get<GetTriggerDefinitionResponse>(`/trigger/type/${kind}/definition`)
}

export function deleteTrigger(name: string, automationName: string) {
	return api.delete<void>(`/trigger/name/${name}?pipeline=${automationName}`)
}

export function getTaskKinds() {
	return api.get<GetTaskKindsResponse>("/task")
}

export function getTaskFields(kind: string) {
	return api.get<GetTaskFieldsResponse>(`/task/${kind}/fields`)
}

export function getExecutionResult(executionId: string, taskName: string) {
	return api.get<GetExecutionResultResponse>(
		`/execution/id/${executionId}/task_name/${taskName}/result`
	)
}

export function getAutomationExecutions({
	name,
	projectName,
}: {
	projectName: string
	name: string
}) {
	return api.get<GetAutomationExecutionsResponse>(
		`/pipeline/project/${projectName}/name/${name}/executions`
	)
}

export function activateAutomation({ projectName, name }: { projectName: string; name: string }) {
	return api.get<void>(`/pipeline/project/${projectName}/name/${name}/activate`)
}

export function deactivateAutomation({ name, projectName }: { name: string; projectName: string }) {
	return api.get<void>(`/pipeline/project/${projectName}/name/${name}/deactivate`)
}

export function getExecution(id: string) {
	return api.get<Execution>(`/execution/id/${id}/details`)
}

export function createProvider(payload: Provider) {
	return api.post<void>("/oauth/user/provider", payload)
}

export function getProviders() {
	return api.get<GetProvidersResponse>("/oauth/user/provider/list")
}

export function getProvider(name: string) {
	return api.get<GetProviderResponse>(`/oauth/user/provider/${name}`)
}

export function deleteProvider(name: string) {
	return api.delete<void>(`/oauth/user/provider/${name}`)
}

export function getFormatterFunctions() {
	return api.get<GetFormatterFunctionsResponse>("/funcs")
}

export function createProject(payload: CreateProjectRequest) {
	return api.post<void>("/project", payload)
}

export function getProjects() {
	return api.get<GetProjectsResponse>("/project")
}

export function getProject(name: string) {
	return api.get<GetProjectResponse>(`/project/${name}`)
}

export function getTables(projectName: string) {
	return api.get<GetTablesResponse>(`/database/project/${projectName}/table`)
}

export function getViews(projectName: string) {
	return api.get<GetViewsResponse>(`/database/project/${projectName}/view`)
}

export function getViewDetails({
	projectName,
	viewName,
}: {
	projectName: string
	viewName: string
}) {
	return api.get<GetViewDetailsResponse>(`/database/project/${projectName}/view/${viewName}`)
}

export function getViewData({ projectTag, viewName }: { projectTag: string; viewName: string }) {
	return api.post<GetViewDataResponse>(
		`/database/query/select/project/${projectTag}/view/${viewName}`,
		{}
	)
}

export function deleteView({ projectName, viewName }: { projectName: string; viewName: string }) {
	return api.delete<void>(`/database/project/${projectName}/view/${viewName}`)
}

export function createView(payload: CreateViewRequest) {
	return api.post<void>("/database/view", payload)
}

export function createTable(projectName: string, payload: CreateTableRequest) {
	return api.post<void>("/database/table", { projectName, ...payload })
}
export function exportDatabase(projectName: string, format: string) {
	const jobFormat = format === "dump" ? "pg_dump" : "csv"
	return api.post<ExportDatabaseResponse>(`/database/job/project/${projectName}/result`, {
		job: jobFormat,
	})
}
export function runExportDatabase(projectName: string, format: string) {
	const jobFormat = format === "dump" ? "pg_dump" : "csv"

	return api.post<void>(`/database/job/project/${projectName}/run`, {
		job: jobFormat,
	})
}

export function runCustomQuery(projectTag: string, query: string) {
	return api.post<RunCustomQueryResponse>(`/database/query/arbitrary/project/${projectTag}`, {
		query: query,
	})
}
export function uploadFile(projectTag: string, formData: FormData) {
	return api.post<void>(`/objectstore/project/${projectTag}/upload`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	})
}

export function addColumn(projectName: string, tableName: string, payload: AddColumnRequest) {
	return api.post<void>("/database/table/column", { projectName, tableName, ...payload })
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
	page: number,
	payload: GetTableRecordsRequest
) {
	return api.post<GetRecordsResponse>(
		`/database/query/select/project/${projectTag}/table/${tableName}`,
		payload,
		{
			headers: {
				page: page,
				size: 10,
			},
		}
	)
}

export function getColumns(projectName: string, tableName: string) {
	return api.get<GetColumnsResponse>(`/database/project/${projectName}/table/${tableName}/column`)
}

export function getUserManagementData(projectTag: string, page: number) {
	return api.post<GetUserManagementDataResponse | null>(
		`/database/query/select/project/${projectTag}/table/user_info`,
		{ columns: ["account_id", "created_at", "email", "fullname", "user_group"] },
		{
			headers: {
				page: page,
				size: 10,
			},
		}
	)
}
export function getFiles(projectTag: string) {
	return api.get<GetFilesDataResponse | null>(`/objectstore/project/${projectTag}`)
}

export function getTemplateEndpointFields({
	projectName,
	templateName,
}: {
	projectName: string
	templateName: string
}) {
	return api.get<EndpointFields>(`/pipeline/project/${projectName}/template/name/${templateName}`)
}

export function getInteractionEndpointFields({
	interactionName,
	projectName,
}: {
	interactionName: string
	projectName: string
}) {
	return api.get<EndpointFields>(
		`/pipeline/project/${projectName}/interaction/name/${interactionName}`
	)
}

export function addRecord(projectTag: string, tableName: string, payload: AddRecordRequest) {
	return api.post<void>(
		`/database/query/insert/project/${projectTag}/table/${tableName}`,
		payload
	)
}

export function deleteRecord(projectTag: string, tableName: string, rowId: string) {
	return api.delete<void>(`/database/query/delete/project/${projectTag}/table/${tableName}`, {
		data: {
			rowId,
		},
	})
}

export function updateRecord(
	projectTag: string,
	tableName: string,
	rowId: string,
	payload: UpdateRecordRequest
) {
	return api.put<void>(
		`/database/query/update/project/${projectTag}/table/${tableName}/row/${rowId}`,
		payload
	)
}

export function getProfile({ projectTag }: { projectTag: string }) {
	return api.get<GetProfileResponse>(`/profile/project/${projectTag}`)
}

export function createUserGroup(projectTag: string, payload: CreateUserGroupRequest) {
	return api.post<void>(`/user/group/management/project/${projectTag}/userGroup`, payload)
}

export function updateUserGroup(projectTag: string, payload: UpdateUserGroupRequest) {
	return api.put<void>(`/user/group/management/project/${projectTag}/userGroup`, payload)
}

export function getUserGroups(projectTag: string) {
	return api.get<GetUserGroupsResponse>(`/user/group/management/project/${projectTag}/userGroup`)
}

export function deleteUserGroup(projectTag: string, userGroupName: string) {
	return api.delete(
		`/user/group/management/project/${projectTag}/userGroup/name/${userGroupName}`
	)
}

export function setDefaultUserGroup(projectTag: string, payload: SetDefaultUserGroupRequest) {
	return api.post(`/user/group/management/project/${projectTag}/userGroup/default`, payload)
}

export function getUserGroup(projectTag: string, userGroupName: string) {
	return api.get<GetUserGroupResponse>(
		`/user/group/management/project/${projectTag}/userGroup?name=${userGroupName}`
	)
}

export function getGitAccounts(provider: gitProviders) {
	return api.get<GetGitAccountsResponse>(`/git/integration/provider/${provider}/account`)
}

export function getRepoList({ provider, gitId }: { provider: gitProviders; gitId: string }) {
	return api.post<GetRepoListResponse>(`/git/integration/provider/${provider}/repository`, {
		git_account_id: gitId,
	})
}
export function exportProject({
	provider,
	gitId,
	projectName,
	repoName,
	branchName,
	commitMessage,
}: {
	provider: gitProviders
	gitId: string
	projectName: string
	repoName: string
	branchName: string
	commitMessage: string
}) {
	return api.post(`/git/integration/provider/${provider}/export`, {
		git_account_id: gitId,
		project_name: projectName,
		repo_full_name: repoName,
		branch_name: branchName,
		commit_message: commitMessage,
	})
}

export function importProject({
	provider,
	gitId,
	projectName,
	repoName,
	branchName,
}: {
	provider: gitProviders
	gitId: string
	projectName: string
	repoName: string
	branchName: string
}) {
	return api.post(`/git/integration/provider/${provider}/import`, {
		git_account_id: gitId,
		project_name: projectName,
		repo_full_name: repoName,
		branch_name: branchName,
	})
}

export function getBranchList({
	provider,
	gitId,
	repoName,
}: {
	provider: gitProviders
	gitId: string
	repoName: string
}) {
	return api.post<GetBranchesListResponse>(`/git/integration/provider/${provider}/branch`, {
		git_account_id: gitId,
		repo_full_name: repoName,
	})
}

export function testTask(payload: TestTaskRequest) {
	return api.post<TestTaskResponse>(`/execution/type/task/step/task`, {
		...payload,
		flat: true,
	})
}

export function testTrigger(payload: TestTriggerRequest) {
	return api.post<TestTriggerResponse>(`/execution/type/trigger/step/trigger`, {
		...payload,
		flat: true,
	})
}
