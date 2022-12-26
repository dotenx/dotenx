import { api } from '../../api'

export const getExtensions = ({ projectTag }: { projectTag: string }) => {
	return api.get<Extension[] | null>(`/uibuilder/project/${projectTag}/extension`)
}

export const getExtension = ({ projectTag, name }: { projectTag: string; name: string }) => {
	return api.get<Extension>(`/uibuilder/project/${projectTag}/extension/${name}`)
}

export const createExtension = ({ projectTag, data }: { projectTag: string; data: Extension }) => {
	return api.post<void>(`/uibuilder/project/${projectTag}/extension`, data)
}

export const editExtension = createExtension

export const deleteExtension = ({ projectTag, name }: { projectTag: string; name: string }) => {
	return api.delete<void>(`/uibuilder/project/${projectTag}/extension/${name}`)
}

export enum InputKind {
	Text = 'text',
}

export type Extension = {
	name: string
	category: string
	content: {
		inputs: { name: string; kind: InputKind }[]
		outputs: { name: string }[]
		html: string
		js: string
		head: string
	}
}
