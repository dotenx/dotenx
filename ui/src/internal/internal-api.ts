import axios from 'axios'
import { ADMIN_API_URL } from '../constants'

const API_URL = process.env.REACT_APP_API_URL

const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

const adminApi = axios.create({
	baseURL: ADMIN_API_URL,
	withCredentials: true,
})

export enum InternalQueryKey {
	GetTaskBuilderFunctions = 'get-task-builder-functions',
	GetAccessToken = 'get-access-token',
}

export function getTaskBuilderFunctions() {
	return api.get<TaskBuilderFunctionsResponse>('/mini/task')
}

export function setAccessToken() {
	return adminApi.post<void>('/auth/access/token/create')
}

export function getAccessToken() {
	return adminApi.get<{ accessToken: string }>('/auth/access/token')
}

export function updateAccessToken() {
	return adminApi.put<void>('/auth/access/token/update')
}

export function deleteAccessToken() {
	return adminApi.delete<void>('/auth/access/token/delete')
}

export interface TaskBuilderFunctionsResponse {
	mini_tasks: MiniTask[]
}

export interface MiniTask {
	type: string
	description: string
	display_name: string
	number_of_params: number
	inputs: InOutPut[] | null
	outputs: InOutPut[]
}

export interface InOutPut {
	name: string
	type: Type
	description: string
}

export enum Type {
	Array = 'array',
	Boolean = 'boolean',
	Float = 'float',
	Integer = 'integer',
	Object = 'object',
	String = 'string',
}
