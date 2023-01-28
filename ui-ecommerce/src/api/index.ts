import axios from "axios"
import {
	GetFilesDataResponse,
	GetFormatterFunctionsResponse,
	GetLast24HoursSalesResponse,
	GetMembersSummaryResponse,
	GetProductsSummaryResponse,
	GetProfileResponse,
	GetProjectResponse,
	GetUserGroupsResponse,
} from "./types"
export * from "./types"

export const API_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

export function getFormatterFunctions() {
	return api.get<GetFormatterFunctionsResponse>("/funcs")
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

export function getProject(name: string) {
	return api.get<GetProjectResponse>(`/project/${name}`)
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

export function getLast24HoursSales(projectTag: string, page: number) {
	return api.post<GetLast24HoursSalesResponse | null>(
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
		`/database/query/select/project/${projectTag}/table/members`, //TODO: Use a view
		{ columns: ["email", "name", "total_orders", "monthly_revenue"] },
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

export function getProfile({ projectTag }: { projectTag: string }) {
	return api.get<GetProfileResponse>(`/profile/project/${projectTag}`)
}

export function getUserGroups(projectTag: string) {
	return api.get<GetUserGroupsResponse>(`/user/group/management/project/${projectTag}/userGroup`)
}
