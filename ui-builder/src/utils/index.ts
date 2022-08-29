import { AxiosRequestHeaders } from 'axios'
import produce from 'immer'
import { customAlphabet } from 'nanoid'

/**
 * Insert an item into an array at a specific index and returns it.
 * this function does not mutate the original array
 */
export function withInsert(array: string[], where: number, item: string) {
	return produce(array, (draft) => {
		draft.splice(where, 0, item)
	})
}

/**
 * Parse a json string into axios headers object
 */
export function safeParseToHeaders(value: string) {
	try {
		return JSON.parse(value) as AxiosRequestHeaders
	} catch (e) {
		return {}
	}
}

export function safeParseToJson(value: string) {
	try {
		return JSON.parse(value) as AnyJson
	} catch (e) {
		return null
	}
}

export function uuid() {
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
	const nanoid = customAlphabet(alphabet, 16)
	return nanoid()
}

export function camelCaseToKebabCase(str: string) {
	return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}

export function kebabCaseToCamelCase(str: string) {
	return str.replace(/-./g, (x) => x[1].toUpperCase())
}

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap
export type JsonMap = { [key: string]: AnyJson }
export type JsonArray = AnyJson[]
