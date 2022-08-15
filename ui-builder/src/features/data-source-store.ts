import _ from 'lodash'
import create from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface DataSourceState {
	sources: DataSource[]
	add: (source: DataSource) => void
	edit: (id: string, source: DataSource) => void
	remove: (id: string) => void
}

export const useDataSourceStore = create<DataSourceState>()(
	immer((set) => ({
		sources: [],
		add: (source: DataSource) => {
			set((state) => {
				state.sources.push(source)
			})
		},
		edit: (id, source) => {
			set((state) => {
				const founded = state.sources.find((source) => source.id === id)
				if (!founded) return console.error('data source not found')
				founded.stateName = source.stateName
				founded.properties = source.properties
				founded.url = source.url
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
		.map(([key, value]) => findInnerPropertyPaths(value, `${basePath} - ${key}`))
		.flat()
	return paths
}

export interface DataSource {
	id: string
	stateName: string
	properties: Property[]
	url: string
}

interface Property {
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

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap
export interface JsonMap {
	[key: string]: AnyJson
}
export type JsonArray = AnyJson[]
