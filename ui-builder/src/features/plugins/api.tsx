// import { api } from '../../api'
import _ from 'lodash'
import { uuid } from '../../utils'

const plugins: Plugin[] = _.range(10).map(() => {
	const id = uuid()
	return { id, name: `Plugin ${id}` }
})

export const getPlugins = async () => {
	return { data: plugins }
	// return api.get<GetPluginsResponse>('/plugins')
}

export const getPlugin = async (data: { id: string }) => {
	return { data: plugins.find((plugin) => plugin.id === data.id) }
	// return api.get<GetPluginsResponse>('/plugins')
}

export const createPlugin = async (data: { name: string }) => {
	const plugin = { id: uuid(), name: data.name }
	plugins.push(plugin)
	return new Promise((resolve) => resolve(null))
	// return api.post<void>('/plugins', { name })
}

export const deletePlugin = async (data: { id: string }) => {
	_.remove(plugins, (plugin) => plugin.id === data.id)
	return new Promise((resolve) => resolve(null))
	// return api.delete<void>(`/plugins/${id}`)
}

// type GetPluginsResponse = {
// 	plugins: Plugin[]
// }

export type Plugin = {
	id: string
	name: string
}
