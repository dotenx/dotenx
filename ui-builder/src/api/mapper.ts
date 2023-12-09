import { produce } from 'immer'
import _ from 'lodash'
import { CSSProperties } from 'react'
import { Element } from '../features/elements/element'
import { CustomSelectorStyle, CustomStyle, SelectorStyle, Style } from '../features/elements/style'
import { camelCaseToKebabCase, kebabCaseToCamelCase } from '../utils'
import { BackendCustomSelectorStyle, BackendSelectorStyle } from './types'

export const mapStylesToKebabCase = (elements: Element[]): Element[] => {
	return elements.map(mapElementStyleToKebab)
}
const mapElementStyleToKebab = (element: Element): Element => {
	return produce(element, (draft) => {
		draft.style = {
			desktop: element.style.desktop && mapSelectorStyleToKebabCase(element.style.desktop),
			tablet: element.style.tablet && mapSelectorStyleToKebabCase(element.style.tablet),
			mobile: element.style.mobile && mapSelectorStyleToKebabCase(element.style.mobile),
		}
		if (element.children) draft.children = mapStylesToKebabCase(element.children)
	})
}
export const mapSelectorStyleToKebabCase = (
	selectorStyle: SelectorStyle
): Record<string, Record<string, string>> => {
	return _.fromPairs(
		_.toPairs(selectorStyle).map(([selector, style]) => [selector, mapStyleToKebabCase(style)])
	)
}

export const mapCustomSelectorStyleToKebabCase = (
	selectorStyle: CustomSelectorStyle
): Record<string, Record<string, string>> => {
	return _.fromPairs(
		_.toPairs(selectorStyle).map(([selector, style]) => [
			selector,
			mapStyleToKebabCase(style ?? {}),
		])
	)
}

export const mapStyleToKebabCase = (style: CSSProperties): Record<string, string> => {
	return _.fromPairs(_.toPairs(style).map(([key, value]) => [camelCaseToKebabCase(key), value]))
}

export const mapStyleToKebabCaseStyle = (style: Style) => {
	return {
		desktop: style.desktop && mapSelectorStyleToKebabCase(style.desktop),
		tablet: style.tablet && mapSelectorStyleToKebabCase(style.tablet),
		mobile: style.mobile && mapSelectorStyleToKebabCase(style.mobile),
	}
}

export const mapCustomStyleToKebabCaseStyle = (style: CustomStyle) => {
	return {
		desktop: style.desktop && mapSelectorStyleToKebabCase(style.desktop),
		tablet: style.tablet && mapSelectorStyleToKebabCase(style.tablet),
		mobile: style.mobile && mapSelectorStyleToKebabCase(style.mobile),
	}
}

export const mapStylesToCamelCase = (elements: Element[]): Element[] => {
	return elements.map(mapElementStyleToCamel)
}
const mapElementStyleToCamel = (element: Element): Element => {
	return produce(element, (draft) => {
		draft.style = {
			desktop:
				element.style.desktop &&
				mapSelectorStyleToCamelCase(element.style.desktop as BackendSelectorStyle),
			tablet:
				element.style.tablet &&
				mapSelectorStyleToCamelCase(element.style.tablet as BackendSelectorStyle),
			mobile:
				element.style.mobile &&
				mapSelectorStyleToCamelCase(element.style.mobile as BackendSelectorStyle),
		}
		if (element.children) draft.children = mapStylesToCamelCase(element.children)
	})
}
export const mapSelectorStyleToCamelCase = (style: BackendSelectorStyle): SelectorStyle => {
	return _.fromPairs(
		_.toPairs(style).map(([key, value]) => [
			key,
			_.fromPairs(_.toPairs(value).map(([key, value]) => [kebabCaseToCamelCase(key), value])),
		])
	)
}
export const mapCustomSelectorStyleToCamelCase = (
	style: BackendCustomSelectorStyle
): CustomSelectorStyle => {
	return _.fromPairs(
		_.toPairs(style).map(([key, value]) => [
			key,
			_.fromPairs(_.toPairs(value).map(([key, value]) => [kebabCaseToCamelCase(key), value])),
		])
	)
}
export const mapStyleToCamelCaseStyle = (style: Style) => {
	return {
		desktop:
			style.desktop && mapSelectorStyleToCamelCase(style.desktop as BackendSelectorStyle),
		tablet: style.tablet && mapSelectorStyleToCamelCase(style.tablet as BackendSelectorStyle),
		mobile: style.mobile && mapSelectorStyleToCamelCase(style.mobile as BackendSelectorStyle),
	}
}

export const mapCustomStyleToCamelCaseStyle = (style: CustomStyle) => {
	return {
		desktop:
			style.desktop &&
			mapCustomSelectorStyleToCamelCase(style.desktop as BackendCustomSelectorStyle),
		tablet:
			style.tablet &&
			mapCustomSelectorStyleToCamelCase(style.tablet as BackendCustomSelectorStyle),
		mobile:
			style.mobile &&
			mapCustomSelectorStyleToCamelCase(style.mobile as BackendCustomSelectorStyle),
	}
}
