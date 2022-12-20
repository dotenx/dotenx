// import { api } from '../../api'
import _ from 'lodash'
import { uuid } from '../../utils'

const plugins: Plugin[] = [
	{
		id: uuid(),
		name: `counter`,
		html: `<div>
<p id="counter">counter: </p>
<button type="button" id="counter-button">add</button>
</div>`,
		js: `let count = 0
const counter = document.getElementById('counter')
const counterButton = document.getElementById('counter-button')

counterButton.addEventListener('click', () => counter.textContent = \`counter: \${++count}\`)`,
	},
]
export const getPlugins = async () => {
	return { data: plugins }
	// return api.get<GetPluginsResponse>('/plugins')
}

export const getPlugin = async (data: { id: string }) => {
	return { data: plugins.find((plugin) => plugin.id === data.id) }
	// return api.get<GetPluginsResponse>('/plugins')
}

export const createPlugin = async (data: Omit<Plugin, 'id'>) => {
	const plugin = { id: uuid(), ...data }
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
	html: string
	js: string
}
