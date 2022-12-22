// import { api } from '../../api'
import _ from 'lodash'
import { uuid } from '../../utils'

const extensions: Extension[] = [
	{
		id: 'GhhcHy_XQCAGKxUv',
		name: `counter`,
		html: `<div>
<p id="counter">counter: </p>
<button type="button" id="counter-button">add</button>
</div>`,
		js: `let count = 0
const counter = document.getElementById('counter')
const counterButton = document.getElementById('counter-button')

counterButton.addEventListener('click', () => counter.textContent = \`counter: \${++count}\`)`,
		head: '',
	},
]
export const getExtensions = async () => {
	return { data: extensions }
	// return api.get<GetExtensionsResponse>('/extensions')
}

export const getExtension = async (data: { id: string }) => {
	return { data: extensions.find((extension) => extension.id === data.id) }
	// return api.get<GetExtensionsResponse>('/extensions')
}

export const createExtension = async (data: Omit<Extension, 'id'>) => {
	const extension = { id: uuid(), ...data }
	extensions.push(extension)
	return { data: extension }
	// return api.post<void>('/extensions', { name })
}

export const editExtension = async (data: Extension) => {
	const extension = extensions.find((extension) => extension.id === data.id)
	if (extension) {
		extension.name = data.name
		extension.html = data.html
		extension.js = data.js
	}
	return { data: extension }
	// return api.post<void>('/extensions', { name })
}

export const deleteExtension = async (data: { id: string }) => {
	_.remove(extensions, (extension) => extension.id === data.id)
	return new Promise((resolve) => resolve(null))
	// return api.delete<void>(`/extensions/${id}`)
}

// type GetExtensionsResponse = {
// 	extensions: Extension[]
// }

export type Extension = {
	id: string
	name: string
	html: string
	js: string
	head: string
}
