import { AxiosRequestHeaders } from 'axios'
import produce from 'immer'

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

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap
export type JsonMap = { [key: string]: AnyJson }
export type JsonArray = AnyJson[]
