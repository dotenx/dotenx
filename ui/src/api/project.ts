import { api } from "./index"

export const createProject = (data: CreateProjectRequest) => {
	return api.post("/project", data)
}

export const getProjects = () => {
	return api.get<Project[]>("/project")
}

export const deleteProject = ({ projectTag }: { projectTag: string }) => {
	return api.delete(`/project/tag/${projectTag}`)
}

export type CreateProjectRequest = Project

export interface Project {
	name: string
	tag?: string
	description?: string
	hasDatabase: boolean
}
