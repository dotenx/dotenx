import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { AnyJson, JsonArray } from '../../utils'
import { Action } from '../elements/actions/action'
import { Element } from '../elements/element'
import { findParent, useElementsStore } from '../elements/elements-store'
import { globalStatesAtom } from '../page/actions'
import { pageParamsAtom } from '../page/top-bar'
import { useSelectedElement } from '../selection/use-selected-component'
import { InteliStateValue } from '../ui/intelinput'
import { getStateNames } from './data-editor'
import { findPropertyPaths, Property, PropertyKind, useDataSourceStore } from './data-source-store'
import { usePageStates } from './page-states'

export const useGetStates = () => {
	const element = useSelectedElement()!
	const pageStates = usePageStates((store) => store.states)
	const repeatedState = element.repeatFrom?.name
		? _.get(pageStates, element.repeatFrom.name.replace('$store.', ''))
		: null
	const repeatedSample = _.isArray(repeatedState) ? repeatedState[0] : null
	const { elements } = useElementsStore((store) => ({
		elements: store.elements,
	}))
	const { dataSources } = useDataSourceStore((store) => ({
		dataSources: store.sources,
		addDataSource: store.add,
	}))
	const repeatedParent = findRepeatedParent(element, elements)
	const repeatedProperties = findPropertyPaths(repeatedSample)
	let passedProperties: { kind: PropertyKind; name: string }[] = []
	if (repeatedParent && repeatedParent.repeatFrom?.name) {
		const parentState = _.get(
			pageStates,
			repeatedParent.repeatFrom.name.replace('$store.', '')
		) as JsonArray
		if (parentState) {
			passedProperties = findPropertyPaths(parentState[0]).map((property) => ({
				kind: property.kind,
				name: `${repeatedParent.repeatFrom?.iterator}${property.path}`,
			}))
		}
	}
	const pageParams = useAtomValue(pageParamsAtom)
	const mutableStates = useGetMutableStates()

	const states = [
		...mutableStates,
		...dataSources
			.map((source) =>
				source.properties.map((property) => ({
					kind: property.kind,
					name: `$store.${source.stateName}${property.path}`,
				}))
			)
			.flat(),
		...(element.repeatFrom
			? repeatedProperties.map((property) => ({
					kind: property.kind,
					name: `${element.repeatFrom?.iterator}${property.path}`,
			  }))
			: []),
		...passedProperties,
		...pageParams.map((param) => ({ kind: PropertyKind.String, name: `$store.url.${param}` })),
	]

	return states.filter((state) => !!state.name)
}

export const useGetMutableStates = () => {
	const elements = useElementsStore((store) => store.elements)
	const globalStates = useAtomValue(globalStatesAtom)
	const dataSources = useDataSourceStore((store) => store.sources)
	const sourceStates = dataSources
		.flatMap((source) => source.onSuccess ?? [])
		.filter((a): a is Action & { stateName: InteliStateValue } => 'stateName' in a)
		.map((action) => action.stateName.value)
		.filter((stateName) => !!stateName)
	return _.uniq(
		getStateNames(elements)
			.filter((stateName) => !!stateName)
			.concat(sourceStates)
			.map((stateName) =>
				stateName.includes('$store.') ? stateName : `$store.page.${stateName}`
			)
			.concat(globalStates.map((state) => `$store.global.${state}`))
	).map((stateName) => ({
		kind: PropertyKind.Unknown,
		name: stateName,
	}))
}

const findRepeatedParent = (element: Element, elements: Element[]): Element | null => {
	const parent = findParent(element.id, elements)
	if (!parent) return null
	if (parent.repeatFrom) return parent
	return findRepeatedParent(parent, elements)
}

export const findPropertyPathsInner = (object: AnyJson, basePath: string): Property[] => {
	if (_.isArray(object)) {
		const arraySampleItem = object[0]
		const newPath = `${basePath}[]`
		const arraySampleItemPaths = _.isObject(arraySampleItem)
			? findPropertyPathsInner(arraySampleItem, newPath)
			: []
		return [{ kind: PropertyKind.Array, path: newPath }, ...arraySampleItemPaths]
	}
	if (_.isString(object)) return [{ kind: PropertyKind.String, path: basePath }]
	if (_.isNumber(object)) return [{ kind: PropertyKind.Number, path: basePath }]
	if (_.isBoolean(object)) return [{ kind: PropertyKind.Boolean, path: basePath }]
	if (_.isNull(object) || _.isUndefined(object))
		return [{ kind: PropertyKind.Unknown, path: basePath }]

	const paths = _.toPairs(object)
		.map(([key, value]) => findPropertyPathsInner(value, `${basePath}.${key}`))
		.flat()
	return paths
}

export const useDataSourceStates = () => {
	const pageStates = usePageStates((store) => store.states)
	const states = _.flatMap(pageStates, (value, key) => findPropertyPathsInner(value, key)).map(
		(state) => state.path
	)
	return states
}
