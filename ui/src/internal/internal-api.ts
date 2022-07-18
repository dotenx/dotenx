import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL

const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

export enum InternalQueryKey {
	GetTaskBuilderFunctions = 'get-task-builder-functions',
}

export function getTaskBuilderFunctions() {
	return api.get<TaskBuilderFunctionsResponse>('/mini/task')
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
