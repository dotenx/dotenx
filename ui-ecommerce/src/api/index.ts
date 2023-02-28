import axios from "axios"
import {
	AddColumnRequest,
	CreateIntegrationRequest,
	CreateTableRequest,
	GetColumnsResponse,
	GetFilesDataResponse,
	GetIntegrationKindFieldsResponse,
	GetIntegrationKindsResponse,
	GetIntegrationsResponse,
	GetLastDaySalesResponse,
	GetMembersSummaryResponse,
	GetProductsSummaryResponse,
	GetProjectResponse,
	GetRecordsResponse,
	GetTableRecordsRequest,
	GetTablesResponse,
	GetUserGroupsResponse,
	RunCustomQueryResponse,
	SetupIntegrationRequest,
	UploadImageRequest,
	UploadImageResponse,
} from "./types"
export * from "./types"

export const API_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

export function getIntegrationKinds() {
	return api.get<GetIntegrationKindsResponse>("/integration/avaliable")
}
export function getIntegrationKindFields(kind: string) {
	return api.get<GetIntegrationKindFieldsResponse>(`/integration/type/${kind}/fields`)
}
export function createIntegration(payload: CreateIntegrationRequest) {
	return api.post<void>("/integration", payload)
}
export function setupIntegration(payload: SetupIntegrationRequest) {
	return api.post<void>("/project/setup/dependent", payload)
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

export function getIntegrations() {
	return api.get<GetIntegrationsResponse>(`/integration`)
}
export function getEmailPipelineList({ tag }: { tag: string; }) {
	return api.get(`/ecommerce/project/${tag}/pipeline/email`)
}
export function activateEmailPipeline({ projectName, pipelineName, action }: { projectName: string, pipelineName: string, action: string }) {
	return api.get(`/pipeline/project/${projectName}/name/${pipelineName}/${action}`)
}
export function getEmailPipelineExecutions({ projectName, pipelineName }: { projectName: string, pipelineName: string }) {
	return api.get(`/pipeline/project/${projectName}/name/${pipelineName}/executions`)
}
export function updateProduct({ productId, tag, payload }: { productId: string, tag: string, payload: any }) {
	return api.put(`/ecommerce/project/${tag}/product/${productId}`, payload)
}

export function deleteEmailPipeline({ projectName, pipelineName }: { projectName: string, pipelineName: string }) {
	return api.delete(`/pipeline/project/${projectName}/name/${pipelineName}`)
}
export function getProject(name: string) {
	return api.get<GetProjectResponse>(`/project/${name}`)
}
export function createProduct({ tag, payload }: { tag: string; payload: any }) {
	return api.post(`/ecommerce/project/${tag}/product`, payload)
}
export function createEmailPipeline({ tag, payload }: { tag: string; payload: any }) {
	return api.post(`/ecommerce/project/${tag}/pipeline/email`, payload)
}
export function updateEmailPipeline({ tag, payload }: { tag: string; payload: any }) {
	return api.put(`/ecommerce/project/${tag}/pipeline/email`, payload)
}
export function getEmailPipelineDetail({ tag, name }: { tag: string; name: string }) {
	return api.get(`/ecommerce/project/${tag}/pipeline/email/${name}`)
}
export function getTables(projectName: string) {
	return api.get<GetTablesResponse>(`/database/project/${projectName}/table`)
}

export function createTable(projectName: string, payload: CreateTableRequest) {
	return api.post<void>("/database/table", { projectName, ...payload })
}

export function addColumn(projectName: string, tableName: string, payload: AddColumnRequest) {
	return api.post<void>("/database/table/column", { projectName, tableName, ...payload })
}

export function uploadFile(projectTag: string, formData: FormData) {
	return api.post<void>(`/objectstore/project/${projectTag}/upload`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	})
}

export function getProductsSummary(projectTag: string, page: number) {
	return api.post<GetProductsSummaryResponse | null>(
		`/database/query/select/project/${projectTag}/table/products`, //TODO: Use a view
		{ columns: ["imageUrl", "name", "sales", "revenue", "price", "status"] },
		{
			headers: {
				page: page,
				size: 10,
			},
		}
	)
}
export function getProductsById(projectTag: string, product_id: string) {
	return api.post(
		`/database/query/select/project/${projectTag}/table/products`,
		{
			columns: [],
			filters: {
				filterSet: [
					{
						key: "id",
						operator: "=",
						value: product_id
					}
				],
			}
		}
	)
}
export function getColumns(projectName: string, tableName: string) {
	return api.get<GetColumnsResponse>(`/database/project/${projectName}/table/${tableName}/column`)
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
export function runCustomQuery(projectTag: string, query: string) {
	return api.post<RunCustomQueryResponse>(`/database/query/arbitrary/project/${projectTag}`, {
		query: query,
	})
}
export function getLast24HoursSales(projectTag: string, page: number) {
	return api.post<GetLastDaySalesResponse | null>(
		`/database/query/select/project/${projectTag}/table/sales`, //TODO: Use a view
		{ columns: ["time", "email", "total"] },
		{
			headers: {
				page: page,
				size: 10,
			},
		}
	)
}

export function getMembersSummary(projectTag: string, page: number) {
	return api.post<GetMembersSummaryResponse | null>(
		`/database/query/select/project/${projectTag}/table/orders`, //TODO: Use a view
		{ columns: ["email", "updated_at"] },
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

export function getUserGroups(projectTag: string) {
	return api.get<GetUserGroupsResponse>(`/user/group/management/project/${projectTag}/userGroup`)
}

export const uploadImage = ({ projectTag, image }: UploadImageRequest) => {
	const formData = new FormData()
	formData.append("file", image)
	formData.append("is_public", "true")
	return api.post<UploadImageResponse>(`/objectstore/project/${projectTag}/upload`, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	})
}
