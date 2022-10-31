import _ from 'lodash'
import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { AnyJson } from '../../utils'
import { Action } from '../elements/actions/action'
import { IntelinputValue } from '../ui/intelinput'

type EditDataSource = Omit<DataSource, 'id'>

interface DataSourceState {
	sources: DataSource[]
	set: (sources: DataSource[]) => void
	add: (source: DataSource) => void
	edit: (id: string, source: EditDataSource) => void
	remove: (id: string) => void
}

export const useDataSourceStore = create<DataSourceState>()(
	immer((set) => ({
		sources: [],
		set: (sources) => {
			set((state) => {
				state.sources = sources
			})
		},
		add: (source: DataSource) => {
			set((state) => {
				state.sources.push(source)
			})
		},
		edit: (id, source) => {
			set((state) => {
				const founded = state.sources.find((source) => source.id === id)
				if (!founded) return console.error('data source not found')
				_.assign(founded, { ...source, id: founded.id })
			})
		},
		remove: (id) => {
			set((state) => {
				state.sources = state.sources.filter((source) => source.id !== id)
			})
		},
	}))
)

export const findPropertyPaths = (object: AnyJson) => {
	return findInnerPropertyPaths(object, '')
}

const findInnerPropertyPaths = (object: AnyJson, basePath: string): Property[] => {
	if (_.isArray(object)) return [{ kind: PropertyKind.Array, path: basePath }]
	if (_.isString(object)) return [{ kind: PropertyKind.String, path: basePath }]
	if (_.isNumber(object)) return [{ kind: PropertyKind.Number, path: basePath }]
	if (_.isBoolean(object)) return [{ kind: PropertyKind.Boolean, path: basePath }]
	if (_.isNull(object) || _.isUndefined(object))
		return [{ kind: PropertyKind.Unknown, path: basePath }]

	const paths = _.toPairs(object)
		.map(([key, value]) => findInnerPropertyPaths(value, `${basePath}.${key}`))
		.flat()
	return paths
}

export interface DataSource {
	id: string
	stateName: string
	url: IntelinputValue[]
	method: HttpMethod
	headers: string
	body: string
	fetchOnload: boolean
	properties: Property[]
	onSuccess?: Action[]
	isPrivate?: boolean
}

export enum HttpMethod {
	Get = 'GET',
	Post = 'POST',
	Put = 'PUT',
	Patch = 'PATCH',
	Delete = 'DELETE',
}

export const httpMethods = [
	HttpMethod.Get,
	HttpMethod.Post,
	HttpMethod.Put,
	HttpMethod.Patch,
	HttpMethod.Delete,
]

export interface Property {
	kind: PropertyKind
	path: string
}

export enum PropertyKind {
	Array = 'Array',
	String = 'String',
	Number = 'Number',
	Boolean = 'Boolean',
	Unknown = 'Unknown',
}
