import axios from 'axios'
export const API_URL = process.env.GATSBY_API_URL

const api = axios.create({
	baseURL: API_URL,
})

export function getPipelines() {
	return api.get<Pipeline[]>('/pipeline')
}

export function addPipeline(payload: AddPipelinePayload) {
	return api.post<void>('/pipeline', payload)
}

export function startPipeline(payload: StartPipelinePayload) {
	return api.post<void>(`/execution/ep/${payload.endpoint}/start`, {})
}

export function activatePipeline(payload: ActivatePipelinePayload) {
	return api.post<void>(`/pipeline/name/${payload.name}/version/${payload.version}/activate`)
}

export function getTasks() {
	return api.get<TasksData>('/task')
}

export function getTaskFields(taskName: string) {
	return api.get<TaskFields>(`/task/${taskName}/fields`)
}

export function getPipeline(name: string, version: number) {
	return api.get<PipelineVersionData>(`/pipeline/name/${name}/version/${version}`)
}

export function getResult(executionId: string, taskName: string) {
	return api.get<TaskResult>(`/execution/id/${executionId}/task_name/${taskName}/result`)
}

export function getExecutions(pipelineName: string) {
	return api.get<Execution[]>(`/pipeline/name/${pipelineName}/executions`)
}

export enum QueryKey {
	GetPipelines = 'get-pipelines',
	GetTasks = 'get-tasks',
	GetTaskFields = 'get-task-fields',
	GetPipeline = 'get-pipeline',
	GetResult = 'get-result',
	GetExecutions = 'get-executions',
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

export interface Execution {
	Id: number
	PipelineVersionId: number
	StartedAt: string
	InitialData: unknown | null
}

export interface PipelineEventMessage {
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

export interface PipelineVersionData {
	fromVersion: number
	version: number
	serviceAccount: string
	endpoint: string
	manifest: Manifest
}

export interface TaskFields {
	fields: {
		key: string
		type: string
	}[]
}

export interface TasksData {
	tasks: string[]
}

export interface ActivatePipelinePayload {
	name: string
	version: number
}

export interface StartPipelinePayload {
	endpoint: string
}

export interface Pipeline {
	name: string
	endpoint: string
}

export interface AddPipelinePayload {
	name: string
	fromVersion: number
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
	body: Record<string, string>
}
