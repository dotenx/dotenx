import _ from 'lodash'
import { CSSProperties } from 'react'
import { Component, SelectorStyle } from '../features/canvas-store'
import { camelCaseToKebabCase, kebabCaseToCamelCase } from '../utils'
import { BackendSelectorStyle } from './types'

export const mapStylesToKebabCase = (components: Component[]): any[] => {
	return components.map((component) => ({
		...mapComponentStyleToKebab(component),
		components: mapStylesToKebabCase(component.components),
	}))
}

const mapComponentStyleToKebab = (component: Component) => {
	const style = component.data.style

	return {
		...component,
		data: {
			...component.data,
			style: {
				desktop: mapSelectorStyleToKebabCase(style.desktop),
				tablet: mapSelectorStyleToKebabCase(style.tablet),
				mobile: mapSelectorStyleToKebabCase(style.mobile),
			},
		},
	}
}

export const mapSelectorStyleToKebabCase = (selectorStyle: SelectorStyle) => {
	return _.fromPairs(
		_.toPairs(selectorStyle).map(([selector, style]) => [selector, mapStyleToKebabCase(style)])
	)
}

export const mapStyleToKebabCase = (style: CSSProperties): Record<string, string> => {
	return _.fromPairs(_.toPairs(style).map(([key, value]) => [camelCaseToKebabCase(key), value]))
}

export const mapStylesToCamelCase = (components: any[]): Component[] => {
	return components.map((component) => ({
		...mapComponentStyleToCamelCase(component),
		components: mapStylesToCamelCase(component.components),
	}))
}

const mapComponentStyleToCamelCase = (component: any) => {
	return {
		...component,
		data: {
			...component.data,
			style: {
				desktop: mapStyleToCamelCase(component.data.style.desktop),
				tablet: mapStyleToCamelCase(component.data.style.tablet),
				mobile: mapStyleToCamelCase(component.data.style.mobile),
			},
		},
	}
}

export const mapStyleToCamelCase = (style: BackendSelectorStyle): SelectorStyle => {
	return _.fromPairs(
		_.toPairs(style).map(([key, value]) => [
			key,
			_.fromPairs(_.toPairs(value).map(([key, value]) => [kebabCaseToCamelCase(key), value])),
		])
	)
}
