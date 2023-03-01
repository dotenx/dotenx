import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

const request = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

const getProject = ({ name }: { name: string }) =>
	request.get<{
		name: string
		description: string
		tag: string
	}>(`/project/${name}`)

export const api = {
	getProject,
}
