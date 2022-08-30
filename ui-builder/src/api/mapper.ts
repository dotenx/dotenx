import _ from 'lodash'
import { CSSProperties } from 'react'
import { Component } from '../features/canvas-store'
import { camelCaseToKebabCase, kebabCaseToCamelCase } from '../utils'

export const mapStylesToKebabCase = (components: Component[]): any[] => {
	return components.map((component) => ({
		...mapComponentStyleToKebab(component),
		components: mapStylesToKebabCase(component.components),
	}))
}

const mapComponentStyleToKebab = (component: Component) => {
	return {
		...component,
		data: {
			...component.data,
			style: {
				desktop: mapStyleToKebabCase(component.data.style.desktop),
				tablet: mapStyleToKebabCase(component.data.style.tablet),
				mobile: mapStyleToKebabCase(component.data.style.mobile),
			},
		},
	}
}

const mapStyleToKebabCase = (style: CSSProperties): Record<string, string> => {
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

const mapStyleToCamelCase = (style: Record<string, string>): CSSProperties => {
	return _.fromPairs(_.toPairs(style).map(([key, value]) => [kebabCaseToCamelCase(key), value]))
}
